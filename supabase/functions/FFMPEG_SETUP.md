# FFmpeg Setup for Video Metadata Stripping

This guide explains how to install and configure FFmpeg for video metadata removal in your Supabase self-hosted environment.

## Overview

The `strip-all-metadata` edge function requires FFmpeg to process video files (MP4, etc.) and strip metadata. Audio files (MP3) are handled without FFmpeg using native JavaScript.

## Requirements

- Self-hosted Supabase instance (FFmpeg is NOT available on Supabase Cloud/Deno Deploy)
- Docker or direct server access
- FFmpeg 4.0 or higher

## Installation Options

### Option 1: Docker-based Deployment (Recommended)

If you're running Supabase in Docker, you can add FFmpeg to your custom Deno container.

1. Create a `Dockerfile` in `supabase/functions/`:

```dockerfile
FROM denoland/deno:1.37.0

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify installation
RUN ffmpeg -version

WORKDIR /app
```

2. Update your `docker-compose.yml` to use the custom image:

```yaml
functions:
  build:
    context: ./supabase/functions
    dockerfile: Dockerfile
  volumes:
    - ./supabase/functions:/app
  environment:
    - DENO_DIR=/app/.deno
```

### Option 2: Server Installation

For direct server deployment, install FFmpeg on your host system:

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### CentOS/RHEL
```bash
sudo yum install epel-release
sudo yum install ffmpeg
```

#### macOS (Homebrew)
```bash
brew install ffmpeg
```

#### From Source
Follow the official guide: https://www.ffmpeg.org/download.html

### Option 3: Supabase CLI Local Development

For local development with Supabase CLI:

```bash
# Install FFmpeg on your local machine (see above)
# Then start Supabase
supabase start

# The edge functions will have access to your local FFmpeg installation
```

## Verification

Test that FFmpeg is available:

```bash
# On your server or in your Docker container
ffmpeg -version
```

You should see output like:
```
ffmpeg version 4.4.2-0ubuntu0.22.04.1
```

## Edge Function Configuration

The `strip-all-metadata` function automatically detects FFmpeg availability:

- If FFmpeg is available: Full video metadata stripping is enabled
- If FFmpeg is NOT available: Video uploads will fail with a helpful error message

### Supported Files

| File Type | Requires FFmpeg | Max Size | Notes |
|-----------|----------------|----------|-------|
| JPEG | No | 100MB | EXIF removal |
| PNG | No | 100MB | Chunk removal |
| PDF | No | 100MB | Metadata removal |
| Office Docs | No | 100MB | Properties removal |
| MP3 | No | 100MB | ID3 tag removal |
| MP4 Video | **Yes** | 500MB | Full metadata stripping |
| Other Videos | **Yes** | 500MB | Full metadata stripping |
| WebP | **Rejected** | - | Not supported |
| GIF | **Rejected** | - | Not supported |

### Timeouts

The frontend automatically adjusts timeouts based on file type:
- Regular files: 2 minutes (120,000ms)
- Video files: 5 minutes (300,000ms)

## Troubleshooting

### "FFmpeg is not available" Error

This error occurs when:
1. FFmpeg is not installed on the server
2. FFmpeg is not in the system PATH
3. The Deno process doesn't have permission to execute FFmpeg

**Solutions:**
- Install FFmpeg using one of the methods above
- Ensure FFmpeg is in PATH: `which ffmpeg`
- Check permissions: `chmod +x $(which ffmpeg)`

### Video Processing Timeout

If large videos are timing out:

1. Increase the frontend timeout in `src/components/FileUpload.tsx`:
```typescript
const timeout = file.type.startsWith('video/') ? 600000 : 120000; // 10 min for videos
```

2. Increase the edge function timeout in `supabase/config.toml`:
```toml
[functions.strip-all-metadata]
verify_jwt = false
timeout = 600  # 10 minutes (in seconds)
```

### Large File Size Limits

Current limits:
- Regular files: 100MB
- Videos: 500MB

To increase limits, update `supabase/functions/strip-all-metadata/index.ts`:
```typescript
const MAX_FILE_SIZE = 200 * 1024 * 1024 // 200MB
const MAX_VIDEO_SIZE = 1000 * 1024 * 1024 // 1GB
```

## Security Considerations

1. **Temporary Files**: FFmpeg creates temporary files during processing. These are automatically cleaned up after processing.

2. **File Type Detection**: The function uses magic byte detection, not client-provided MIME types.

3. **Never Return Original**: If metadata stripping fails, the original file is NEVER returned to the client.

4. **Audit Logging**: All metadata stripping operations are logged to the `metadata_stripping_audit` table.

## Performance Tips

1. **Copy Codec**: The function uses `-c copy` to avoid re-encoding, making processing much faster.

2. **Progress Bars**: Large files show progress bars to provide user feedback during processing.

3. **Parallel Processing**: Multiple files are processed sequentially, but this could be parallelized if needed.

## Alternative Solutions

If you cannot install FFmpeg on your server, consider these alternatives:

1. **Reject Video Uploads**: Modify the function to reject all video files
2. **External Service**: Use a third-party metadata removal API (will incur costs)
3. **Client-side Processing**: Use WebAssembly FFmpeg in the browser (limited by browser resources)

## Support

For issues or questions:
- FFmpeg Documentation: https://www.ffmpeg.org/documentation.html
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- GitHub Issues: Create an issue in your repository

## Testing

Test the implementation with various file types:

```bash
# Test MP3 (should work without FFmpeg)
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -F "file=@test.mp3" \
  http://localhost:54321/functions/v1/strip-all-metadata

# Test MP4 (requires FFmpeg)
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -F "file=@test.mp4" \
  http://localhost:54321/functions/v1/strip-all-metadata
```

Expected responses:
- Success: 200 with cleaned file data
- FFmpeg missing: 500 with error message
- Unsupported file: 400 with error message
