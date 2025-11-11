#!/bin/bash

# Setup Sentry Log Drain for Vercel
# This script creates a log drain from Vercel to Sentry

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Sentry Log Drain for Vercel...${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Error: Vercel CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Get Vercel project info
PROJECT_ID="prj_LZHtJq9wmU52su4lSazU6CjAvyyJ"
TEAM_ID="team_bZtHM5U2PDPQpdq5Mrv4QUIQ"

# Get Sentry DSN from user
echo -e "${YELLOW}Please provide your Sentry DSN endpoint.${NC}"
echo "You can find it in Sentry Dashboard → Settings → Projects → disclosurely-production → Client Keys (DSN)"
echo ""
read -p "Enter your Sentry DSN (or press Enter to skip): " SENTRY_DSN

if [ -z "$SENTRY_DSN" ]; then
    echo -e "${YELLOW}Skipping log drain setup. You can set it up manually via the Vercel dashboard.${NC}"
    exit 0
fi

# Convert DSN to envelope endpoint format
# DSN format: https://<key>@o<org-id>.ingest.sentry.io/<project-id>
# Envelope format: https://o<org-id>.ingest.sentry.io/api/<project-id>/envelope/

if [[ $SENTRY_DSN =~ https://([^@]+)@o([0-9]+)\.ingest\.sentry\.io/([0-9]+) ]]; then
    ORG_ID="${BASH_REMATCH[2]}"
    PROJECT_ID_SENTRY="${BASH_REMATCH[3]}"
    ENVELOPE_URL="https://o${ORG_ID}.ingest.sentry.io/api/${PROJECT_ID_SENTRY}/envelope/"
    echo -e "${GREEN}Converted DSN to envelope endpoint: ${ENVELOPE_URL}${NC}\n"
else
    echo -e "${RED}Error: Invalid Sentry DSN format. Expected format: https://<key>@o<org-id>.ingest.sentry.io/<project-id>${NC}"
    exit 1
fi

# Create log drain using Vercel API
echo -e "${GREEN}Creating log drain...${NC}"

# Get Vercel token from environment or prompt
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}VERCEL_TOKEN not found in environment.${NC}"
    echo "You can get your token from: https://vercel.com/account/tokens"
    read -p "Enter your Vercel API token (or press Enter to use Vercel CLI): " VERCEL_TOKEN
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}Using Vercel CLI to create log drain...${NC}"
    # Note: Vercel CLI doesn't have a direct command for log drains, so we'll use the API
    echo -e "${RED}Error: Vercel CLI doesn't support log drain creation directly.${NC}"
    echo "Please use the Vercel Dashboard or provide a VERCEL_TOKEN environment variable."
    exit 1
fi

# Create log drain via API
RESPONSE=$(curl -s -X POST "https://api.vercel.com/v1/log-drains?teamId=${TEAM_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Sentry Log Drain - disclosurely\",
    \"url\": \"${ENVELOPE_URL}\",
    \"deliveryFormat\": \"ndjson\",
    \"sources\": [\"lambda\", \"edge\", \"static\", \"build\", \"external\"],
    \"environments\": [\"production\"],
    \"projectIds\": [\"${PROJECT_ID}\"],
    \"samplingRate\": 1.0
  }")

# Check if successful
if echo "$RESPONSE" | grep -q '"id"'; then
    DRAIN_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Log drain created successfully!${NC}"
    echo -e "${GREEN}  Drain ID: ${DRAIN_ID}${NC}"
    echo ""
    echo -e "${GREEN}Configuration:${NC}"
    echo "  - Name: Sentry Log Drain - disclosurely"
    echo "  - Destination: ${ENVELOPE_URL}"
    echo "  - Sources: lambda, edge, static, build, external"
    echo "  - Environments: production"
    echo "  - Sampling Rate: 100%"
    echo ""
    echo -e "${YELLOW}Note: Logs will start appearing in Sentry within a few minutes.${NC}"
    echo -e "${YELLOW}Monitor your Sentry project to ensure logs are being received.${NC}"
else
    echo -e "${RED}Error creating log drain:${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

