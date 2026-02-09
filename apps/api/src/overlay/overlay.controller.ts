import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { OverlayKeyService } from "./overlay-key.service";

const rotateSchema = z.object({
  channelId: z.string().uuid()
});

@Controller("overlay")
export class OverlayController {
  constructor(private readonly overlayKeyService: OverlayKeyService) {}

  @Post("rotate-key")
  @RequirePermission("streamers:rotate_overlay_key")
  async rotate(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const parsed = rotateSchema.parse(body);
    return this.overlayKeyService.rotateKey(user, parsed.channelId);
  }
}
