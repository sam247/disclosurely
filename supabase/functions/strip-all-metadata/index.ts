import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Inline CORS utility (MCP deployment doesn't support shared files)
async function getAllowedOrigin(req: Request, supabaseClient?: any): Promise<string> {
  const origin = req.headers.get('origin');
  
  if (!origin) {
    return 'https://disclosurely.com';
  }
  
  const allowedDomains = [
    'https://disclosurely.com',
    'https://www.disclosurely.com',
    'https://app.disclosurely.com',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  if (allowedDomains.includes(origin)) {
    return origin;
  }
  
  if (origin.includes('.lovable.app') || origin.includes('.lovableproject.com')) {
    return origin;
  }
  
  if (supabaseClient) {
    try {
      const domain = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const { data: customDomain } = await supabaseClient
        .from('custom_domains')
        .select('domain_name, is_active, status')
        .eq('domain_name', domain)
        .maybeSingle();
      
      if (customDomain && customDomain.is_active && customDomain.status === 'active') {
        return origin;
      }
      
      const domainParts = domain.split('.');
      if (domainParts.length > 2) {
        const parentDomain = domainParts.slice(-2).join('.');
        const { data: parentCustomDomain } = await supabaseClient
          .from('custom_domains')
          .select('domain_name, is_active, status')
          .eq('domain_name', parentDomain)
          .maybeSingle();
        
        if (parentCustomDomain && parentCustomDomain.is_active && parentCustomDomain.status === 'active') {
          return origin;
        }
      }
    } catch (error) {
      console.error('[strip-all-metadata] Error checking custom domain:', error);
    }
  }
  
  return origin;
}

function getCorsHeaders(req: Request, allowedOrigin?: string) {
  const origin = allowedOrigin || req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': origin !== '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

// Default CORS headers for error responses
const defaultCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB for videos (larger timeout needed)

/**
 * Detect file type using magic bytes (more reliable than MIME type)
 */
function detectFileType(data: Uint8Array, mimeType: string): string {
  // Check magic bytes
  if (data.length >= 4) {
    // PDF: %PDF
    if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) {
      return 'application/pdf'
    }
    // ZIP/Office: PK\x03\x04
    if (data[0] === 0x50 && data[1] === 0x4B && data[2] === 0x03 && data[3] === 0x04) {
      // Check if it's an Office document
      if (mimeType.includes('officedocument') || mimeType.includes('msword') || 
          mimeType.includes('ms-excel') || mimeType.includes('ms-powerpoint')) {
        return mimeType
      }
      return 'application/zip'
    }
    // JPEG: FF D8 FF
    if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) {
      return 'image/jpeg'
    }
    // PNG: 89 50 4E 47
    if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) {
      return 'image/png'
    }
    // GIF: 47 49 46 38
    if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38) {
      return 'image/gif'
    }
    // WebP: RIFF...WEBP
    if (data.length >= 12 && 
        data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
        data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) {
      return 'image/webp'
    }
    // MP4: ftyp box
    if (data.length >= 12 && data[4] === 0x66 && data[5] === 0x74 && data[6] === 0x79 && data[7] === 0x70) {
      return 'video/mp4'
    }
    // MP3: ID3 tag or FF Fx
    if ((data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33) ||
        (data[0] === 0xFF && (data[1] & 0xE0) === 0xE0)) {
      return 'audio/mpeg'
    }
  }
  
  // Fallback to provided MIME type
  return mimeType
}

/**
 * Check if FFmpeg is available on the system
 */
async function isFFmpegAvailable(): Promise<boolean> {
  try {
    const command = new Deno.Command('ffmpeg', {
      args: ['-version'],
      stdout: 'null',
      stderr: 'null',
    })
    const { code } = await command.output()
    return code === 0
  } catch {
    return false
  }
}

/**
 * Strip metadata from video/audio files
 * For MP3: Removes ID3 tags without FFmpeg
 * For MP4/Videos: Requires FFmpeg to be installed on the server
 * FFmpeg command: ffmpeg -i input -map_metadata -1 -c copy output
 */
