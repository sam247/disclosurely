# Docker Setup Instructions for FFmpeg Support

This guide will help you set up FFmpeg in your local Supabase Docker environment.

## Prerequisites

- Docker and Docker Compose installed
- Supabase CLI installed (`npm install -g supabase`)
- This repository cloned locally

## Setup Steps

### Step 1: Build the Custom Docker Image

From your project root directory, run:

```bash
# Build the custom FFmpeg-enabled image
docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/
```

This creates a Docker image based on Deno with FFmpeg pre-installed.

### Step 2: Option A - Using Supabase CLI (Recommended)

If you're using `supabase start`, you'll need to configure it to use the custom image.

**Note**: The Supabase CLI currently doesn't support custom function images directly. You have two options:

#### Option A1: Modify Supabase's Docker Compose Directly

```bash
# Find your Supabase data directory
# On macOS: ~/Library/Application Support/supabase/
# On Linux: ~/.local/share/supabase/
# On Windows: %LOCALAPPDATA%\supabase\

# Navigate there and find the docker-compose.yml
cd ~/.local/share/supabase/docker/  # Adjust path for your OS

# Backup the original
cp docker-compose.yml docker-compose.yml.backup

# Edit the functions service to use your custom image
# Add this under the 'functions' service:
#   image: supabase-functions-ffmpeg:latest
```

#### Option A2: Run Edge Functions Separately with FFmpeg

```bash
# Stop Supabase's default functions container
supabase stop --no-backup functions

# Run your own functions container with FFmpeg
docker run -d \
  --name supabase-functions-ffmpeg \
  --network supabase_network_<your-project-id> \
  -v $(pwd)/supabase/functions:/home/deno/functions \
  -e SUPABASE_URL=http://kong:8000 \
  -e SUPABASE_ANON_KEY=<your-anon-key> \
  -e SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
  -p 54321:9000 \
  supabase-functions-ffmpeg:latest \
  start --main-service /home/deno/functions
```

### Step 2: Option B - Using docker-compose.override.yml

If you have a custom `docker-compose.yml` in your project:

```bash
# The docker-compose.override.yml file has been created for you
# It will automatically be used by Docker Compose

# Start Supabase with the override
docker-compose up -d

# Or if using Supabase CLI:
supabase start
```

### Step 3: Verify FFmpeg Installation

Test that FFmpeg is available in your functions container:

```bash
# Find the container ID
docker ps | grep functions

# Or if using Supabase CLI:
docker ps | grep supabase-edge-functions

# Execute ffmpeg in the container
docker exec -it <container-id> ffmpeg -version
```

You should see FFmpeg version information.

### Step 4: Test Video Metadata Stripping

Test with a sample video file:

```bash
# Create a test script
cat > test-video-metadata.sh << 'EOF'
#!/bin/bash

# Get your Supabase URL and anon key from .env or config
SUPABASE_URL="http://localhost:54321"
ANON_KEY="your-anon-key-here"

# Test with a video file
curl -X POST \
  -H "Authorization: Bearer $ANON_KEY" \
  -F "file=@/path/to/test-video.mp4" \
  "$SUPABASE_URL/functions/v1/strip-all-metadata" \
  -o cleaned-video.mp4

echo "✓ Video processed successfully!"
EOF

chmod +x test-video-metadata.sh
./test-video-metadata.sh
```

## Troubleshooting

### Issue: Container doesn't have FFmpeg

**Symptom**: Error message "FFmpeg is not available"

**Solution**:
1. Verify the custom image was built:
   ```bash
   docker images | grep supabase-functions-ffmpeg
   ```

2. Check if the container is using the right image:
   ```bash
   docker ps --format "{{.Image}}" | grep functions
   ```

3. Rebuild and restart:
   ```bash
   docker-compose down
   docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/
   docker-compose up -d
   ```

### Issue: Supabase CLI Doesn't Use Custom Image

**Solution**: Use Option A2 above to run functions separately, or modify the CLI's docker-compose.yml directly.

### Issue: Permission Denied

**Symptom**: FFmpeg can't write temporary files

**Solution**: Ensure the Deno user has proper permissions:
```bash
docker exec -it <container-id> sh -c "mkdir -p /tmp && chmod 777 /tmp"
```

### Issue: Network Issues Between Services

**Symptom**: Functions can't connect to other Supabase services

**Solution**: Ensure all services are on the same Docker network:
```bash
docker network ls
docker network inspect supabase_network_<your-project-id>
```

## Alternative: Install FFmpeg on Host (If Not Using Docker)

If you're running edge functions directly on your host system:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg

# Verify installation
ffmpeg -version
```

Then run your edge functions using Supabase CLI or Deno directly:

```bash
# Using Supabase CLI
supabase functions serve strip-all-metadata

# Or directly with Deno
deno run --allow-all supabase/functions/strip-all-metadata/index.ts
```

## Production Deployment

For production deployments:

### Self-Hosted Supabase

Use the `docker-compose.override.yml` file in your production environment:

```bash
# On your server
git pull
docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/
docker-compose up -d
```

### Cloud Platforms (AWS, GCP, Azure, etc.)

1. Build and push the custom image to your container registry:
   ```bash
   docker build -t your-registry/supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/
   docker push your-registry/supabase-functions-ffmpeg:latest
   ```

2. Update your deployment configuration to use the custom image

### Supabase Cloud

**Important**: Supabase Cloud (hosted platform) does NOT support custom edge function runtimes or FFmpeg. You have two options:

1. **Self-host edge functions** on your own infrastructure with FFmpeg
2. **Use Supabase Cloud for database** but host edge functions separately

## Support

For issues:
- Check the logs: `docker logs <container-id>`
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create an issue in your repository

## Quick Reference

```bash
# Build custom image
docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/

# Start services
docker-compose up -d

# Check logs
docker logs -f <container-id>

# Test FFmpeg
docker exec -it <container-id> ffmpeg -version

# Restart services
docker-compose restart functions
```
