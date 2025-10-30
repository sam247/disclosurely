import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction using regex (fallback method)
// This extracts text streams from PDF without external dependencies
async function extractTextFromPDF(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('[PDF Extract] Starting extraction...');
    console.log('[PDF Extract] Buffer size:', fileBuffer.byteLength, 'bytes');

    // Convert to string for regex processing
    const decoder = new TextDecoder('latin1'); // PDFs often use latin1 encoding
    const pdfString = decoder.decode(new Uint8Array(fileBuffer));

    console.log('[PDF Extract] PDF decoded, searching for text streams...');

    // Extract text from PDF streams
    // This regex finds text between BT (Begin Text) and ET (End Text) operators
    const textRegex = /BT\s*(.*?)\s*ET/gs;
    const matches = pdfString.matchAll(textRegex);

    let extractedText = '';
    let streamCount = 0;

    for (const match of matches) {
      streamCount++;
      const textStream = match[1];

      // Extract text strings from the stream
      // Look for text in parentheses () or hex strings <>
      const stringRegex = /\(([^)]*)\)|<([0-9A-Fa-f]+)>/g;
      const strings = textStream.matchAll(stringRegex);

      for (const str of strings) {
        if (str[1]) {
          // Text in parentheses - decode PDF string encoding
          let text = str[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          extractedText += text + ' ';
        } else if (str[2]) {
          // Hex string - convert to text
          try {
            const hexStr = str[2];
            let text = '';
            for (let i = 0; i < hexStr.length; i += 2) {
              const byte = parseInt(hexStr.substring(i, i + 2), 16);
              if (byte > 31 && byte < 127) { // Printable ASCII
                text += String.fromCharCode(byte);
              }
            }
            extractedText += text + ' ';
          } catch (e) {
            console.warn('[PDF Extract] Failed to decode hex string:', e);
          }
        }
      }
    }

    console.log(`[PDF Extract] Processed ${streamCount} text streams`);

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n+/g, '\n') // Normalize newlines
      .trim();

    console.log(`[PDF Extract] SUCCESS! Extracted ${extractedText.length} characters`);
    console.log(`[PDF Extract] Preview: ${extractedText.substring(0, 200)}...`);

    if (extractedText.length === 0) {
      console.warn('[PDF Extract] No text extracted - PDF may be scanned/image-based');
      return '[This PDF appears to be image-based or empty. No text could be extracted. Consider using OCR software to extract text first.]';
    }

    return extractedText;

  } catch (error: any) {
    console.error('[PDF Extract] Detailed error:', {
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
