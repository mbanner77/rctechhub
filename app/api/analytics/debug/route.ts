import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const headers = Object.fromEntries(req.headers.entries());
  const candidates = {
    "x-forwarded-for": req.headers.get("x-forwarded-for"),
    "x-real-ip": req.headers.get("x-real-ip"),
    "cf-connecting-ip": req.headers.get("cf-connecting-ip"),
    "x-client-ip": req.headers.get("x-client-ip"),
    "forwarded": req.headers.get("forwarded"),
    "fly-client-ip": req.headers.get("fly-client-ip"),
    "x-vercel-forwarded-for": req.headers.get("x-vercel-forwarded-for"),
    "true-client-ip": req.headers.get("true-client-ip"),
    "fastly-client-ip": req.headers.get("fastly-client-ip"),
  } as const;

  function parseCandidate(v: string | null): string | null {
    if (!v) return null;
    const first = v.split(",")[0].trim();
    const ip = first.replace(/^for=/i, "").replace(/"/g, "");
    return ip || null;
  }

  const detected =
    parseCandidate(candidates["x-forwarded-for"]) ||
    parseCandidate(candidates["x-real-ip"]) ||
    parseCandidate(candidates["cf-connecting-ip"]) ||
    parseCandidate(candidates["x-client-ip"]) ||
    parseCandidate(candidates["forwarded"]) ||
    parseCandidate(candidates["fly-client-ip"]) ||
    parseCandidate(candidates["x-vercel-forwarded-for"]) ||
    parseCandidate(candidates["true-client-ip"]) ||
    parseCandidate(candidates["fastly-client-ip"]) ||
    null;

  return NextResponse.json({ detected, candidates, sampleHeaders: {
    "user-agent": req.headers.get("user-agent"),
    "referer": req.headers.get("referer"),
    host: req.headers.get("host"),
    "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
  } });
}
