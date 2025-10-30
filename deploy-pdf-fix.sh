#!/bin/bash

# PDF Extraction Fix - Quick Deploy Script
# Run this to deploy the updated extract-pdf-text function

set -e  # Exit on error

echo "🚀 Deploying PDF Extraction Fix..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    echo ""
    echo "On macOS: Open Docker Desktop application"
    echo "On Linux: sudo systemctl start docker"
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if we're in the right directory
if [ ! -d "supabase/functions/extract-pdf-text" ]; then
    echo "❌ Not in the correct directory!"
    echo "Please run this script from the project root:"
    echo "cd /Users/sampettiford/Documents/Cursor/React\ Apps/disclosurely"
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Deploy the function
echo "📦 Deploying extract-pdf-text function..."
supabase functions deploy extract-pdf-text

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://app.disclosurely.com/dashboard/ai-helper"
echo "2. Upload a PDF document"
echo "3. Select a case and click 'Start Analysis'"
echo "4. Check if PDF text is extracted"
echo ""
echo "To view logs:"
echo "  supabase functions logs extract-pdf-text --follow"
echo ""
echo "To test manually:"
echo "  curl -X POST https://cxmuzperkittvibslnff.supabase.co/functions/v1/extract-pdf-text \\"
echo "    -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"filePath\": \"path/to/file.pdf\"}'"
echo ""
