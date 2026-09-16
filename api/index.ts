import type { IncomingMessage, ServerResponse } from "http";
import app from "../server";

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  const xMatched = req.headers["x-matched-path"] as string;
  const xVercel = req.headers["x-vercel-matched-path"] as string;
  const xUri = req.headers["x-forwarded-uri"] as string;

  const target = xMatched || xVercel || xUri;
  if (target && target.startsWith("/api/")) {
    req.url = target;
  }

  return (app as any)(req, res);
}