async function stripVideoAudioMetadata(fileData: Uint8Array, fileType: string): Promise<Uint8Array> {
  try {
    // Handle MP3 files - can be processed without FFmpeg
    if (fileType === 'audio/mpeg' || fileType === 'audio/mp3') {
      console.log('Processing MP3 file - removing ID3 tags')
      let cleanedData = fileData

      // Remove ID3v2 tag (at the beginning)
      if (fileData.length >= 10 &&
          fileData[0] === 0x49 && fileData[1] === 0x44 && fileData[2] === 0x33) {
        const tagSize = (fileData[6] << 21) | (fileData[7] << 14) |
                        (fileData[8] << 7) | fileData[9]
        const headerSize = 10
        cleanedData = fileData.slice(headerSize + tagSize)
        console.log(`✓ Removed ID3v2 tag: ${headerSize + tagSize} bytes`)
      }

      // Remove ID3v1 tag (at the end - 128 bytes)
      if (cleanedData.length >= 128) {
        const end = cleanedData.slice(-128)
        if (end[0] === 0x54 && end[1] === 0x41 && end[2] === 0x47) {
          cleanedData = cleanedData.slice(0, -128)
          console.log('✓ Removed ID3v1 tag: 128 bytes')
        }
      }

      return cleanedData
    }

    // Handle video files (MP4, etc) - requires FFmpeg
    if (fileType.startsWith('video/') || fileType === 'audio/mp4') {
      const ffmpegAvailable = await isFFmpegAvailable()

      if (!ffmpegAvailable) {
        throw new Error(
          'FFmpeg is not available. Video metadata stripping requires FFmpeg to be installed. ' +
          'Please install FFmpeg on your server: https://www.ffmpeg.org/download.html'
        )
      }

      console.log('Processing video file with FFmpeg - removing all metadata')

      // Create temporary files
      const tempDir = await Deno.makeTempDir()
      const inputPath = `${tempDir}/input${fileType === 'video/mp4' ? '.mp4' : ''}`
      const outputPath = `${tempDir}/output${fileType === 'video/mp4' ? '.mp4' : ''}`

      try {
        // Write input file
        await Deno.writeFile(inputPath, fileData)

        // Run FFmpeg to strip metadata
        // -i: input file
        // -map_metadata -1: strip all metadata
        // -c copy: copy codec (no re-encoding for speed)
        // -fflags +bitexact: avoid encoding metadata
        // -y: overwrite output file
        const command = new Deno.Command('ffmpeg', {
          args: [
            '-i', inputPath,
            '-map_metadata', '-1',
            '-c', 'copy',
            '-fflags', '+bitexact',
            '-y',
            outputPath
          ],
          stdout: 'piped',
          stderr: 'piped',
        })

        const { code, stderr } = await command.output()

        if (code !== 0) {
          const errorOutput = new TextDecoder().decode(stderr)
          console.error('FFmpeg error:', errorOutput)
          throw new Error(`FFmpeg failed with code ${code}`)
        }

        // Read the cleaned file
        const cleanedData = await Deno.readFile(outputPath)
        console.log(`✓ FFmpeg processing complete. Original: ${fileData.length} bytes, Cleaned: ${cleanedData.length} bytes`)

        return cleanedData

      } finally {
        // Clean up temporary files
        try {
          await Deno.remove(tempDir, { recursive: true })
        } catch (e) {
          console.warn('Failed to clean up temp directory:', e)
        }
      }
    }

    // Other formats not supported
    throw new Error(`Video/Audio metadata stripping for ${fileType} requires FFmpeg service`)
  } catch (error) {
    console.error('❌ Failed to strip video/audio metadata:', error)
    throw error
  }
}

/**
 * Strip metadata from image files
 * For JPEG: Remove EXIF segments (0xFFE1)
 * For PNG: Remove ancillary chunks (tEXt, iTXt, zTXt)
 * For WebP: Remove EXIF chunks
 */
