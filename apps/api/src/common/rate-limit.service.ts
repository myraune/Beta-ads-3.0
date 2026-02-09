import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { RedisService } from "./redis.service";

@Injectable()
export class EventRateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async consume(overlayKey: string, ip: string): Promise<void> {
    const keyHash = createHash("sha256").update(overlayKey).digest("hex").slice(0, 16);
    const redisKey = `rate:event:${keyHash}:${ip}`;
    const count = await this.redisService.client.incr(redisKey);
    if (count === 1) {
      await this.redisService.client.expire(redisKey, 60);
    }

    if (count > 180) {
      throw new HttpException("Event ingest rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
