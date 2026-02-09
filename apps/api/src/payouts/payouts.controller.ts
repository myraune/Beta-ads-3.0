import { Controller, Get, Param, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { RequirePermission } from "../common/permissions.decorator";
import { PayoutsService } from "./payouts.service";

const runSchema = z.object({
  campaignId: z.string().uuid()
});

const payoutParamSchema = z.object({
  id: z.string().uuid()
});

@Controller("payouts")
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get("run")
  @RequirePermission("payouts:run")
  async run(@Query() query: unknown) {
    const parsed = runSchema.parse(query);
    return this.payoutsService.run(parsed.campaignId);
  }

  @Post(":id/mark-paid")
  @RequirePermission("payouts:mark_paid")
  async markPaid(@Param() params: unknown) {
    const parsed = payoutParamSchema.parse(params);
    return this.payoutsService.markPaid(parsed.id);
  }
}