async function stripImageMetadata(fileData: Uint8Array, fileType: string): Promise<Uint8Array> {
  try {
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      // JPEG EXIF removal: Remove all APP segments (0xFFE0-0xFFEF)
      // Keep only SOI (0xFFD8) and EOI (0xFFD9) markers
      const result: number[] = []
      let i = 0
      
      // Start with SOI marker
      if (fileData[i] === 0xFF && fileData[i + 1] === 0xD8) {
        result.push(fileData[i], fileData[i + 1])
        i += 2
      } else {
        throw new Error('Invalid JPEG file')
      }
      
      // Process segments
      while (i < fileData.length - 1) {
        if (fileData[i] === 0xFF) {
          const marker = fileData[i + 1]
          
          // End of image
          if (marker === 0xD9) {
            result.push(fileData[i], fileData[i + 1])
            break
          }
          
          // APP segments (0xFFE0-0xFFEF) contain metadata - skip them
          if (marker >= 0xE0 && marker <= 0xEF) {
            const segmentLength = (fileData[i + 2] << 8) | fileData[i + 3]
            i += 2 + segmentLength
            continue
          }
          
          // Other segments - keep them
          if (marker === 0xDA) {
            // Start of scan - copy rest of file
            while (i < fileData.length) {
              result.push(fileData[i])
              i++
            }
            break
          }
          
          // Copy segment header
          result.push(fileData[i], fileData[i + 1])
          i += 2
          
          // Copy segment length
          if (i < fileData.length - 1) {
            const segmentLength = (fileData[i] << 8) | fileData[i + 1]
            result.push(fileData[i], fileData[i + 1])
            i += 2
            
            // Copy segment data
            for (let j = 0; j < segmentLength - 2 && i < fileData.length; j++) {
              result.push(fileData[i])
              i++
            }
          }
        } else {
          result.push(fileData[i])
          i++
        }
      }
      
      return new Uint8Array(result)
      
    } else if (fileType === 'image/png') {
      // PNG: Remove ancillary chunks (tEXt, iTXt, zTXt, tIME, etc.)
      // Keep only critical chunks: IHDR, PLTE, IDAT, IEND
      const result: number[] = []
      let i = 0
      
      // PNG signature
      const signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
      for (let j = 0; j < signature.length; j++) {
        if (fileData[i + j] !== signature[j]) {
          throw new Error('Invalid PNG file')
        }
        result.push(fileData[i + j])
      }
      i += 8
      
      // Process chunks
      while (i < fileData.length - 8) {
        const length = (fileData[i] << 24) | (fileData[i + 1] << 16) | 
                       (fileData[i + 2] << 8) | fileData[i + 3]
        const chunkType = String.fromCharCode(
          fileData[i + 4], fileData[i + 5], fileData[i + 6], fileData[i + 7]
        )
        
        // Critical chunks or safe ancillary chunks
        const criticalChunks = ['IHDR', 'PLTE', 'IDAT', 'IEND']
        const safeAncillary = ['tRNS', 'bKGD', 'pHYs', 'sRGB']
        
        if (criticalChunks.includes(chunkType) || safeAncillary.includes(chunkType)) {
          // Copy chunk
          for (let j = 0; j < 8 + length + 4; j++) {
            result.push(fileData[i + j])
          }
        }
        // Skip metadata chunks (tEXt, iTXt, zTXt, tIME, etc.)
        
        i += 8 + length + 4 // length + type + data + CRC
      }
      
      return new Uint8Array(result)
      
    } else if (fileType === 'image/webp') {
      // WebP: Remove EXIF chunk
      // WebP format: RIFF header + WEBP + VP8/VP8L/VP8X + chunks
      if (fileData.length < 12) {
        return fileData
      }
      
      // Check RIFF header
      if (fileData[0] !== 0x52 || fileData[1] !== 0x49 || 
          fileData[2] !== 0x46 || fileData[3] !== 0x46) {
        return fileData
      }
      
      // For simplicity, return as-is (WebP EXIF removal is complex)
      // In production, consider using a library or service
      console.log('⚠️ WebP metadata stripping - basic implementation')
      return fileData
      
    } else if (fileType === 'image/gif' || fileType === 'image/svg+xml') {
      // GIF and SVG don't typically have EXIF metadata
      return fileData
    }
    
    // Unknown image type
    return fileData
  } catch (error) {
    console.error('❌ Failed to strip image metadata:', error)
    throw new Error('Failed to strip image metadata')
  }
}

