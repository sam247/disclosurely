#!/bin/bash

# Resend MCP Setup Script
# This script helps set up the Resend MCP server for Cursor

set -e

echo "🚀 Resend MCP Setup Script"
echo "=========================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if RESEND_API_KEY is set
if [ -z "$RESEND_API_KEY" ]; then
    echo "⚠️  RESEND_API_KEY environment variable is not set."
    echo "   Please set it before running this script:"
    echo "   export RESEND_API_KEY='your-api-key-here'"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install the Resend MCP package
echo "📦 Installing Resend MCP package..."
echo "   Installing @resend/mcp-send-email..."
npm install -g @resend/mcp-send-email || {
    echo "⚠️  Failed to install @resend/mcp-send-email, trying alternative..."
    npm install -g resend-mcp || {
        echo "❌ Failed to install Resend MCP packages"
        exit 1
    }
    PACKAGE_NAME="resend-mcp"
}

# Find the installed package location
echo ""
echo "🔍 Finding installed package location..."

if command -v npm &> /dev/null; then
    PACKAGE_PATH=$(npm list -g @resend/mcp-send-email 2>/dev/null | grep "@resend/mcp-send-email" | head -1 | awk '{print $NF}' || echo "")
    
    if [ -z "$PACKAGE_PATH" ]; then
        PACKAGE_PATH=$(npm list -g resend-mcp 2>/dev/null | grep "resend-mcp" | head -1 | awk '{print $NF}' || echo "")
        PACKAGE_NAME="resend-mcp"
    else
        PACKAGE_NAME="@resend/mcp-send-email"
    fi
fi

# Try common locations if npm list didn't work
if [ -z "$PACKAGE_PATH" ]; then
    if [ -d "$HOME/.npm-global/lib/node_modules/@resend/mcp-send-email" ]; then
        PACKAGE_PATH="$HOME/.npm-global/lib/node_modules/@resend/mcp-send-email"
        PACKAGE_NAME="@resend/mcp-send-email"
    elif [ -d "/usr/local/lib/node_modules/@resend/mcp-send-email" ]; then
        PACKAGE_PATH="/usr/local/lib/node_modules/@resend/mcp-send-email"
        PACKAGE_NAME="@resend/mcp-send-email"
    elif [ -d "$HOME/.npm-global/lib/node_modules/resend-mcp" ]; then
        PACKAGE_PATH="$HOME/.npm-global/lib/node_modules/resend-mcp"
        PACKAGE_NAME="resend-mcp"
    elif [ -d "/usr/local/lib/node_modules/resend-mcp" ]; then
        PACKAGE_PATH="/usr/local/lib/node_modules/resend-mcp"
        PACKAGE_NAME="resend-mcp"
    fi
fi

if [ -z "$PACKAGE_PATH" ]; then
    echo "❌ Could not find installed package location"
    echo "   Please find it manually and update the wrapper script"
    exit 1
fi

echo "✅ Found package at: $PACKAGE_PATH"

# Find the entry point
ENTRY_POINT=""
if [ -f "$PACKAGE_PATH/dist/index.js" ]; then
    ENTRY_POINT="$PACKAGE_PATH/dist/index.js"
elif [ -f "$PACKAGE_PATH/build/index.js" ]; then
    ENTRY_POINT="$PACKAGE_PATH/build/index.js"
elif [ -f "$PACKAGE_PATH/index.js" ]; then
    ENTRY_POINT="$PACKAGE_PATH/index.js"
else
    echo "⚠️  Could not find entry point. Checking package.json..."
    if [ -f "$PACKAGE_PATH/package.json" ]; then
        ENTRY_POINT=$(node -e "console.log(require('$PACKAGE_PATH/package.json').main || require('$PACKAGE_PATH/package.json').bin)" 2>/dev/null || echo "")
        if [ -n "$ENTRY_POINT" ]; then
            ENTRY_POINT="$PACKAGE_PATH/$ENTRY_POINT"
        fi
    fi
fi

if [ -z "$ENTRY_POINT" ] || [ ! -f "$ENTRY_POINT" ]; then
    echo "❌ Could not find entry point for the package"
    exit 1
fi

echo "✅ Found entry point: $ENTRY_POINT"

# Create wrapper script
WRAPPER_SCRIPT="$HOME/resend-mcp-wrapper.sh"
echo ""
echo "📝 Creating wrapper script at: $WRAPPER_SCRIPT"

cat > "$WRAPPER_SCRIPT" << EOF
#!/bin/bash
export RESEND_API_KEY="${RESEND_API_KEY:-your-resend-api-key-here}"
exec node "$ENTRY_POINT"
EOF

chmod +x "$WRAPPER_SCRIPT"
echo "✅ Wrapper script created and made executable"

# Display configuration instructions
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Open Cursor Settings:"
echo "   Cursor Settings > Features > MCP"
echo ""
echo "2. Click '+ Add New MCP Server'"
echo ""
echo "3. Configure:"
echo "   - Name: Resend"
echo "   - Type: stdio"
echo "   - Command: $WRAPPER_SCRIPT"
echo ""
echo "4. If RESEND_API_KEY is not set, edit the wrapper script:"
echo "   $WRAPPER_SCRIPT"
echo "   And replace 'your-resend-api-key-here' with your actual API key"
echo ""
echo "5. Restart Cursor to load the MCP server"
echo ""
echo "📚 For email receiving setup, see: RESEND_MCP_SETUP.md"
echo ""

