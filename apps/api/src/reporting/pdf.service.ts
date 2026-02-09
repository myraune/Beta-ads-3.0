import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";

interface SummaryRow {
  day: string;
  impressions: number;
  clicks: number;
  minutesOnScreen: number;
}

@Injectable()
export class PdfReportService {
  async renderCampaignSummaryPdf(input: {
    campaignName: string;
    advertiser: string;
    objective: string;
    totals: {
      impressions: number;
      clicks: number;
      ctr: number;
      minutesOnScreen: number;
    };
    rows: SummaryRow[];
  }): Promise<Buffer> {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

    doc.fontSize(22).text("Beta Live Ads Platform", { align: "left" });
    doc.moveDown(0.25);
    doc.fontSize(16).text("Campaign Delivery Report", { align: "left" });
    doc.moveDown();

    doc.fontSize(11).text(`Campaign: ${input.campaignName}`);
    doc.text(`Advertiser: ${input.advertiser}`);
    doc.text(`Objective: ${input.objective}`);
    doc.text(`Generated (UTC): ${new Date().toISOString()}`);
    doc.moveDown();

    doc.fontSize(12).text("Summary", { underline: true });
    doc.fontSize(11).text(`Impressions (ad_completed): ${input.totals.impressions}`);
    doc.text(`Clicks: ${input.totals.clicks}`);
    doc.text(`CTR: ${(input.totals.ctr * 100).toFixed(2)}%`);
    doc.text(`Minutes on screen proxy: ${input.totals.minutesOnScreen.toFixed(2)}`);

    doc.moveDown();
    doc.fontSize(12).text("Daily Timeline", { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(10).text("Date (UTC)", 50, doc.y, { continued: true, width: 120 });
    doc.text("Impressions", 170, doc.y, { continued: true, width: 90 });
    doc.text("Clicks", 260, doc.y, { continued: true, width: 70 });
    doc.text("Minutes On Screen", 330, doc.y, { width: 160 });

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    input.rows.forEach((row) => {
      const y = doc.y + 8;
      doc.text(row.day, 50, y, { continued: true, width: 120 });
      doc.text(String(row.impressions), 170, y, { continued: true, width: 90 });
      doc.text(String(row.clicks), 260, y, { continued: true, width: 70 });
      doc.text(row.minutesOnScreen.toFixed(2), 330, y, { width: 160 });
      doc.moveTo(50, doc.y + 4).lineTo(545, doc.y + 4).strokeColor("#e5e7eb").stroke();
      doc.moveDown(0.25);
    });

    doc.end();

    return new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }
}
