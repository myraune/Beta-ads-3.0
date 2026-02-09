import { Injectable } from "@nestjs/common";
import { Counter, Registry, collectDefaultMetrics } from "prom-client";

@Injectable()
export class MetricsService {
  readonly registry = new Registry();
  readonly eventIngestCounter: Counter<string>;
  readonly deliveryCommandCounter: Counter<string>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.eventIngestCounter = new Counter({
      name: "beta_ads_events_ingested_total",
      help: "Total ingested overlay events",
      labelNames: ["type"],
      registers: [this.registry]
    });

    this.deliveryCommandCounter = new Counter({
      name: "beta_ads_delivery_commands_total",
      help: "Total delivery commands sent",
      labelNames: ["result"],
      registers: [this.registry]
    });
  }
}
