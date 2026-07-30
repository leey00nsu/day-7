import { z } from "zod";

const MAX_REPORT_BODY_BYTES = 2_048;
const DEFAULT_RATE_LIMIT_MAX = 30;
const DEFAULT_RATE_LIMIT_WINDOW_SECONDS = 600;
const MAX_RATE_LIMIT_ENTRIES = 10_000;

const reportEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("choice"),
    playerId: z.uuid(),
    decisionId: z.string(),
    choiceIndex: z.union([z.literal(0), z.literal(1)]),
  }),
  z.object({
    type: z.literal("ending"),
    playerId: z.uuid(),
    endingId: z.string(),
  }),
]);

export type ReportEvent = z.infer<typeof reportEventSchema>;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  reportRateLimits?: Map<string, RateLimitEntry>;
};

const reportRateLimits =
  globalForRateLimit.reportRateLimits ?? new Map<string, RateLimitEntry>();

globalForRateLimit.reportRateLimits = reportRateLimits;

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const rateLimitMax = positiveInteger(
  process.env.REPORT_RATE_LIMIT_MAX,
  DEFAULT_RATE_LIMIT_MAX,
);
const rateLimitWindowMs =
  positiveInteger(
    process.env.REPORT_RATE_LIMIT_WINDOW_SECONDS,
    DEFAULT_RATE_LIMIT_WINDOW_SECONDS,
  ) * 1_000;

export class ReportRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly headers?: HeadersInit,
  ) {
    super(message);
  }
}

function requestOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = new Set([new URL(request.url).origin]);
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredSiteUrl) {
    try {
      allowedOrigins.add(new URL(configuredSiteUrl).origin);
    } catch {
      // An invalid deployment URL should not make every request fail.
    }
  }

  return allowedOrigins.has(origin);
}

function getClientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function pruneRateLimits(now: number) {
  if (reportRateLimits.size < MAX_RATE_LIMIT_ENTRIES) return;

  for (const [key, entry] of reportRateLimits) {
    if (entry.resetAt <= now) reportRateLimits.delete(key);
  }

  if (reportRateLimits.size < MAX_RATE_LIMIT_ENTRIES) return;

  const oldestKeys = [...reportRateLimits.entries()]
    .sort((left, right) => left[1].resetAt - right[1].resetAt)
    .slice(0, Math.ceil(MAX_RATE_LIMIT_ENTRIES / 10))
    .map(([key]) => key);

  for (const key of oldestKeys) reportRateLimits.delete(key);
}

function applyRateLimit(request: Request) {
  const now = Date.now();
  const key = getClientAddress(request);
  const current = reportRateLimits.get(key);

  if (!current || current.resetAt <= now) {
    pruneRateLimits(now);
    reportRateLimits.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return;
  }

  current.count += 1;

  if (current.count > rateLimitMax) {
    const retryAfter = Math.max(
      Math.ceil((current.resetAt - now) / 1_000),
      1,
    );

    throw new ReportRequestError(
      "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      429,
      {
        "Retry-After": String(retryAfter),
      },
    );
  }
}

async function readLimitedBody(request: Request) {
  const declaredLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REPORT_BODY_BYTES
  ) {
    throw new ReportRequestError("요청 본문이 너무 큽니다.", 413);
  }

  if (!request.body) {
    throw new ReportRequestError("요청 본문이 없습니다.", 400);
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    size += value.byteLength;
    if (size > MAX_REPORT_BODY_BYTES) {
      await reader.cancel();
      throw new ReportRequestError("요청 본문이 너무 큽니다.", 413);
    }

    body += decoder.decode(value, { stream: true });
  }

  body += decoder.decode();
  return body;
}

export async function parseReportRequest(request: Request) {
  if (!requestOriginAllowed(request)) {
    throw new ReportRequestError("허용되지 않은 요청 출처입니다.", 403);
  }

  if (
    request.headers.get("content-type")?.split(";")[0]?.trim() !==
    "application/json"
  ) {
    throw new ReportRequestError(
      "Content-Type은 application/json이어야 합니다.",
      415,
    );
  }

  applyRateLimit(request);

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(await readLimitedBody(request));
  } catch (error) {
    if (error instanceof ReportRequestError) throw error;
    throw new ReportRequestError("올바른 JSON 요청이 아닙니다.", 400);
  }

  const result = reportEventSchema.safeParse(parsedBody);
  if (!result.success) {
    throw new ReportRequestError("잘못된 리포트 이벤트입니다.", 400);
  }

  return result.data;
}
