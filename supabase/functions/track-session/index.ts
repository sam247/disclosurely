import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple device detection from user agent
function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  let deviceType = 'desktop';
  let deviceName = 'Unknown Device';
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect device type
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  }

  // Detect OS
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  // Detect browser
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // Detect device name (for mobile)
  if (deviceType === 'mobile') {
    if (ua.includes('iphone')) {
      const match = ua.match(/iphone\s*os\s*(\d+)/);
      deviceName = match ? `iPhone (iOS ${match[1]})` : 'iPhone';
    } else if (ua.includes('android')) {
      deviceName = 'Android Device';
    }
  } else if (deviceType === 'tablet') {
    if (ua.includes('ipad')) {
      deviceName = 'iPad';
    } else {
      deviceName = 'Tablet';
    }
  } else {
    deviceName = `${browser} on ${os}`;
  }

  return { deviceType, deviceName, browser, os };
}

// Get location from IP (using a free IP geolocation service)
async function getLocationFromIP(ip: string): Promise<{
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}> {
  try {
    // Using ipapi.co (free tier: 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error('Location service unavailable');
    
    const data = await response.json();
    return {
      city: data.city || null,
      country: data.country_name || null,
      lat: data.latitude || null,
      lng: data.longitude || null,
    };
  } catch (error) {
    console.error('Error fetching location:', error);
    return { city: null, country: null, lat: null, lng: null };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { action, sessionId, userId, userAgent, ipAddress } = await req.json();

    if (!userId || !sessionId) {
      throw new Error('Missing required parameters');
    }

    // Get IP from request if not provided
    const clientIP = ipAddress || req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 'unknown';

    // Detect device info
    const deviceInfo = detectDevice(userAgent || req.headers.get('user-agent') || '');

    // Get location (only for new sessions to avoid rate limits)
    let location = { city: null, country: null, lat: null, lng: null };
    if (action === 'create' && clientIP !== 'unknown') {
      location = await getLocationFromIP(clientIP);
    }

    switch (action) {
      case 'create': {
        // First, clean up expired sessions
        await supabase.rpc('cleanup_expired_sessions');

        // Check for existing active sessions (only non-expired ones with recent activity)
        const { data: existingSessions, error: checkError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .gte('last_activity_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Only sessions active in last 24 hours

        if (checkError) throw checkError;

        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            session_id: sessionId,
            device_type: deviceInfo.deviceType,
            device_name: deviceInfo.deviceName,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            ip_address: clientIP !== 'unknown' ? clientIP : null,
            location_city: location.city,
            location_country: location.country,
            location_lat: location.lat,
            location_lng: location.lng,
            user_agent: userAgent || req.headers.get('user-agent') || null,
            is_active: true,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .select()
          .single();

        if (createError) throw createError;

        // If there are other active sessions, return them
        const otherSessions = existingSessions?.filter(s => s.session_id !== sessionId) || [];

        return new Response(
          JSON.stringify({
            success: true,
            session: newSession,
            hasOtherSessions: otherSessions.length > 0,
            otherSessions: otherSessions.length > 0 ? otherSessions[0] : null, // Return first other session
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'check_other_sessions': {
        // First, clean up expired sessions
        await supabase.rpc('cleanup_expired_sessions');

        // Check for other active sessions without creating a new one
        // Only include sessions that haven't expired and have recent activity (within last 24 hours)
        const { data: otherSessions, error: checkError } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .neq('session_id', sessionId)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
          .gte('last_activity_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Only sessions active in last 24 hours

        if (checkError) throw checkError;

        return new Response(
          JSON.stringify({
            success: true,
            hasOtherSessions: (otherSessions?.length || 0) > 0,
            otherSessions: (otherSessions?.length || 0) > 0 ? otherSessions[0] : null, // Return first other session
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'update_activity': {
        const { error: updateError } = await supabase
          .from('user_sessions')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('session_id', sessionId)
          .eq('is_active', true);

        if (updateError) throw updateError;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'deactivate_other': {
        // Deactivate all other sessions for this user
        const { error: deactivateError } = await supabase
          .from('user_sessions')
          .update({ is_active: false, last_activity_at: new Date().toISOString() })
          .eq('user_id', userId)
          .neq('session_id', sessionId);

        if (deactivateError) throw deactivateError;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'deactivate_all': {
        // Deactivate all sessions for this user
        const { error: deactivateError } = await supabase
          .from('user_sessions')
          .update({ is_active: false, last_activity_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (deactivateError) throw deactivateError;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      case 'deactivate_session': {
        // Deactivate a specific session (used on logout)
        const { error: deactivateError } = await supabase
          .from('user_sessions')
          .update({ is_active: false, last_activity_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('session_id', sessionId);

        if (deactivateError) throw deactivateError;

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Session tracking error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process session request',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

