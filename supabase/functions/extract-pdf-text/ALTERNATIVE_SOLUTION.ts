// ALTERNATIVE: Use PDF.co API for robust PDF extraction
// This is a backup solution if the regex approach doesn't work for complex PDFs

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use PDF.co (free tier: 300 API calls/month)
// Sign up at https://pdf.co and get API key
async function extractTextFromPDFViaPdfCo(fileUrl: string): Promise<string> {
  const apiKey = Deno.env.get('PDFCO_API_KEY');

  if (!apiKey) {
    throw new Error('PDFCO_API_KEY not configured');
  }

  const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      url: fileUrl,
      async: false
    })
  });

  const result = await response.json();

  if (!result.body) {
    throw new Error(result.message || 'PDF.co extraction failed');
  }

  // Download extracted text
  const textResponse = await fetch(result.url);
  return await textResponse.text();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PDF Extract] Function invoked');
    const { filePath } = await req.json();

    if (!filePath) {
      return new Response(
        JSON.stringify({ error: 'filePath is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get a signed URL for the PDF (valid for 60 seconds)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('ai-helper-docs')
      .createSignedUrl(filePath, 60);

    if (urlError || !signedUrlData) {
      throw new Error(`Failed to create signed URL: ${urlError?.message}`);
    }

    console.log('[PDF Extract] Signed URL created, calling PDF.co...');

    // Use PDF.co to extract text
    const extractedText = await extractTextFromPDFViaPdfCo(signedUrlData.signedUrl);

    console.log(`[PDF Extract] SUCCESS! Extracted ${extractedText.length} characters`);

    return new Response(
      JSON.stringify({
        text: extractedText.slice(0, 50000).trim(),
        length: extractedText.length,
        truncated: extractedText.length > 50000
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[PDF Extract] Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        fallback: 'Failed to extract document text. The AI will analyze based on the case details alone.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
