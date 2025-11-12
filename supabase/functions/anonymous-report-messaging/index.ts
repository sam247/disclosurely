import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { checkRateLimit, rateLimiters, rateLimitResponse } from '../_shared/rateLimit.ts'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ⚠️ CRITICAL: Verify ENCRYPTION_SALT on module load (startup check)
const ENCRYPTION_SALT_STARTUP = Deno.env.get('ENCRYPTION_SALT');
if (!ENCRYPTION_SALT_STARTUP) {
  console.error('🚨 CRITICAL: ENCRYPTION_SALT is missing on startup!');
  console.error('🚨 This will cause all message encryption/decryption to fail!');
  console.error('🚨 Check Supabase Edge Function Secrets immediately!');
  console.error('🚨 Location: Supabase Dashboard > Settings > Edge Functions > Secrets');
  // Don't throw here - let individual requests fail with proper error messages
  // This allows the function to deploy but will fail on actual use
} else {
  console.log('✅ ENCRYPTION_SALT verified on startup (length:', ENCRYPTION_SALT_STARTUP.length, 'chars)');
}

// Helper function to log audit events - disabled to avoid type issues
async function logAuditEvent(supabase: any, data: any) {
  try {
    // Skip audit logging for now to avoid IP address type issues
    console.log('📋 Audit event (skipped):', data.eventType, data.action);
    return;
    
    await supabase.from('audit_logs').insert({
      event_type: data.eventType,
      category: data.category,
      action: data.action,
      severity: data.severity || 'low',
      actor_type: data.actorType,
      actor_id: data.actorId || null,
      actor_email: data.actorEmail || null,
      actor_ip_address: null, // Always null to avoid inet type issues
      actor_user_agent: data.actorUserAgent || null,
      target_type: data.targetType || null,
      target_id: data.targetId || null,
      target_name: data.targetName || null,
      summary: data.summary,
      description: data.description || null,
      metadata: data.metadata || {},
      organization_id: data.organizationId,
      hash: '',
      previous_hash: '',
      chain_index: 0
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 Rate limiting: 20 messages per hour per tracking ID (extracted later)
  const rateLimit = await checkRateLimit(req, rateLimiters.messaging)
  if (!rateLimit.success) {
    console.warn('⚠️ Rate limit exceeded for messaging')
    return rateLimitResponse(rateLimit, corsHeaders)
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env vars");
    return new Response(JSON.stringify({ error: "Server not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = await req.json();
    const action = String(body?.action || '').toLowerCase().trim();
    const trackingId = String(body?.trackingId || '').toUpperCase().replace(/\s+/g, '');

    // Validate action
    if (!['load', 'send'].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate tracking ID format
    if (!/^DIS-[A-Z0-9]{8}$/.test(trackingId)) {
      return new Response(JSON.stringify({ error: "Invalid tracking ID format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Helper to fetch report and org branding
    const getReportWithOrg = async () => {
      const { data: report } = await supabase
        .from("reports")
        .select(
          "id, tracking_id, title, status, created_at, organization_id, organizations(name, brand_color, logo_url, custom_logo_url)"
        )
        .eq("tracking_id", trackingId)
        .neq("status", "archived") // Exclude archived reports
        .maybeSingle();
      return report;
    };

    if (action === 'load') {
      const report = await getReportWithOrg();

      if (!report) {
        // Generic error message to prevent tracking ID enumeration
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: messages } = await supabase
        .from("report_messages")
        .select("id, sender_type, encrypted_message, created_at, is_read")
        .eq("report_id", report.id)
        .order("created_at", { ascending: true })
        .limit(100);

      // Decrypt messages
      const decryptedMessages = [];
      if (messages) {
        for (const message of messages) {
          try {
            // Decrypt message using organization-specific key
            const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT');
            if (!ENCRYPTION_SALT) {
              console.error('❌ ENCRYPTION_SALT environment variable is not configured');
              throw new Error('Server configuration error');
            }
            const keyMaterial = report.organization_id + ENCRYPTION_SALT;
            
            // Hash the key material using Web Crypto API
            const keyBuffer = new TextEncoder().encode(keyMaterial);
            const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
            const organizationKey = Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
            
            // Decrypt message using AES-GCM
            const combined = new Uint8Array(atob(message.encrypted_message).split('').map(c => c.charCodeAt(0)));
            const iv = combined.slice(0, 12);
            const encryptedData = combined.slice(12);
            
            const keyBytes = new Uint8Array(organizationKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            const cryptoKey = await crypto.subtle.importKey(
              'raw',
              keyBytes,
              { name: 'AES-GCM' },
              false,
              ['decrypt']
            );
            
            const decryptedBuffer = await crypto.subtle.decrypt(
              { name: 'AES-GCM', iv: iv },
              cryptoKey,
              encryptedData
            );
            
            const decryptedMessage = new TextDecoder().decode(decryptedBuffer);
            
            decryptedMessages.push({
              ...message,
              decrypted_message: decryptedMessage,
              encrypted_message: message.encrypted_message // Keep original for reference
            });
          } catch (error) {
            console.error('Failed to decrypt message:', error);
            // For backward compatibility, if decryption fails, return the original message
            decryptedMessages.push(message);
          }
        }
      }

      return new Response(
        JSON.stringify({
          report,
          organization: report.organizations,
          messages: decryptedMessages,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'send') {
      const message = String(body?.message || '').trim();
      // Get sender type from request body (defaults to 'whistleblower' for backwards compatibility)
      const senderType = body?.senderType === 'organization' ? 'organization' : 'whistleblower';
      
      console.log('📨 Sending message as:', senderType);
      
      // Validate message
      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (message.length < 1 || message.length > 2000) {
        return new Response(JSON.stringify({ error: "Message must be between 1 and 2000 characters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Basic XSS prevention - reject messages with script tags
      const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onload=/i;
      if (dangerousPatterns.test(message)) {
        return new Response(JSON.stringify({ error: "Message contains prohibited content" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const report = await getReportWithOrg();
      if (!report) {
        // Generic error message to prevent tracking ID enumeration
        return new Response(JSON.stringify({ error: "Invalid request" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Encrypt the message using organization-specific key
      console.log('🔐 Encrypting message for organization:', report.organization_id);
      
      // Use same encryption system as reports
      const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT');
      if (!ENCRYPTION_SALT) {
        console.error('❌ ENCRYPTION_SALT environment variable is not configured');
        return new Response(
          JSON.stringify({ error: 'Server configuration error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const keyMaterial = report.organization_id + ENCRYPTION_SALT;
      
      // Hash the key material using Web Crypto API
      const keyBuffer = new TextEncoder().encode(keyMaterial);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
      const organizationKey = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Encrypt message using AES-GCM
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const keyBytes = new Uint8Array(organizationKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      const messageBuffer = new TextEncoder().encode(message);
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        cryptoKey,
        messageBuffer
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64 for storage
      const encryptedMessage = btoa(String.fromCharCode(...combined));
      console.log('✅ Message encrypted successfully');

      const { data, error } = await supabase
        .from("report_messages")
        .insert({
          report_id: report.id,
          sender_type: senderType, // ✅ Use dynamic sender type
          encrypted_message: encryptedMessage,
        })
        .select("id, sender_type, encrypted_message, created_at, is_read")
        .single();

      if (error) {
        console.error('Insert message error', error);
        // Log failed attempt
        await supabase.rpc('log_messaging_attempt', {
          p_report_id: report.id,
          p_sender_type: senderType,
          p_success: false,
          p_failure_reason: error.message?.slice(0, 200) || 'insert_failed',
          p_ip_address: req.headers.get('x-forwarded-for') || null,
          p_user_agent: req.headers.get('user-agent') || null,
        });
        return new Response(JSON.stringify({ error: "Unable to send message" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log successful attempt
      await supabase.rpc('log_messaging_attempt', {
        p_report_id: report.id,
        p_sender_type: senderType,
        p_success: true,
        p_failure_reason: null,
        p_ip_address: req.headers.get('x-forwarded-for') || null,
        p_user_agent: req.headers.get('user-agent') || null,
      });

      // Log to audit trail
      await logAuditEvent(supabase, {
        eventType: 'report.message_sent',
        category: 'case_management',
        action: senderType === 'organization' ? 'Organization message sent via edge function' : 'Anonymous message sent via edge function',
        severity: 'low',
        actorType: 'user',
        actorEmail: senderType === 'organization' ? 'case_handler' : 'anonymous_whistleblower',
        actorIpAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        actorUserAgent: req.headers.get('user-agent') || null,
        targetType: 'report',
        targetId: report.id,
        targetName: report.tracking_id,
        summary: `${senderType === 'organization' ? 'Organization' : 'Anonymous'} message sent on report ${report.tracking_id}`,
        description: 'Message sent via anonymous messaging edge function',
        metadata: {
          message_length: message.length,
          sender_type: senderType,
          report_status: report.status,
        },
        organizationId: report.organization_id || (report as any).organizations?.id,
      });

      return new Response(JSON.stringify({ 
        message: {
          ...data,
          decrypted_message: message,
          encrypted_message: data.encrypted_message
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("anonymous-report-messaging error", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});