import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { extractText, getDocumentProxy } from 'https://esm.sh/unpdf@0.11.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PDF text extraction using unpdf (handles complex PDFs with proper encoding)
// Uses Mozilla PDF.js internally, optimized for serverless environments
// No external API required - completely free and unlimited!
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('[PDF Extract] Starting unpdf extraction...');
    console.log('[PDF Extract] Buffer size:', fileBuffer.byteLength, 'bytes');

    // Convert ArrayBuffer to Uint8Array for unpdf
    const uint8Array = new Uint8Array(fileBuffer);
    
    console.log('[PDF Extract] Loading PDF document...');
    
    // Get PDF document proxy
    const pdf = await getDocumentProxy(uint8Array);
    const totalPages = pdf.numPages;
    
    console.log(`[PDF Extract] PDF loaded - ${totalPages} pages`);
    
    // Extract text from all pages (merged into single string)
    const result = await extractText(pdf, { mergePages: true });
    const extractedText = result.text;
    
    console.log(`[PDF Extract] SUCCESS! Extracted ${extractedText.length} characters`);
    console.log(`[PDF Extract] Preview: ${extractedText.substring(0, 200)}...`);

    if (extractedText.length === 0) {
      console.warn('[PDF Extract] No text extracted - PDF may be image-based/scanned');
      return '[This PDF appears to be image-based or scanned. No text could be extracted. Please use OCR software to extract text first, or provide a text-based PDF.]';
    }

    return extractedText;

  } catch (error: any) {
    console.error('[PDF Extract] unpdf error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
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
