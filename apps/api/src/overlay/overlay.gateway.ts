import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { randomUUID } from "node:crypto";
import { Server, Socket } from "socket.io";
import { overlayCommandSchema, type OverlayCommand } from "@beta/shared";
import { EventsService } from "../events/events.service";
import { OverlayKeyService } from "./overlay-key.service";
import { DashboardGateway } from "./dashboard.gateway";

interface OverlaySocketContext {
  channelId: string;
  streamerId: string;
  sessionId: string;
}

@WebSocketGateway({
  namespace: "/overlay",
  cors: {
    origin: "*"
  }
})
export class OverlayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OverlayGateway.name);
  private readonly socketState = new Map<string, OverlaySocketContext>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly overlayKeyService: OverlayKeyService,
    private readonly eventsService: EventsService,
    private readonly dashboardGateway: DashboardGateway
  ) {}

  async handleConnection(client: Socket) {
    const key =
      (typeof client.handshake.auth?.key === "string" ? client.handshake.auth.key : null) ??
      (typeof client.handshake.query?.key === "string" ? client.handshake.query.key : null);

    if (!key) {
      client.disconnect();
      return;
    }

    const credential = await this.overlayKeyService.validateOverlayKey(key);
    if (!credential) {
      client.disconnect();
      return;
    }

    const session = await this.eventsService.getOrCreateSession(
      credential.channelId,
      credential.channel.streamerProfileId
    );

    this.socketState.set(client.id, {
      channelId: credential.channelId,
      streamerId: credential.channel.streamerProfileId,
      sessionId: session.id
    });

    client.join(credential.channelId);
    client.emit("session", { sessionId: session.id, channelId: credential.channelId });

    await this.eventsService.recordSystemEvent("overlay_connected", {
      requestId: `ws_${randomUUID()}`,
      channelId: credential.channelId,
      streamerId: credential.channel.streamerProfileId,
      sessionId: session.id,
      payload: { source: "socket_connection" },
      ip: client.handshake.address,
      userAgent: client.handshake.headers["user-agent"]
    });

    this.dashboardGateway.broadcast("overlay_status", {
      channelId: credential.channelId,
      status: "connected",
      sessionId: session.id,
      at: new Date().toISOString()
    });
  }

  async handleDisconnect(client: Socket) {
    const context = this.socketState.get(client.id);
    this.socketState.delete(client.id);

    if (!context) {
      return;
    }

    await this.eventsService.markDisconnected(context.sessionId);
    await this.eventsService.recordSystemEvent("overlay_disconnected", {
      requestId: `ws_${randomUUID()}`,
      channelId: context.channelId,
      streamerId: context.streamerId,
      sessionId: context.sessionId,
      payload: { source: "socket_disconnect" }
    });

    this.dashboardGateway.broadcast("overlay_status", {
      channelId: context.channelId,
      status: "disconnected",
      sessionId: context.sessionId,
      at: new Date().toISOString()
    });
  }

  @SubscribeMessage("overlay:heartbeat")
  async onHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { requestId?: string; payload?: Record<string, unknown> }
  ) {
    const context = this.socketState.get(client.id);
    if (!context) {
      return;
    }

    await this.eventsService.recordSystemEvent("overlay_heartbeat", {
      requestId: body.requestId ?? `ws_${randomUUID()}`,
      channelId: context.channelId,
      streamerId: context.streamerId,
      sessionId: context.sessionId,
      payload: body.payload ?? { source: "socket" }
    });

    this.dashboardGateway.broadcast("overlay_heartbeat", {
      channelId: context.channelId,
      sessionId: context.sessionId,
      at: new Date().toISOString()
    });
  }

  async pushAdCommand(channelId: string, command: OverlayCommand): Promise<boolean> {
    const validated = overlayCommandSchema.parse(command);
    const sockets = await this.server.in(channelId).fetchSockets();

    if (sockets.length === 0) {
      this.logger.warn(`No overlay socket connected for channel ${channelId}`);
      return false;
    }

    this.server.to(channelId).emit("ad:command", validated);
    return true;
  }

  isChannelConnected(channelId: string): boolean {
    const values = [...this.socketState.values()];
    return values.some((ctx) => ctx.channelId === channelId);
  }
}
