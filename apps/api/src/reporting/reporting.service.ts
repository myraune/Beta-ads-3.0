import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service";
import { PdfReportService } from "./pdf.service";

interface DailySummary {
  day: string;
  impressions: number;
  clicks: number;
  minutesOnScreen: number;
}

function toCsv(rows: DailySummary[]) {
  const header = "day,impressions,clicks,minutes_on_screen";
  const body = rows.map((row) => `${row.day},${row.impressions},${row.clicks},${row.minutesOnScreen.toFixed(4)}`);
  return [header, ...body].join("\n");
}

@Injectable()
export class ReportingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfReportService: PdfReportService
  ) {}

  async campaignSummary(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const metrics = await this.prisma.dailyMetric.findMany({
      where: { campaignId },
      orderBy: { day: "asc" }
    });

    let rows: DailySummary[];

    if (metrics.length > 0) {
      rows = metrics.map((metric) => ({
        day: metric.day.toISOString().slice(0, 10),
        impressions: metric.impressions,
        clicks: metric.clicks,
        minutesOnScreen: Number(metric.minutesOnScreen)
      }));
    } else {
      const [completedEvents, clickEvents] = await Promise.all([
        this.prisma.event.findMany({
          where: {
            campaignId,
            type: "ad_completed"
          },
          select: { ts: true, payload: true }
        }),
        this.prisma.event.findMany({
          where: {
            campaignId,
            type: "ad_click"
          },
          select: { ts: true }
        })
      ]);

      const grouped: Record<string, DailySummary> = {};

      for (const event of completedEvents) {
        const day = event.ts.toISOString().slice(0, 10);
        const durationSec =
          typeof event.payload === "object" && event.payload && "durationSec" in event.payload
            ? Number((event.payload as { durationSec?: unknown }).durationSec)
            : 0;

        if (!grouped[day]) {
          grouped[day] = { day, impressions: 0, clicks: 0, minutesOnScreen: 0 };
        }

        grouped[day].impressions += 1;
        grouped[day].minutesOnScreen += Number.isFinite(durationSec) ? durationSec / 60 : 0;
      }

      for (const event of clickEvents) {
        const day = event.ts.toISOString().slice(0, 10);
        if (!grouped[day]) {
          grouped[day] = { day, impressions: 0, clicks: 0, minutesOnScreen: 0 };
        }
        grouped[day].clicks += 1;
      }

      rows = Object.values(grouped).sort((a, b) => a.day.localeCompare(b.day));
    }

    const totals = rows.reduce(
      (acc, row) => {
        acc.impressions += row.impressions;
        acc.clicks += row.clicks;
        acc.minutesOnScreen += row.minutesOnScreen;
        return acc;
      },
      { impressions: 0, clicks: 0, minutesOnScreen: 0 }
    );

    return {
      campaign,
      rows,
      totals: {
        ...totals,
        ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0
      }
    };
  }

  async exportCsv(campaignId: string) {
    const summary = await this.campaignSummary(campaignId);
    return toCsv(summary.rows);
  }

  async proofTimeline(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      throw new NotFoundException("Campaign not found");
    }

    const events = await this.prisma.event.findMany({
      where: {
        campaignId,
        type: {
          in: ["ad_command_sent", "ad_rendered", "ad_completed", "ad_click", "ad_error"]
        }
      },
      orderBy: { ts: "desc" },
      take: 300,
      include: {
        creative: {
          select: {
            id: true,
            objectKey: true,
            format: true
          }
        },
        channel: {
          select: {
            id: true,
            twitchChannelName: true
          }
        }
      }
    });

    return {
      campaignId,
      events: events.map((event) => ({
        id: event.id,
        type: event.type,
        ts: event.ts.toISOString(),
        requestId: event.requestId,
        channel: event.channel,
        creative: event.creative
      }))
    };
  }

  async exportPdf(campaignId: string): Promise<Buffer> {
    const summary = await this.campaignSummary(campaignId);

    return this.pdfReportService.renderCampaignSummaryPdf({
      campaignName: summary.campaign.name,
      advertiser: summary.campaign.advertiser,
      objective: summary.campaign.objective,
      totals: summary.totals,
      rows: summary.rows
    });
  }
}
