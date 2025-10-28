#!/bin/bash

# TLS Configuration Verification Script for Disclosurely
# Verifies TLS 1.2+ support, cipher suites, and HSTS configuration

echo "🔒 TLS Configuration Verification for Disclosurely"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if testssl.sh is available
if ! command -v testssl.sh &> /dev/null; then
    echo -e "${YELLOW}⚠️  testssl.sh not found. Installing requirements...${NC}"
    echo "For manual testing, use: https://www.ssllabs.com/ssltest/"
    echo ""
fi

# Domains to test
DOMAINS=(
    "disclosurely.com"
    "app.disclosurely.com"
    "www.disclosurely.com"
)

check_tls() {
    local domain=$1
    echo -e "${NC}Testing: ${domain}...${NC}"
    
    # Try to check TLS version with openssl (basic check)
    if command -v openssl &> /dev/null; then
        TLS_VERSION=$(echo | timeout 5 openssl s_client -connect ${domain}:443 -tls1_2 2>/dev/null | grep "Protocol" || echo "ERROR")
        
        if [[ $TLS_VERSION == *"TLSv1.2"* ]] || [[ $TLS_VERSION == *"TLSv1.3"* ]]; then
            echo -e "${GREEN}✅ TLS 1.2+ supported${NC}"
        else
            echo -e "${RED}❌ TLS 1.2+ not supported or connection failed${NC}"
        fi
        
        # Check HSTS
        HSTS=$(curl -sI https://${domain} | grep -i "Strict-Transport-Security" || echo "")
        if [[ -n "$HSTS" ]]; then
            echo -e "${GREEN}✅ HSTS enabled${NC}"
        else
            echo -e "${YELLOW}⚠️  HSTS not detected${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  openssl not available${NC}"
    fi
    
    echo ""
}

# Test all domains
for domain in "${DOMAINS[@]}"; do
    check_tls $domain
done

echo ""
echo "=================================================="
echo "📋 Recommendations:"
echo "1. Use SSL Labs for comprehensive testing: https://www.ssllabs.com/ssltest/"
echo "2. Verify TLS 1.0 and 1.1 are disabled"
echo "3. Verify strong cipher suites are configured"
echo "4. Ensure HSTS is properly configured with max-age"
echo "5. Verify certificate chain is complete"
echo "=================================================="

