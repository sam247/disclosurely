import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[HEALTH-CHECK] ${step}${detailsStr}`);
};

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: HealthStatus;
    edgeFunctions: HealthStatus;
    storage: HealthStatus;
  };
  performance: {
    totalResponseTime: number;
    databaseResponseTime: number | null;
    storageResponseTime: number | null;
  };
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: any;
}

async function checkDatabase(supabaseClient: any): Promise<{ status: HealthStatus; responseTime: number }> {
  const startTime = Date.now();

  try {
    // Simple query to check database connectivity
    const { data, error } = await supabaseClient
      .from('organizations')
      .select('id')
      .limit(1);

    const responseTime = Date.now() - startTime;

    if (error) {
      logStep('Database check failed', { error: error.message });
      return {
        status: {
          status: 'unhealthy',
          message: `Database error: ${error.message}`,
          responseTime,
        },
        responseTime,
      };
    }

    // Check response time thresholds
    if (responseTime > 1000) {
      return {
        status: {
          status: 'degraded',
          message: 'Database response time is slow',
          responseTime,
        },
        responseTime,
      };
    }

    return {
      status: {
        status: 'healthy',
        message: 'Database is responding normally',
        responseTime,
      },
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logStep('Database check exception', { error: errorMessage });

    return {
      status: {
        status: 'unhealthy',
        message: `Database connection failed: ${errorMessage}`,
        responseTime,
      },
      responseTime,
    };
  }
}

async function checkStorage(supabaseClient: any): Promise<{ status: HealthStatus; responseTime: number }> {
  const startTime = Date.now();

  try {
    // List buckets to check storage connectivity
    const { data, error } = await supabaseClient.storage.listBuckets();

    const responseTime = Date.now() - startTime;

    if (error) {
      logStep('Storage check failed', { error: error.message });
      return {
        status: {
          status: 'degraded',
          message: `Storage warning: ${error.message}`,
          responseTime,
        },
        responseTime,
      };
    }

    // Check response time thresholds
    if (responseTime > 2000) {
      return {
        status: {
          status: 'degraded',
          message: 'Storage response time is slow',
          responseTime,
          details: { bucketCount: data?.length || 0 },
        },
        responseTime,
      };
    }

    return {
      status: {
        status: 'healthy',
        message: 'Storage is responding normally',
        responseTime,
        details: { bucketCount: data?.length || 0 },
      },
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logStep('Storage check exception', { error: errorMessage });

    return {
      status: {
        status: 'degraded',
        message: `Storage check failed: ${errorMessage}`,
        responseTime,
      },
      responseTime,
    };
  }
}

function checkEdgeFunctions(): HealthStatus {
  // Edge function is healthy if it's able to execute this code
  return {
    status: 'healthy',
    message: 'Edge functions are operational',
    responseTime: 0,
  };
}

function determineOverallStatus(checks: HealthCheckResult['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);

  if (statuses.some(status => status === 'unhealthy')) {
    return 'unhealthy';
  }

  if (statuses.some(status => status === 'degraded')) {
    return 'degraded';
  }

  return 'healthy';
}

serve(async (req) => {
  const overallStartTime = Date.now();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    logStep("Health check started");

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Perform health checks in parallel for faster response
    const [databaseCheck, storageCheck] = await Promise.all([
      checkDatabase(supabaseClient),
      checkStorage(supabaseClient),
    ]);

    const edgeFunctionsCheck = checkEdgeFunctions();

    const checks = {
      database: databaseCheck.status,
      edgeFunctions: edgeFunctionsCheck,
      storage: storageCheck.status,
    };

    const overallStatus = determineOverallStatus(checks);
    const totalResponseTime = Date.now() - overallStartTime;

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks,
      performance: {
        totalResponseTime,
        databaseResponseTime: databaseCheck.responseTime,
        storageResponseTime: storageCheck.responseTime,
      },
    };

    logStep("Health check completed", {
      status: overallStatus,
      totalResponseTime
    });

    // Return appropriate HTTP status code based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(result, null, 2),
      {
        status: httpStatus,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in health check", { message: errorMessage });

    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: {
        database: {
          status: 'unhealthy',
          message: 'Not checked due to error',
        },
        edgeFunctions: {
          status: 'unhealthy',
          message: `Health check failed: ${errorMessage}`,
        },
        storage: {
          status: 'unhealthy',
          message: 'Not checked due to error',
        },
      },
      performance: {
        totalResponseTime: Date.now() - overallStartTime,
        databaseResponseTime: null,
        storageResponseTime: null,
      },
    };

    return new Response(
      JSON.stringify(errorResult, null, 2),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  }
});
