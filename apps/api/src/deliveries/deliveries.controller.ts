import { Body, Controller, Post } from "@nestjs/common";
import { RequirePermission } from "../common/permissions.decorator";
import { DeliveriesService } from "./deliveries.service";

@Controller("deliveries")
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post("trigger")
  @RequirePermission("deliveries:trigger")
  async trigger(@Body() body: unknown) {
    return this.deliveriesService.trigger(body);
  }
}
