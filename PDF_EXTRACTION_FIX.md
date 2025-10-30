# PDF Extraction Fix Guide

## Problem
AI Case Helper failing to extract PDF text with 500 error.

## Solutions (in order of recommendation)

### ✅ Solution 1: Regex-Based Extraction (IMPLEMENTED)
**Status**: Code updated, needs deployment
**Pros**: No dependencies, free, works in Deno
**Cons**: May not work for complex/compressed PDFs

**Deploy Steps**:
1. Start Docker Desktop
2. Run: `supabase functions deploy extract-pdf-text`
3. Test by uploading a PDF in AI Case Helper

**Files Changed**:
- `supabase/functions/extract-pdf-text/index.ts` (updated)

---

### 🔄 Solution 2: PDF.co API (Fallback)
**Status**: Alternative implementation provided
**Pros**: Robust, handles complex PDFs
**Cons**: 300 free calls/month, then $0.02/call

**Setup**:
1. Sign up at https://pdf.co (free tier)
2. Get API key from dashboard
3. Add to Supabase secrets:
   ```bash
   supabase secrets set PDFCO_API_KEY=your_key_here
   ```
4. Replace `index.ts` content with `ALTERNATIVE_SOLUTION.ts`
5. Deploy: `supabase functions deploy extract-pdf-text`

---

### 🚀 Solution 3: Azure Document Intelligence (Production)
**Status**: Recommended for production
**Pros**: Enterprise-grade, 99.9% uptime, OCR support
**Cons**: Requires Azure account

**Setup**:
1. Create Azure Document Intelligence resource
2. Get endpoint + key
3. Update Edge Function to use Azure SDK
4. Supports: Text PDFs, scanned PDFs, handwriting

**Cost**: $1.50 per 1000 pages

---

### 🔧 Solution 4: Client-Side Extraction
**Status**: Quick workaround
**Pros**: No server changes needed
**Cons**: Limited to simple PDFs, client-side processing

**Implementation**:
```typescript
// In AICaseHelper.tsx, add:
import { getDocument } from 'pdfjs-dist';

// Before line 344, extract text client-side:
const loadingTask = getDocument(URL.createObjectURL(file));
const pdf = await loadingTask.promise;
// ... extract text
```

---

## Testing After Deployment

1. Go to AI Case Helper: `/dashboard/ai-helper`
2. Upload a PDF document (Employee-Handbook-2018.pdf)
3. Select a case
4. Click "Start Analysis"
5. Check browser console for logs
6. Check Supabase Edge Function logs:
   ```bash
   supabase functions logs extract-pdf-text
   ```

## Expected Logs (Success)
```
[PDF Extract] Function invoked
[PDF Extract] Requested file: abc123/1234567890.pdf
[PDF Extract] Downloading file from storage...
[PDF Extract] File downloaded successfully
[PDF Extract] ArrayBuffer created, size: 493200
[PDF Extract] Starting extraction...
[PDF Extract] PDF decoded, searching for text streams...
[PDF Extract] Processed 47 text streams
[PDF Extract] SUCCESS! Extracted 12847 characters
```

## Common Errors & Fixes

### Error: "Cannot connect to Docker daemon"
**Fix**: Start Docker Desktop application

### Error: "Failed to download file"
**Fix**: Check storage bucket permissions (ai-helper-docs should allow service role access)

### Error: "No text extracted"
**Cause**: PDF is image-based (scanned document)
**Fix**: Use Solution 3 (Azure) which includes OCR

### Error: "Extraction timeout"
**Cause**: PDF is too large/complex
**Fix**:
- Increase function timeout in config.toml
- Switch to Solution 2 or 3

---

## Monitoring

Add this to your monitoring dashboard:
- PDF extraction success rate
- Average extraction time
- Character count per PDF
- Error types

**Query Supabase logs**:
```sql
SELECT
  created_at,
  log_data->>'message' as message
FROM system_logs
WHERE component = 'pdf_extraction'
ORDER BY created_at DESC
LIMIT 100;
```

---

## Next Steps

1. ✅ Deploy updated function (Solution 1)
2. ⏳ Test with sample PDFs
3. ⏳ Monitor success rate for 1 week
4. ⏳ If <90% success, implement Solution 2 or 3
5. ⏳ Add PDF extraction metrics to dashboard

---

## Additional Improvements

### Add Progress Indicator
Currently the UI shows "Analyzing..." but doesn't show PDF extraction progress.

**Enhancement**: Stream extraction progress to frontend
```typescript
// In Edge Function, add:
const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(encoder.encode(
      `data: ${JSON.stringify({progress: 20, message: 'Downloading PDF'})}\n\n`
    ));
  }
});
return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' }
});
```

### Cache Extracted Text
Store extracted text in database to avoid re-processing:
```sql
CREATE TABLE pdf_extraction_cache (
  file_path TEXT PRIMARY KEY,
  extracted_text TEXT,
  character_count INTEGER,
  extracted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Support More Formats
- `.docx`: Use mammoth.js
- `.xlsx`: Use xlsx library
- `.txt`: Already supported
- Images: Use OCR (Tesseract.js or Azure)

---

*Last Updated: October 30, 2025*
*Issue Tracking: Check CERTIFICATION_READINESS.md for status*
