import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { StreamersService } from "./streamers.service";

@Controller("streamers")
export class StreamersController {
  constructor(private readonly streamersService: StreamersService) {}

  @Post("profile")
  @RequirePermission("streamers:upsert_profile")
  async upsertProfile(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.streamersService.upsertProfile(user, body);
  }

  @Get("profile")
  @RequirePermission("streamers:read_profile")
  async getProfile(@CurrentUser() user: AuthUser) {
    return this.streamersService.getProfile(user);
  }

  @Post("channels")
  @RequirePermission("streamers:create_channel")
  async createChannel(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.streamersService.createChannel(user, body);
  }

  @Get("channels")
  @RequirePermission("streamers:read_channels")
  async listChannels(@CurrentUser() user: AuthUser) {
    return this.streamersService.listChannels(user);
  }
}