/**
 * Strip metadata from PDF files using pdf-lib
 */
async function stripPdfMetadata(fileData: Uint8Array): Promise<Uint8Array> {
  try {
    const { PDFDocument } = await import('https://cdn.skypack.dev/pdf-lib@1.17.1')
    
    const pdfDoc = await PDFDocument.load(fileData)
    
    // Remove all metadata
    pdfDoc.setTitle('')
    pdfDoc.setAuthor('')
    pdfDoc.setSubject('')
    pdfDoc.setKeywords([])
    pdfDoc.setProducer('')
    pdfDoc.setCreator('')
    pdfDoc.setCreationDate(new Date(0))
    pdfDoc.setModificationDate(new Date(0))
    
    // Remove custom properties
    const customProperties = pdfDoc.getCustomProperties()
    for (const key of Object.keys(customProperties)) {
      pdfDoc.removeCustomProperty(key)
    }
    
    const cleanedPdfBytes = await pdfDoc.save()
    
    console.log('✅ PDF metadata stripped successfully')
    return cleanedPdfBytes
  } catch (error) {
    console.error('❌ Failed to strip PDF metadata:', error)
    throw new Error('Failed to strip PDF metadata')
  }
}

/**
 * Strip metadata from Office documents (.docx, .xlsx, .pptx)
 * These are ZIP files containing XML - we remove docProps XML files
 */
