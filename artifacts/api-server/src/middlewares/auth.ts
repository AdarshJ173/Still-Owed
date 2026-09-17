import type { Request, Response, NextFunction } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  displayName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dxhuxvmvjilewcthmmkl.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4aHV4dm12amlsZXdjdGhtbWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTY2Mzc2NSwiZXhwIjoyMTA1MjM5NzY1fQ.Ee89uGyBsp8NWIvnwrQE093eLAIfhR4WFi1Etq5QmLA";

let supabaseServer: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey) {
  supabaseServer = createClient(supabaseUrl, supabaseKey);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let userId: string | null = null;
    let userEmail: string | undefined;
    let userDisplayName: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      if (token.startsWith("eyJ") && supabaseServer) {
        // Verify JWT with Supabase Auth
        try {
          const { data, error } = await supabaseServer.auth.getUser(token);
          if (data?.user && !error) {
            userId = data.user.id;
            userEmail = data.user.email;
            const metaName = data.user.user_metadata?.full_name;
            userDisplayName = typeof metaName === "string" ? metaName : userEmail?.split("@")[0];
          }
        } catch (jwtErr: unknown) {
          logger.warn({ jwtErr }, "Supabase JWT verification failed, checking fallback headers");
        }
      } else if (token.length > 0) {
        userId = token;
      }
    }

    if (!userId) {
      const headerUserId = req.headers["x-user-id"];
      if (typeof headerUserId === "string" && headerUserId.trim().length > 0) {
        userId = headerUserId.trim();
      }
    }

    // Default to dev user in development/test if not authenticated
    if (!userId && process.env.NODE_ENV !== "production") {
      userId = "dev-user-001";
    }

    if (!userId) {
      res.status(401).json({ error: "Unauthorized: session or user identity required" });
      return;
    }

    req.user = {
      id: userId,
      email: userEmail || `${userId}@stillowed.local`,
      displayName: userDisplayName || (userId === "dev-user-001" ? "Adarsh Jagannath" : `User ${userId}`),
    };

    // Ensure user profile exists in database
    try {
      const existing = await db
        .select()
        .from(profilesTable)
        .where(eq(profilesTable.id, userId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(profilesTable).values({
          id: userId,
          displayName: req.user.displayName,
          timezone: "Asia/Kolkata",
          adultAttestedAt: new Date(),
          noticeVersion: "1.0",
          consentAt: new Date(),
        });
      }
    } catch (dbErr: unknown) {
      logger.warn({ dbErr, userId }, "Profile check/upsert warning");
    }

    next();
  } catch (err: unknown) {
    logger.error({ err }, "Authentication middleware error");
    res.status(500).json({ error: "Authentication internal error" });
  }
}
