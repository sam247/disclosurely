import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction using pdf-parse
// Note: For production, consider using a dedicated service like AWS Textract or Azure Form Recognizer
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    // Import pdf-parse dynamically
    const pdfParse = await import('https://esm.sh/pdf-parse@1.1.1');
    
    const data = await pdfParse.default(Buffer.from(fileBuffer));
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to extract text from PDF');
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
