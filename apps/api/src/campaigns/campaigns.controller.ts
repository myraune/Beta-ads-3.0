import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUser, type AuthUser } from "../common/current-user.decorator";
import { RequirePermission } from "../common/permissions.decorator";
import { CampaignsService } from "./campaigns.service";

const campaignIdParamSchema = z.object({
  id: z.string().uuid()
});

@Controller("campaigns")
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @RequirePermission("campaigns:create")
  async create(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.campaignsService.create(user, body);
  }

  @Get()
  @RequirePermission("campaigns:read")
  async list(@CurrentUser() user: AuthUser) {
    return this.campaignsService.list(user);
  }

  @Get(":id")
  @RequirePermission("campaigns:read_one")
  async getById(@Param() params: unknown) {
    const parsed = campaignIdParamSchema.parse(params);
    return this.campaignsService.getById(parsed.id);
  }

  @Post(":id/flights")
  @RequirePermission("campaigns:create_flight")
  async createFlight(@CurrentUser() user: AuthUser, @Param() params: unknown, @Body() body: unknown) {
    const parsed = campaignIdParamSchema.parse(params);
    return this.campaignsService.createFlight(user, parsed.id, body);
  }

  @Post(":id/assign-streamers")
  @RequirePermission("campaigns:assign_streamers")
  async assignStreamers(@CurrentUser() user: AuthUser, @Param() params: unknown, @Body() body: unknown) {
    const parsed = campaignIdParamSchema.parse(params);
    return this.campaignsService.assignStreamers(user, parsed.id, body);
  }
}
