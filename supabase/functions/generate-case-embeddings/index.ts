import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

/**
 * Generate vector embedding for a case and store it in the database
 * This function is called when a case is created or updated
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'caseId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role (bypasses RLS)
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

    // Fetch case data
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, organization_id, title, encrypted_content, encryption_key_hash, report_type, tags, status, priority')
      .eq('id', caseId)
      .single();

    if (reportError || !report) {
      console.error('❌ Failed to fetch report:', reportError);
      return new Response(
        JSON.stringify({ error: 'Report not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt case content to build text for embedding
    const ENCRYPTION_SALT = Deno.env.get('ENCRYPTION_SALT');
    if (!ENCRYPTION_SALT) {
      console.error('❌ ENCRYPTION_SALT not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let caseText = report.title; // Always include title

    // Try to decrypt content for embedding (if decryption fails, use title only)
    try {
      const keyMaterial = report.organization_id + ENCRYPTION_SALT;
      const keyBuffer = new TextEncoder().encode(keyMaterial);
      const hashBuffer = await crypto.subtle.digest('SHA-256', keyBuffer);
      const organizationKey = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const combined = new Uint8Array(atob(report.encrypted_content).split('').map(c => c.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const encryptedDataBytes = combined.slice(12);

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
        encryptedDataBytes
      );

      const decryptedString = new TextDecoder().decode(decryptedBuffer);
      const decryptedData = JSON.parse(decryptedString);

      // Build text for embedding: title + description + category + tags
      caseText = [
        report.title,
        decryptedData.description || '',
        decryptedData.category || '',
        report.report_type || '',
        report.tags?.join(' ') || ''
      ].filter(Boolean).join(' ');
    } catch (decryptError) {
      console.warn('⚠️ Failed to decrypt content for embedding, using title only:', decryptError);
      // Continue with title only
    }

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: caseText,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ OpenAI embedding API error:', errorData);
      throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from OpenAI');
    }

    // Store embedding in database
    const { error: updateError } = await supabase
      .from('reports')
      .update({ embedding: `[${embedding.join(',')}]` })
      .eq('id', caseId);

    if (updateError) {
      console.error('❌ Failed to store embedding:', updateError);
      throw updateError;
    }

    console.log('✅ Successfully generated and stored embedding for case:', caseId);

    return new Response(
      JSON.stringify({ 
        success: true,
        caseId,
        embeddingDimensions: embedding.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error generating case embedding:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate embedding',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

