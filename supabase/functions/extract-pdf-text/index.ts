import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore - pdfjs types not available
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PDF text extraction using Mozilla's PDF.js (Deno-compatible)
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('[PDF Extract] Starting PDF.js extraction...');
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(fileBuffer),
      useSystemFonts: true,
      standardFontDataUrl: 'https://esm.sh/pdfjs-dist@3.11.174/standard_fonts/',
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    console.log(`[PDF Extract] Document has ${numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      console.log(`[PDF Extract] Page ${pageNum}/${numPages} extracted (${pageText.length} chars)`);
    }
    
    console.log(`[PDF Extract] Total extracted: ${fullText.length} characters`);
    return fullText.trim();
    
  } catch (error) {
    console.error('[PDF Extract] PDF.js parsing error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('ai-helper-docs')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();

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
