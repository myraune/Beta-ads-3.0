import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  namespace: "/dashboard",
  cors: {
    origin: "*"
  }
})
export class DashboardGateway {
  @WebSocketServer()
  server!: Server;

  broadcast(event: string, payload: Record<string, unknown>) {
    this.server.emit(event, payload);
  }
}
