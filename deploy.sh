#!/bin/bash

# Pizza API Deployment Script for Google Cloud Run
# This script builds and deploys the pizza ordering API to Google Cloud Run

set -e

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-pizza-app-project-2026}"
SERVICE_NAME="${SERVICE_NAME:-pizza-api}"
REGION="${REGION:-us-central1}"
IMAGE_NAME="pizza-api"
GCR_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🍕 Pizza API Deployment Script${NC}"
echo "=================================="
echo "Project ID: $PROJECT_ID"
echo "Service Name: $SERVICE_NAME"
echo "Region: $REGION"
echo "Image: $GCR_IMAGE"
echo ""

# Step 1: Verify gcloud is installed and authenticated
echo -e "${YELLOW}Step 1: Verifying Google Cloud authentication...${NC}"
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found. Please install it.${NC}"
    exit 1
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo -e "${RED}Error: No active gcloud account. Run 'gcloud auth login'${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Authenticated as: $ACTIVE_ACCOUNT${NC}"

# Step 2: Set the gcloud project
echo -e "${YELLOW}Step 2: Setting gcloud project...${NC}"
gcloud config set project "$PROJECT_ID"
echo -e "${GREEN}✓ Project set to: $PROJECT_ID${NC}"

# Step 3: Verify Docker is installed
echo -e "${YELLOW}Step 3: Verifying Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker not found. Please install Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Step 4: Verify Docker daemon is running
echo -e "${YELLOW}Step 4: Checking Docker daemon...${NC}"
if ! docker ps &> /dev/null; then
    echo -e "${RED}Error: Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"

# Step 5: Configure Docker for Google Container Registry
echo -e "${YELLOW}Step 5: Configuring Docker for GCR...${NC}"
gcloud auth configure-docker --quiet
echo -e "${GREEN}✓ Docker configured for GCR${NC}"

# Step 6: Build Docker image for linux/amd64
echo -e "${YELLOW}Step 6: Building Docker image for linux/amd64...${NC}"
echo "Building: $GCR_IMAGE"
docker buildx build --platform linux/amd64 \
  -f Dockerfile.server \
  -t "$GCR_IMAGE" \
  --push \
  .
echo -e "${GREEN}✓ Docker image built and pushed to GCR${NC}"

# Step 7: Enable Cloud Run API
echo -e "${YELLOW}Step 7: Enabling Cloud Run API...${NC}"
gcloud services enable run.googleapis.com --quiet
echo -e "${GREEN}✓ Cloud Run API enabled${NC}"

# Step 8: Deploy to Cloud Run
echo -e "${YELLOW}Step 8: Deploying to Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
  --image "$GCR_IMAGE" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080
echo -e "${GREEN}✓ Deployment completed${NC}"

# Step 9: Get the service URL
echo -e "${YELLOW}Step 9: Retrieving service URL...${NC}"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --format='value(status.url)')
echo -e "${GREEN}✓ Service URL: $SERVICE_URL${NC}"

# Step 10: Test the API
echo -e "${YELLOW}Step 10: Testing the API...${NC}"
echo "Requesting: $SERVICE_URL/api/menu"
if curl -s "$SERVICE_URL/api/menu" | grep -q "pizzas"; then
    echo -e "${GREEN}✓ API is responding correctly!${NC}"
else
    echo -e "${RED}✗ API test failed. Check the logs with:${NC}"
    echo "gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}=================================="
echo "🎉 Deployment Successful!"
echo "==================================${NC}"
echo ""
echo "API Endpoint: $SERVICE_URL"
echo ""
echo "Available endpoints:"
echo "  GET  $SERVICE_URL/"
echo "  GET  $SERVICE_URL/api/menu"
echo "  GET  $SERVICE_URL/api/orders"
echo "  POST $SERVICE_URL/api/orders"
echo "  DELETE $SERVICE_URL/api/orders/:id"
echo ""
echo "View logs:"
echo "  gcloud run services logs read $SERVICE_NAME --region $REGION --limit 50"
echo ""
echo "Update frontend API URL in: src/services/api.ts"
echo "API_BASE_URL = '$SERVICE_URL'"
