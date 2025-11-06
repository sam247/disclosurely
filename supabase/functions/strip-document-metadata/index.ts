import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Strip metadata from PDF files
 * Uses pdf-lib to remove metadata
 */
async function stripPdfMetadata(fileData: Uint8Array): Promise<Uint8Array> {
  try {
    // Import pdf-lib dynamically
    const { PDFDocument } = await import('https://cdn.skypack.dev/pdf-lib@1.17.1')

    // Load the PDF
    const pdfDoc = await PDFDocument.load(fileData)

    // Remove metadata
    pdfDoc.setTitle('')
    pdfDoc.setAuthor('')
    pdfDoc.setSubject('')
    pdfDoc.setKeywords([])
    pdfDoc.setProducer('')
    pdfDoc.setCreator('')
    pdfDoc.setCreationDate(new Date(0)) // Set to epoch
    pdfDoc.setModificationDate(new Date(0))

    // Save the cleaned PDF
    const cleanedPdfBytes = await pdfDoc.save()

    console.log('✅ PDF metadata stripped successfully')
    return cleanedPdfBytes
  } catch (error) {
    console.error('❌ Failed to strip PDF metadata:', error)
    // Return original if stripping fails (better than blocking upload)
    return fileData
  }
}

/**
 * Strip metadata from Office documents (.docx, .xlsx, .pptx)
 * These are ZIP files containing XML - we can modify the XML
 */
async function stripOfficeMetadata(fileData: Uint8Array): Promise<Uint8Array> {
  try {
    // Import JSZip for handling Office Open XML files
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default

    const zip = await JSZip.loadAsync(fileData)

    // Remove core.xml and app.xml which contain metadata
    const metadataFiles = [
      'docProps/core.xml',
      'docProps/app.xml',
      'docProps/custom.xml'
    ]

    for (const file of metadataFiles) {
      if (zip.files[file]) {
        zip.remove(file)
        console.log(`Removed metadata file: ${file}`)
      }
    }

    // Generate cleaned file
    const cleanedFile = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })

    console.log('✅ Office document metadata stripped successfully')
    return cleanedFile
  } catch (error) {
    console.error('❌ Failed to strip Office metadata:', error)
    // Return original if stripping fails
    return fileData
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the file from the request
    const formData = await req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing file: ${file.name} (${fileType})`)

    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer()
    const fileData = new Uint8Array(fileBuffer)

    let cleanedData: Uint8Array

    // Route to appropriate handler
    if (fileType === 'application/pdf') {
      cleanedData = await stripPdfMetadata(fileData)
    } else if (
      fileType.includes('officedocument') ||
      fileType.includes('msword') ||
      fileType.includes('ms-excel') ||
      fileType.includes('ms-powerpoint')
    ) {
      cleanedData = await stripOfficeMetadata(fileData)
    } else {
      // Unsupported type - return original
      console.log(`⚠️ Unsupported file type for metadata stripping: ${fileType}`)
      cleanedData = fileData
    }

    // Calculate size reduction
    const originalSize = fileData.length
    const cleanedSize = cleanedData.length
    const reduction = ((originalSize - cleanedSize) / originalSize * 100).toFixed(1)

    console.log(`Original size: ${(originalSize / 1024).toFixed(1)}KB`)
    console.log(`Cleaned size: ${(cleanedSize / 1024).toFixed(1)}KB`)
    console.log(`Reduction: ${reduction}%`)

    // Return the cleaned file
    return new Response(cleanedData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': file.type,
        'Content-Disposition': `attachment; filename="sanitized_${Date.now()}.${file.name.split('.').pop()}"`,
        'X-Original-Size': originalSize.toString(),
        'X-Cleaned-Size': cleanedSize.toString(),
        'X-Size-Reduction': reduction
      }
    })

  } catch (error) {
    console.error('Error in strip-document-metadata function:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to strip document metadata'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
