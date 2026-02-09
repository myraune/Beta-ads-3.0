import { Body, Controller, Post } from "@nestjs/common";
import { requestMagicLinkSchema, verifyMagicLinkSchema } from "@beta/shared";
import { Public } from "../common/public.decorator";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("request-magic-link")
  async requestMagicLink(@Body() body: unknown) {
    const parsed = requestMagicLinkSchema.parse(body);
    return this.authService.requestMagicLink(parsed.email);
  }

  @Public()
  @Post("verify-magic-link")
  async verifyMagicLink(@Body() body: unknown) {
    const parsed = verifyMagicLinkSchema.parse(body);
    return this.authService.verifyMagicLink(parsed.email, parsed.token);
  }

  @Post("logout")
  async logout() {
    return this.authService.logout();
  }
}
