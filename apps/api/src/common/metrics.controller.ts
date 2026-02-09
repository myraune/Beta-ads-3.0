import { Controller, Get, Header } from "@nestjs/common";
import { Public } from "./public.decorator";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4")
  async metrics(): Promise<string> {
    return this.metricsService.registry.metrics();
  }
}
