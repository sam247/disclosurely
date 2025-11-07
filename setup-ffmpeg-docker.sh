#!/bin/bash
# Setup script for FFmpeg in Supabase Docker environment
set -e

echo "🚀 Setting up FFmpeg for Supabase Edge Functions..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✓ Docker is installed"

# Check if we're in the right directory
if [ ! -f "supabase/functions/Dockerfile" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✓ Found project files"

# Build the custom Docker image
echo ""
echo "📦 Building custom Docker image with FFmpeg..."
docker build -t supabase-functions-ffmpeg:latest -f supabase/functions/Dockerfile supabase/functions/

if [ $? -eq 0 ]; then
    echo "✓ Custom image built successfully"
else
    echo "❌ Failed to build Docker image"
    exit 1
fi

# Verify FFmpeg is in the image
echo ""
echo "🔍 Verifying FFmpeg installation..."
docker run --rm supabase-functions-ffmpeg:latest ffmpeg -version | head -n 1

if [ $? -eq 0 ]; then
    echo "✓ FFmpeg is installed and working"
else
    echo "❌ FFmpeg verification failed"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. If using Supabase CLI:"
echo "   - Run: supabase stop"
echo "   - Run: supabase start"
echo ""
echo "2. If using docker-compose directly:"
echo "   - Run: docker-compose down"
echo "   - Run: docker-compose up -d"
echo ""
echo "3. Test the installation:"
echo "   - Find your functions container: docker ps | grep functions"
echo "   - Run: docker exec -it <container-id> ffmpeg -version"
echo ""
echo "📖 For detailed instructions, see DOCKER_SETUP_INSTRUCTIONS.md"
