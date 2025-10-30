import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PDF text extraction using pdf.co API (handles complex PDFs with font encodings)
// Free tier: 300 API calls/month
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('[PDF Extract] Starting extraction...');
    console.log('[PDF Extract] Buffer size:', fileBuffer.byteLength, 'bytes');

    const apiKey = Deno.env.get('PDFCO_API_KEY');
    
    if (!apiKey) {
      console.warn('[PDF Extract] PDF.co API key not configured, using fallback parser');
      return await extractTextFromPDFFallback(fileBuffer);
    }

    // Convert buffer to base64
    const bytes = new Uint8Array(fileBuffer);
    const base64 = btoa(String.fromCharCode(...bytes));

    console.log('[PDF Extract] Calling pdf.co API...');

    // Call pdf.co text extraction API
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64,
        inline: true,
        pages: '0-', // All pages
      }),
    });

    if (!response.ok) {
      console.error('[PDF Extract] API error:', response.status, await response.text());
      return await extractTextFromPDFFallback(fileBuffer);
    }

    const result = await response.json();
    
    if (!result.body) {
      console.error('[PDF Extract] No text in API response, using fallback');
      return await extractTextFromPDFFallback(fileBuffer);
    }

    const extractedText = result.body;
    console.log(`[PDF Extract] SUCCESS via pdf.co! Extracted ${extractedText.length} characters`);
    console.log(`[PDF Extract] Preview: ${extractedText.substring(0, 200)}...`);

    return extractedText;

  } catch (error: any) {
    console.error('[PDF Extract] API error, using fallback:', error);
    return await extractTextFromPDFFallback(fileBuffer);
  }
}

// Fallback: Simple regex-based extraction (works for simple PDFs only)
async function extractTextFromPDFFallback(fileBuffer: ArrayBuffer): Promise<string> {
  console.log('[PDF Extract] Using fallback regex parser...');
  
  const decoder = new TextDecoder('latin1');
  const pdfString = decoder.decode(new Uint8Array(fileBuffer));

  const textRegex = /BT\s*(.*?)\s*ET/gs;
  const matches = pdfString.matchAll(textRegex);

  let extractedText = '';
  let streamCount = 0;

  for (const match of matches) {
    streamCount++;
    const textStream = match[1];
    const stringRegex = /\(([^)]*)\)|<([0-9A-Fa-f]+)>/g;
    const strings = textStream.matchAll(stringRegex);

    for (const str of strings) {
      if (str[1]) {
        let text = str[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        extractedText += text + ' ';
      }
    }
  }

  extractedText = extractedText
    .replace(/\s+/g, ' ')
    .trim();

  console.log(`[PDF Extract] Fallback extracted ${extractedText.length} chars from ${streamCount} streams`);

  if (extractedText.length === 0 || extractedText.length < 100 || /[^\x20-\x7E\n\r\t]/.test(extractedText.substring(0, 200))) {
    console.warn('[PDF Extract] Extracted text appears garbled or empty');
    return '[This PDF uses custom font encodings and requires a PDF.co API key to extract properly. Please add PDFCO_API_KEY to your environment variables, or convert the PDF to a simpler format.]';
  }

  return extractedText;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[PDF Extract] Function invoked');

    const { filePath } = await req.json();
    console.log('[PDF Extract] Requested file:', filePath);

    if (!filePath) {
      console.error('[PDF Extract] No filePath provided');
      return new Response(
        JSON.stringify({ error: 'filePath is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[PDF Extract] Downloading file from storage...');

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ai-helper-docs')
      .download(filePath);

    if (downloadError) {
      console.error('[PDF Extract] Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    console.log('[PDF Extract] File downloaded successfully');

    // Convert to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    console.log('[PDF Extract] ArrayBuffer created, size:', arrayBuffer.byteLength);

    // Extract text based on file type
    let extractedText: string;
    
    if (filePath.toLowerCase().endsWith('.pdf')) {
      extractedText = await extractTextFromPDF(arrayBuffer);
    } else if (filePath.toLowerCase().endsWith('.txt')) {
      // Plain text file
      const decoder = new TextDecoder('utf-8');
      extractedText = decoder.decode(arrayBuffer);
    } else {
      // For .doc, .docx - just return a message for now
      // In production, use mammoth or similar library
      extractedText = '[Document content extraction not yet supported for this file type. Please convert to PDF or TXT.]';
    }

    // Trim and limit size (max 50k chars to avoid token limits)
    const trimmedText = extractedText.slice(0, 50000).trim();

    return new Response(
      JSON.stringify({ 
        text: trimmedText,
        length: trimmedText.length,
        truncated: extractedText.length > 50000
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
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
