import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";

function calculatePayoutAmount(rateType: "cpm" | "fixed", rate: number, impressions: number): number {
  if (rateType === "fixed") {
    return Number(rate.toFixed(2));
  }

  return Number(((impressions / 1000) * rate).toFixed(2));
}

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async run(campaignId: string) {
    const assignments = await this.prisma.campaignAssignment.findMany({
      where: { campaignId },
      include: {
        campaign: true,
        channel: true
      }
    });

    const payouts = await this.prisma.$transaction(async (tx) => {
      const result = [];

      for (const assignment of assignments) {
        const impressions = await tx.event.count({
          where: {
            campaignId,
            channelId: assignment.channelId,
            type: "ad_completed"
          }
        });

        const rateType = assignment.fixedFee ? "fixed" : "cpm";
        const rate = Number(assignment.fixedFee ?? assignment.cpmRate ?? 0);
        const amount = calculatePayoutAmount(rateType, rate, impressions);

        const payout = await tx.payout.upsert({
          where: {
            campaignId_channelId: {
              campaignId,
              channelId: assignment.channelId
            }
          },
          update: {
            rateType,
            rate,
            deliveredImpressions: impressions,
            amount,
            status: "pending"
          },
          create: {
            campaignId,
            channelId: assignment.channelId,
            rateType,
            rate,
            deliveredImpressions: impressions,
            amount,
            status: "pending"
          }
        });

        result.push(payout);
      }

      return result;
    });

    return {
      campaignId,
      count: payouts.length,
      payouts
    };
  }

  async markPaid(payoutId: string) {
    const existing = await this.prisma.payout.findUnique({ where: { id: payoutId } });
    if (!existing) {
      throw new NotFoundException("Payout not found");
    }

    return this.prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "paid",
        paidAt: new Date()
      }
    });
  }
}

export { calculatePayoutAmount };
