import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { getEnv } from "./env";

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor() {
    this.client = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
