import { Body, Controller, Headers, Ip, Post, Req, UnauthorizedException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";
import { Public } from "../common/public.decorator";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Post("ingest")
  async ingest(
    @Headers("x-overlay-key") overlayKey: string | undefined,
    @Body() body: unknown,
    @Ip() ip: string,
    @Req() req: FastifyRequest
  ) {
    if (!overlayKey) {
      throw new UnauthorizedException("Missing overlay key");
    }

    return this.eventsService.ingest(overlayKey, body, {
      ip,
      userAgent: req.headers["user-agent"]
    });
  }
}
