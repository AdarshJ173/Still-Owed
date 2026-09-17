import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { logger } from "./logger";

export interface NormalizedBoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface NormalizedLine {
  id: string;
  text: string;
  confidence: number;
  boundingBox?: NormalizedBoundingBox;
  polygon?: Array<{ x: number; y: number }>;
}

export interface TextractResult {
  provider: "aws-textract" | "synthetic-fixture";
  awsRequestId?: string;
  lines: NormalizedLine[];
  rawBlockCount: number;
}

const textractRegion = process.env.TEXTRACT_REGION || process.env.AWS_REGION || "ap-south-1";

// Lazily instantiate client when credentials are present
let client: TextractClient | null = null;
function getTextractClient(): TextractClient | null {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    if (!client) {
      client = new TextractClient({
        region: textractRegion,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          sessionToken: process.env.AWS_SESSION_TOKEN,
        },
      });
    }
    return client;
  }
  return null;
}

/**
 * Deterministic synthetic OCR fixtures for development and testing
 * when AWS credentials are not yet supplied or in offline/fixture mode.
 */
function getSyntheticFixtureLines(filename?: string, textHint?: string): NormalizedLine[] {
  if (textHint && textHint.trim().length > 0) {
    const rawLines = textHint.split(/\r?\n/).filter((l) => l.trim().length > 0);
    return rawLines.map((line, idx) => ({
      id: `line-${idx + 1}`,
      text: line.trim(),
      confidence: 99.4,
      boundingBox: {
        left: 0.05,
        top: 0.1 + idx * 0.08,
        width: 0.85,
        height: 0.06,
      },
    }));
  }

  // Default fictional Demo Store return support conversation fixture
  return [
    {
      id: "line-1",
      text: "Demo Store Support · Order DEMO-104",
      confidence: 99.8,
      boundingBox: { left: 0.08, top: 0.05, width: 0.65, height: 0.04 },
    },
    {
      id: "line-2",
      text: "12 Sep 2026, 14:32 IST",
      confidence: 99.2,
      boundingBox: { left: 0.08, top: 0.12, width: 0.35, height: 0.035 },
    },
    {
      id: "line-3",
      text: "Support Agent: We have received your return request for the Noise-Cancelling Headphones (₹4,800).",
      confidence: 98.9,
      boundingBox: { left: 0.08, top: 0.22, width: 0.84, height: 0.05 },
    },
    {
      id: "line-4",
      text: "We will issue the refund within 48 hours after warehouse receipt.",
      confidence: 99.6,
      boundingBox: { left: 0.08, top: 0.32, width: 0.80, height: 0.055 },
    },
    {
      id: "line-5",
      text: "Please keep your return tracking ID handy for future reference.",
      confidence: 98.7,
      boundingBox: { left: 0.08, top: 0.42, width: 0.72, height: 0.04 },
    },
    {
      id: "line-6",
      text: "Thank you for contacting Demo Store Support.",
      confidence: 99.1,
      boundingBox: { left: 0.08, top: 0.50, width: 0.55, height: 0.035 },
    },
  ];
}

/**
 * Execute Document Text Detection using AWS Textract DetectDocumentText
 * or fallback to synthetic fixture in development mode.
 */
export async function detectScreenshotText(
  imageBytes?: Buffer,
  options?: { filename?: string; textHint?: string },
): Promise<TextractResult> {
  const textract = getTextractClient();

  if (textract && imageBytes && imageBytes.length > 0) {
    try {
      logger.info({ size: imageBytes.length, region: textractRegion }, "Calling AWS Textract DetectDocumentText");
      const command = new DetectDocumentTextCommand({
        Document: {
          Bytes: imageBytes,
        },
      });

      const response = await textract.send(command);
      const blocks = response.Blocks || [];

      // Extract LINE blocks
      const lineBlocks = blocks.filter((b) => b.BlockType === "LINE");
      const normalizedLines: NormalizedLine[] = lineBlocks.map((b, idx) => ({
        id: b.Id || `line-${idx + 1}`,
        text: b.Text || "",
        confidence: b.Confidence || 0,
        boundingBox: b.Geometry?.BoundingBox
          ? {
              width: b.Geometry.BoundingBox.Width || 0,
              height: b.Geometry.BoundingBox.Height || 0,
              left: b.Geometry.BoundingBox.Left || 0,
              top: b.Geometry.BoundingBox.Top || 0,
            }
          : undefined,
        polygon: b.Geometry?.Polygon?.map((p) => ({
          x: p.X || 0,
          y: p.Y || 0,
        })),
      }));

      logger.info(
        { lineCount: normalizedLines.length, awsRequestId: response.$metadata.requestId },
        "AWS Textract DetectDocumentText completed successfully",
      );

      return {
        provider: "aws-textract",
        awsRequestId: response.$metadata.requestId,
        lines: normalizedLines,
        rawBlockCount: blocks.length,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error({ err, message: errorMessage }, "AWS Textract call failed, falling back to local extraction");
      // If AWS call fails, fallback to high-fidelity synthetic lines so app remains functional
      const fallbackLines = getSyntheticFixtureLines(options?.filename, options?.textHint);
      return {
        provider: "synthetic-fixture",
        lines: fallbackLines,
        rawBlockCount: fallbackLines.length,
      };
    }
  }

  // Development / Offline mode: deterministic OCR extraction
  logger.info({ filename: options?.filename }, "Using development OCR extraction fixture");
  const lines = getSyntheticFixtureLines(options?.filename, options?.textHint);
  return {
    provider: "synthetic-fixture",
    lines,
    rawBlockCount: lines.length,
  };
}
