import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { createWorker } from "tesseract.js";
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
  provider: "aws-textract" | "local-ocr" | "note-parser";
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
 * Real local OCR extraction using Tesseract.js directly on the uploaded image bytes.
 * Extracts text lines and maps normalized bounding box coordinates.
 */
async function extractLinesWithTesseract(imageBytes: Buffer): Promise<NormalizedLine[]> {
  try {
    const worker = await createWorker("eng");
    const ret = await worker.recognize(imageBytes, {}, { tsv: true });
    await worker.terminate();
    const tsvLines = (ret.data.tsv || "").split("\n");
    let imgW = 1,
      imgH = 1;
    const lines: NormalizedLine[] = [];
    let currentLineWords: string[] = [];
    let currentLineBox: { left: number; top: number; width: number; height: number } | null = null;
    let currentConf = 92;

    for (const raw of tsvLines) {
      const parts = raw.split("\t");
      if (parts.length < 12) continue;
      const level = parseInt(parts[0] || "0", 10);
      const left = parseInt(parts[6] || "0", 10);
      const top = parseInt(parts[7] || "0", 10);
      const width = parseInt(parts[8] || "0", 10);
      const height = parseInt(parts[9] || "0", 10);
      const conf = parseFloat(parts[10] || "0");
      const text = parts[11] ? parts[11].trim() : "";

      if (level === 1) {
        imgW = width || 1;
        imgH = height || 1;
      } else if (level === 4) {
        if (currentLineWords.length > 0 && currentLineBox) {
          const lineText = currentLineWords.join(" ").trim();
          if (lineText.length > 0) {
            lines.push({
              id: `line-${lines.length + 1}`,
              text: lineText,
              confidence: currentConf,
              boundingBox: {
                left: Math.max(0, currentLineBox.left / imgW),
                top: Math.max(0, currentLineBox.top / imgH),
                width: Math.min(1, currentLineBox.width / imgW),
                height: Math.min(1, currentLineBox.height / imgH),
              },
            });
          }
        }
        currentLineWords = [];
        currentLineBox = { left, top, width, height };
        currentConf = Math.round(conf > 0 ? conf : 90);
      } else if (level === 5 && text) {
        currentLineWords.push(text);
      }
    }

    if (currentLineWords.length > 0 && currentLineBox) {
      const lineText = currentLineWords.join(" ").trim();
      if (lineText.length > 0) {
        lines.push({
          id: `line-${lines.length + 1}`,
          text: lineText,
          confidence: currentConf,
          boundingBox: {
            left: Math.max(0, currentLineBox.left / imgW),
            top: Math.max(0, currentLineBox.top / imgH),
            width: Math.min(1, currentLineBox.width / imgW),
            height: Math.min(1, currentLineBox.height / imgH),
          },
        });
      }
    }

    logger.info({ extractedLinesCount: lines.length }, "Extracted real lines using local OCR engine");
    return lines;
  } catch (err: unknown) {
    logger.error({ err }, "Local Tesseract OCR execution failed");
    return [];
  }
}

/**
 * Execute Document Text Detection using AWS Textract DetectDocumentText
 * with real local OCR fallback on any uploaded image bytes.
 */
export async function detectScreenshotText(
  imageBytes?: Buffer,
  options?: { filename?: string; textHint?: string },
): Promise<TextractResult> {
  const textract = getTextractClient();

  // 1. Try AWS Textract if configured
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
      logger.warn({ err, message: errorMessage }, "AWS Textract call failed, running real local OCR on image bytes");
    }
  }

  // 2. Real OCR on the actual uploaded image bytes
  if (imageBytes && imageBytes.length > 0) {
    const realLines = await extractLinesWithTesseract(imageBytes);
    if (realLines.length > 0) {
      return {
        provider: "local-ocr",
        lines: realLines,
        rawBlockCount: realLines.length,
      };
    }
  }

  // 3. If manual text note, parse the user's note lines directly
  if (options?.textHint && options.textHint.trim().length > 0) {
    const rawLines = options.textHint.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const noteLines: NormalizedLine[] = rawLines.map((line, idx) => ({
      id: `line-${idx + 1}`,
      text: line.trim(),
      confidence: 99.4,
      boundingBox: {
        left: 0.05,
        top: 0.08 + idx * 0.07,
        width: 0.88,
        height: 0.05,
      },
    }));
    return {
      provider: "note-parser",
      lines: noteLines,
      rawBlockCount: noteLines.length,
    };
  }

  // Empty fallback
  return {
    provider: "local-ocr",
    lines: [],
    rawBlockCount: 0,
  };
}
