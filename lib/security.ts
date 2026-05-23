import { LRUCache } from "lru-cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ─────────────────────────────────────────────
// Rate Limiter
// ─────────────────────────────────────────────
type RateLimitOptions = { limit: number; windowMs: number };
type RateLimitEntry = { count: number; resetAt: number };

const rateLimitCaches = new Map<string, LRUCache<string, RateLimitEntry>>();

function getCache(key: string, max = 500) {
  if (!rateLimitCaches.has(key)) {
    rateLimitCaches.set(key, new LRUCache<string, RateLimitEntry>({ max }));
  }
  return rateLimitCaches.get(key)!;
}

export function rateLimit(cacheKey: string, opts: RateLimitOptions) {
  return function check(ip: string): { allowed: boolean; retryAfter?: number } {
    const cache = getCache(cacheKey);
    const now = Date.now();
    const entry = cache.get(ip);

    if (!entry || now > entry.resetAt) {
      cache.set(ip, { count: 1, resetAt: now + opts.windowMs });
      return { allowed: true };
    }

    if (entry.count >= opts.limit) {
      return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }

    entry.count++;
    cache.set(ip, entry);
    return { allowed: true };
  };
}

// Pre-built rate limiters
export const rateLimiters = {
  ai:      rateLimit("ai",      { limit: 20,  windowMs: 60 * 60 * 1000 }),       // 20/hr
  leads:   rateLimit("leads",   { limit: 5,   windowMs: 60 * 60 * 1000 }),       // 5/hr
  auth:    rateLimit("auth",    { limit: 20,  windowMs: 5 * 60 * 1000 }),        // 20/5min
  posts:   rateLimit("posts",   { limit: 60,  windowMs: 60 * 60 * 1000 }),       // 60/hr (admin)
};

export function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function tooManyRequests() {
  return NextResponse.json(
    { error: "لقد تجاوزت الحد المسموح، يرجى المحاولة لاحقاً" },
    { status: 429 }
  );
}

// ─────────────────────────────────────────────
// Input Sanitizer
// ─────────────────────────────────────────────
export function sanitizeText(input: unknown, maxLen = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLen)
    .replace(/<[^>]*>/g, "")           // strip HTML tags
    .replace(/[<>"'`]/g, "")           // strip dangerous chars
    .replace(/javascript:/gi, "")      // strip JS URIs
    .replace(/on\w+\s*=/gi, "");       // strip event handlers
}

export function sanitizeSlug(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, 200)
    .replace(/[^a-zA-Z0-9؀-ۿ\-_]/g, "")
    .toLowerCase();
}

// ─────────────────────────────────────────────
// AI Prompt Injection Filter
// ─────────────────────────────────────────────
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|prior)/i,
  /system\s*:/i,
  /<\|im_start\|>/i,
  /###\s*instruction/i,
  /\[INST\]/i,
  /forget\s+(everything|all|your|the)/i,
  /you\s+are\s+now/i,
  /act\s+as\s+(a\s+)?(?!lawyer|attorney|legal)/i,
  /do\s+anything\s+now/i,
  /DAN\s*mode/i,
  /jailbreak/i,
];

export function containsPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
}

// ─────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────
export const saudiPhoneRegex = /^(\+966|00966|0)(5\d{8})$/;

export const LeadSchema = z.object({
  name:         z.string().min(2).max(100),
  phone:        z.string().regex(saudiPhoneRegex, "رقم الجوال غير صحيح"),
  email:        z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  service:      z.string().max(200).optional(),
  message:      z.string().max(2000).optional(),
  conversation: z.unknown().optional(),
  consent:      z.boolean().refine((v) => v === true, { message: "يجب الموافقة على سياسة الخصوصية" }),
});

export const AIMessageSchema = z.object({
  role:    z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const AIRequestSchema = z.object({
  messages:  z.array(AIMessageSchema).min(1).max(50),
  sessionId: z.string().max(100).optional(),
  leadData:  z.object({
    name:    z.string().max(100).optional(),
    phone:   z.string().max(20).optional(),
    email:   z.string().email().optional().or(z.literal("")),
    service: z.string().max(200).optional(),
  }).optional(),
});

export const PostSchema = z.object({
  title:     z.string().min(3).max(300),
  slug:      z.string().max(300).optional(),
  content:   z.string().min(10).max(50000),
  excerpt:   z.string().max(500).optional(),
  category:  z.enum(["blog", "news"]).default("blog"),
  published: z.boolean().default(false),
});

export const AuthSchema = z.object({
  email:    z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export const LeadStatusSchema = z.object({
  id:     z.string().min(1),
  status: z.enum(["new", "contacted", "closed", "spam"]).optional(),
  notes:  z.string().max(5000).optional(),
});
