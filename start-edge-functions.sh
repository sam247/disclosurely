#!/bin/bash
# Start Supabase Edge Functions container with FFmpeg
# Run this in Terminal.app (not Cursor)

set -e

export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
cd "$(dirname "$0")"

echo "🚀 Starting Supabase Edge Functions with FFmpeg"
echo ""

# Find the Supabase network
NETWORK=$(docker inspect supabase_db_cxmuzperkittvibslnff --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>/dev/null || echo "supabase_network_cxmuzperkittvibslnff")

if [ -z "$NETWORK" ]; then
    echo "❌ Error: Could not find Supabase network"
    echo "   Make sure the database container is running first"
    exit 1
fi

echo "✓ Found network: $NETWORK"

# Check if FFmpeg image exists
if ! docker images | grep -q "supabase-functions-ffmpeg"; then
    echo "❌ Error: FFmpeg image not found"
    echo "   Run: docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/"
    exit 1
fi

echo "✓ FFmpeg image found"

# Remove old container if it exists
if docker ps -a | grep -q "supabase_edge_runtime_cxmuzperkittvibslnff"; then
    echo "Removing old edge functions container..."
    docker rm -f supabase_edge_runtime_cxmuzperkittvibslnff 2>/dev/null || true
fi

# Create and start new container
echo ""
echo "📦 Creating edge functions container..."
docker run -d \
  --name supabase_edge_runtime_cxmuzperkittvibslnff \
  --network "$NETWORK" \
  -v "$(pwd)/supabase/functions:/home/deno" \
  -e DENO_DIR=/home/deno/.deno \
  supabase-functions-ffmpeg:latest \
  deno run --allow-all --watch /home/deno

if [ $? -eq 0 ]; then
    echo "✓ Container created and started"
else
    echo "❌ Failed to create container"
    exit 1
fi

# Wait a moment for container to start
sleep 2

# Verify FFmpeg
echo ""
echo "🔍 Verifying FFmpeg installation..."
if docker exec supabase_edge_runtime_cxmuzperkittvibslnff ffmpeg -version > /dev/null 2>&1; then
    echo "✓ FFmpeg is installed and working!"
    docker exec supabase_edge_runtime_cxmuzperkittvibslnff ffmpeg -version | head -1
else
    echo "❌ FFmpeg not found in container"
    exit 1
fi

echo ""
echo "✅ Edge functions container is running with FFmpeg!"
echo ""
echo "Container: supabase_edge_runtime_cxmuzperkittvibslnff"
echo "Network: $NETWORK"
echo ""
echo "To test FFmpeg manually:"
echo "  docker exec supabase_edge_runtime_cxmuzperkittvibslnff ffmpeg -version"

