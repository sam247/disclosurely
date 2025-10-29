/**
 * Upstash Redis Rate Limiting for Supabase Edge Functions
 * 
 * This provides server-side rate limiting to prevent API abuse.
 * Uses Upstash Redis (10K free commands/day) with sliding window algorithm.
 */

import { Ratelimit } from "https://esm.sh/@upstash/ratelimit@1.0.0"
import { Redis } from "https://esm.sh/@upstash/redis@1.25.1"

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
})

// Different rate limits for different operations
export const rateLimiters = {
  // Anonymous report submissions: 5 per 15 minutes per IP
  reportSubmission: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/report",
  }),
  
  // Domain operations: 10 per 10 seconds per user
  domainOperations: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/domain",
  }),
  
  // Message sending: 20 per hour per tracking_id
  messaging: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
    prefix: "@upstash/ratelimit/message",
  }),
  
  // Authentication attempts: 5 per 15 minutes per IP
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  }),
  
  // General API: 60 per minute per IP
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit/api",
  }),
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  req: Request,
  limiter: Ratelimit,
  identifier?: string
): Promise<RateLimitResult> {
  try {
    // Use custom identifier or fall back to IP
    const id = identifier || req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "anonymous"
    
    const result = await limiter.limit(id)
    
    console.log(`[RateLimit] ${id}: ${result.success ? 'ALLOWED' : 'BLOCKED'} (${result.remaining}/${result.limit} remaining)`)
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    }
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error)
    // Fail open - allow request if rate limiting fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now() + 60000,
    }
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    ...(result.success ? {} : {
      'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString()
    })
  }
}

export function rateLimitResponse(result: RateLimitResult, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ 
      error: "Too many requests. Please try again later.",
      reset: result.reset,
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000)
    }),
    { 
      status: 429,
      headers: {
        ...corsHeaders,
        ...rateLimitHeaders(result),
        'Content-Type': 'application/json',
      }
    }
  )
}

