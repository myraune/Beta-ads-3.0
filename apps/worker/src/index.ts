import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { PrismaClient } from "@beta/db";
import { runAggregation } from "./aggregation.worker";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null
});

const prisma = new PrismaClient();
const queueName = "aggregation";

async function bootstrap() {
  const queue = new Queue(queueName, { connection });

  await queue.add(
    "aggregate-daily",
    {},
    {
      repeat: { every: 60_000 },
      removeOnComplete: 1000,
      removeOnFail: 500
    }
  );

  const worker = new Worker(
    queueName,
    async () => {
      const result = await runAggregation(prisma);
      console.info(JSON.stringify({ level: "info", msg: "aggregation_complete", ...result }));
      return result;
    },
    {
      connection,
      concurrency: Number(process.env.WORKER_CONCURRENCY ?? 5)
    }
  );

  worker.on("failed", (job, err) => {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "aggregation_failed",
        jobId: job?.id,
        error: err.message
      })
    );
  });

  process.on("SIGTERM", async () => {
    await worker.close();
    await queue.close();
    await connection.quit();
    await prisma.$disconnect();
    process.exit(0);
  });

  console.info(JSON.stringify({ level: "info", msg: "worker_started", queue: queueName }));
}

bootstrap().catch(async (error) => {
  console.error(JSON.stringify({ level: "error", msg: "worker_bootstrap_failed", error: String(error) }));
  await connection.quit();
  await prisma.$disconnect();
  process.exit(1);
});