async function stripOfficeMetadata(fileData: Uint8Array): Promise<Uint8Array> {
  try {
    const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default
    
    const zip = await JSZip.loadAsync(fileData)
    
    // Remove all metadata files
    const metadataFiles = [
      'docProps/core.xml',
      'docProps/app.xml',
      'docProps/custom.xml',
      '[Content_Types].xml' // May contain metadata references
    ]
    
    let metadataFound = false
    for (const file of metadataFiles) {
      if (zip.files[file]) {
        zip.remove(file)
        metadataFound = true
        console.log(`Removed metadata file: ${file}`)
      }
    }
    
    // Also check for any files in docProps folder
    for (const filename of Object.keys(zip.files)) {
      if (filename.startsWith('docProps/')) {
        zip.remove(filename)
        metadataFound = true
        console.log(`Removed metadata file: ${filename}`)
      }
    }
    
    if (!metadataFound) {
      console.log('⚠️ No metadata files found in Office document')
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
    throw new Error('Failed to strip Office metadata')
  }
}

/**
 * Log metadata stripping operation to audit table
 */
async function logMetadataStripping(
  supabaseClient: any,
  fileName: string,
  fileType: string,
  originalSize: number,
  cleanedSize: number,
  metadataFound: boolean,
  userId?: string,
  reportId?: string
): Promise<void> {
  try {
    const { error } = await supabaseClient
      .from('metadata_stripping_audit')
      .insert({
        file_name: fileName,
        file_type: fileType,
        original_size: originalSize,
        cleaned_size: cleanedSize,
        metadata_found: metadataFound,
        user_id: userId || null,
        report_id: reportId || null,
        stripped_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Failed to log metadata stripping:', error)
      // Don't throw - logging failure shouldn't break the operation
    }
  } catch (error) {
    console.error('Error logging metadata stripping:', error)
    // Don't throw - logging failure shouldn't break the operation
  }
}

serve(async (req) => {
  // Create Supabase client for CORS checks
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Handle CORS preflight requests FIRST
  if (req.method === 'OPTIONS') {
    try {
      const allowedOrigin = await getAllowedOrigin(req, supabaseClient);
      const corsHeaders = getCorsHeaders(req, allowedOrigin);
      return new Response(null, { status: 200, headers: corsHeaders });
    } catch (error) {
      console.error('[strip-all-metadata] CORS error:', error);
      return new Response(null, { status: 200, headers: defaultCorsHeaders });
    }
  }

  // Get proper CORS headers for the request
  let corsHeaders;
  try {
    const allowedOrigin = await getAllowedOrigin(req, supabaseClient);
    corsHeaders = getCorsHeaders(req, allowedOrigin);
  } catch (error) {
    console.error('[strip-all-metadata] CORS error:', error);
    corsHeaders = defaultCorsHeaders;
  }

  try {
    // Get the file from the request
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get optional parameters
    const userId = formData.get('userId') as string | null
    const reportId = formData.get('reportId') as string | null

    console.log(`Processing file: ${file.name} (${file.type}), size: ${file.size} bytes`)

    // Convert file to Uint8Array
    const fileBuffer = await file.arrayBuffer()
    const fileData = new Uint8Array(fileBuffer)

    // Detect file type using magic bytes (don't trust client)
    const detectedType = detectFileType(fileData, file.type)
    console.log(`Detected file type: ${detectedType} (client provided: ${file.type})`)

    // Check file size based on type
    const isVideo = detectedType.startsWith('video/')
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE

    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({
          error: `File size exceeds maximum of ${maxSize / 1024 / 1024}MB for ${isVideo ? 'videos' : 'files'}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Reject WebP and GIF files
    if (detectedType === 'image/webp') {
      return new Response(
        JSON.stringify({ error: 'WebP files are not supported. Please use JPEG or PNG.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (detectedType === 'image/gif') {
      return new Response(
        JSON.stringify({ error: 'GIF files are not supported. Please use JPEG or PNG.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const originalSize = fileData.length
    let cleanedData: Uint8Array
    let metadataFound = false
    let errorMessage: string | null = null

    try {
      // Route to appropriate handler
      if (detectedType.startsWith('video/') || detectedType.startsWith('audio/')) {
        cleanedData = await stripVideoAudioMetadata(fileData, detectedType)
        metadataFound = true // Assume metadata was present
      } else if (detectedType.startsWith('image/')) {
        const beforeSize = fileData.length
        cleanedData = await stripImageMetadata(fileData, detectedType)
        metadataFound = cleanedData.length !== beforeSize || detectedType === 'image/jpeg' || detectedType === 'image/jpg'
      } else if (detectedType === 'application/pdf') {
        cleanedData = await stripPdfMetadata(fileData)
        metadataFound = true // PDFs typically have metadata
      } else if (
        detectedType.includes('officedocument') ||
        detectedType.includes('msword') ||
        detectedType.includes('ms-excel') ||
        detectedType.includes('ms-powerpoint') ||
        detectedType === 'application/zip' // Could be Office doc
      ) {
        cleanedData = await stripOfficeMetadata(fileData)
        metadataFound = true // Office docs typically have metadata
      } else {
        // Unsupported file type
        errorMessage = `Unsupported file type: ${detectedType}. Supported types: images, videos, audio, PDFs, Office documents.`
        console.error(`❌ ${errorMessage}`)
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Calculate size reduction
      const cleanedSize = cleanedData.length
      const reduction = originalSize !== cleanedSize 
        ? ((originalSize - cleanedSize) / originalSize * 100).toFixed(1)
        : '0.0'

      console.log(`Original size: ${(originalSize / 1024).toFixed(1)}KB`)
      console.log(`Cleaned size: ${(cleanedSize / 1024).toFixed(1)}KB`)
      console.log(`Reduction: ${reduction}%`)

      // Log to audit table
      await logMetadataStripping(
        supabaseClient,
        file.name,
        detectedType,
        originalSize,
        cleanedSize,
        metadataFound,
        userId || undefined,
        reportId || undefined
      )

      // Return the cleaned file
      return new Response(cleanedData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': detectedType,
          'Content-Disposition': `attachment; filename="sanitized_${Date.now()}.${file.name.split('.').pop()}"`,
          'X-Original-Size': originalSize.toString(),
          'X-Cleaned-Size': cleanedSize.toString(),
          'X-Size-Reduction': reduction,
          'X-Metadata-Found': metadataFound.toString()
        }
      })

    } catch (processingError) {
      console.error('❌ Error processing file:', processingError)
      errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error'
      
      // Log the failure
      await logMetadataStripping(
        supabaseClient,
        file.name,
        detectedType,
        originalSize,
        originalSize,
        false,
        userId || undefined,
        reportId || undefined
      )

      // NEVER return original file if stripping fails
      return new Response(
        JSON.stringify({
          error: 'Failed to strip metadata',
          details: errorMessage
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Error in strip-all-metadata function:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Failed to process file'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

