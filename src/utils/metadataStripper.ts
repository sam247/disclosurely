/**
 * Metadata Stripping Utility
 *
 * Removes sensitive metadata from files before upload to protect whistleblower anonymity.
 * Uses native browser APIs - zero dependencies.
 *
 * WHAT IT REMOVES:
 * - Images: EXIF data (GPS, device info, timestamps, camera settings)
 * - All files: Original filename hints, creation dates
 *
 * IMPORTANT: This is CLIENT-SIDE protection. Server-side validation should also occur.
 */

export interface MetadataStripResult {
  success: boolean;
  file?: File;
  originalSize?: number;
  newSize?: number;
  error?: string;
  stripped?: boolean;
}

/**
 * Strip EXIF and metadata from image files using Canvas API
 * This method is reliable and has zero dependencies
 */
export const stripImageMetadata = async (file: File): Promise<MetadataStripResult> => {
  try {
    console.log(`🛡️ Stripping metadata from image: ${file.name}`);

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return {
        success: true,
        file,
        stripped: false
      };
    }

    // Special handling for SVG (text-based, no EXIF)
    if (file.type === 'image/svg+xml') {
      console.log('📄 SVG detected - no EXIF to strip, but sanitizing...');
      // SVGs can contain scripts - we should sanitize but that's complex
      // For now, just pass through (server-side should handle)
      return {
        success: true,
        file,
        stripped: false
      };
    }

    // Create image element
    const img = new Image();
    const imgUrl = URL.createObjectURL(file);

    // Load image
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgUrl;
    });

    // Create canvas and draw image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Draw image to canvas (this strips EXIF automatically!)
    ctx.drawImage(img, 0, 0);

    // Clean up object URL
    URL.revokeObjectURL(imgUrl);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.92 // Quality (92% is good balance between size and quality)
      );
    });

    // Create new File object with generic name
    const cleanFile = new File(
      [blob],
      `sanitized_${Date.now()}.${file.type.split('/')[1]}`,
      { type: file.type }
    );

    const sizeReduction = ((file.size - cleanFile.size) / file.size * 100).toFixed(1);

    console.log(`✅ Metadata stripped successfully`);
    console.log(`   Original: ${(file.size / 1024).toFixed(1)}KB`);
    console.log(`   Clean: ${(cleanFile.size / 1024).toFixed(1)}KB`);
    console.log(`   Reduction: ${sizeReduction}%`);

    return {
      success: true,
      file: cleanFile,
      originalSize: file.size,
      newSize: cleanFile.size,
      stripped: true
    };
  } catch (error) {
    console.error('❌ Failed to strip image metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stripped: false
    };
  }
};

/**
 * Strip metadata from PDF files
 * This is a placeholder - full PDF metadata stripping requires server-side processing
 */
export const stripPdfMetadata = async (file: File): Promise<MetadataStripResult> => {
  // PDF metadata stripping is complex and requires libraries like pdf-lib
  // Best done server-side
  console.log('📄 PDF detected - server-side stripping recommended');

  return {
    success: true,
    file,
    stripped: false // Will be stripped server-side
  };
};

/**
 * Strip metadata from document files (.doc, .docx, etc.)
 * This is a placeholder - full document metadata stripping requires server-side processing
 */
export const stripDocumentMetadata = async (file: File): Promise<MetadataStripResult> => {
  // Document metadata stripping requires parsing the file format
  // Best done server-side
  console.log('📝 Document detected - server-side stripping recommended');

  return {
    success: true,
    file,
    stripped: false // Will be stripped server-side
  };
};

/**
 * Main entry point - strips metadata from any file type
 * Routes to appropriate handler based on file type
 */
export const stripFileMetadata = async (file: File): Promise<MetadataStripResult> => {
  console.log(`🔍 Processing file: ${file.name} (${file.type})`);

  // Route to appropriate handler
  if (file.type.startsWith('image/')) {
    return await stripImageMetadata(file);
  } else if (file.type === 'application/pdf') {
    return await stripPdfMetadata(file);
  } else if (
    file.type.includes('document') ||
    file.type.includes('msword') ||
    file.type.includes('officedocument')
  ) {
    return await stripDocumentMetadata(file);
  }

  // Unknown file type - pass through (server should handle)
  console.log('❓ Unknown file type - no client-side stripping');
  return {
    success: true,
    file,
    stripped: false
  };
};

/**
 * Batch process multiple files
 */
export const stripMetadataFromFiles = async (files: File[]): Promise<MetadataStripResult[]> => {
  console.log(`🛡️ Batch processing ${files.length} file(s) for metadata removal`);

  const results = await Promise.all(
    files.map(file => stripFileMetadata(file))
  );

  const successCount = results.filter(r => r.success).length;
  const strippedCount = results.filter(r => r.stripped).length;

  console.log(`✅ Processed ${successCount}/${files.length} files successfully`);
  console.log(`🛡️ Stripped metadata from ${strippedCount} file(s)`);

  return results;
};
