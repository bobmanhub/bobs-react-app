# Pizza API Cloud Run Deployment Guide

This guide explains how to deploy the pizza ordering API to Google Cloud Run using the automated deployment script.

## Prerequisites

Before running the deployment script, ensure you have:

1. **Google Cloud Account** with:
   - Active project: `pizza-app-project-2026`
   - $300 free trial credit (or billing enabled)
   - Project set up with necessary APIs

2. **gcloud CLI** installed:
   ```bash
   # Install gcloud CLI (if not already installed)
   # See: https://cloud.google.com/sdk/docs/install
   
   # Verify installation
   gcloud --version
   ```

3. **Docker Desktop** installed and running:
   ```bash
   # Install Docker Desktop: https://www.docker.com/products/docker-desktop
   
   # Verify it's running
   docker ps
   ```

4. **gcloud Authentication**:
   ```bash
   # Login to your Google Cloud account
   gcloud auth login
   
   # Set the correct project
   gcloud config set project pizza-app-project-2026
   ```

## Quick Start

### Option 1: Using Default Configuration

```bash
cd /Users/ppham/src/bobs-react-app
./deploy.sh
```

This uses the default settings:
- Project ID: `pizza-app-project-2026`
- Service Name: `pizza-api`
- Region: `us-central1`

### Option 2: Custom Configuration

Override settings with environment variables:

```bash
# Deploy to a different region
REGION=us-east1 ./deploy.sh

# Deploy with a different service name
SERVICE_NAME=my-pizza-api ./deploy.sh

# Deploy to a different project
GCP_PROJECT_ID=my-project ./deploy.sh

# Combine multiple settings
GCP_PROJECT_ID=my-project SERVICE_NAME=pizza-api REGION=europe-west1 ./deploy.sh
```

## What the Script Does

The deployment script performs these steps automatically:

1. ✅ Verifies gcloud CLI authentication
2. ✅ Sets the correct Google Cloud project
3. ✅ Verifies Docker is installed and running
4. ✅ Configures Docker for Google Container Registry
5. ✅ Builds Docker image for Linux/amd64 architecture
6. ✅ Pushes image to Google Container Registry
7. ✅ Enables the Cloud Run API
8. ✅ Deploys the service to Cloud Run
9. ✅ Retrieves the service URL
10. ✅ Tests the API with a sample request

## Troubleshooting

### Issue: "Docker daemon is not running"
**Solution:** Start Docker Desktop and ensure it's fully initialized before running the script.

### Issue: "gcloud: command not found"
**Solution:** Install the gcloud CLI from https://cloud.google.com/sdk/docs/install

### Issue: "Error: (gcloud.run.deploy) Billing account not found"
**Solution:** Enable billing for your Google Cloud project:
1. Go to https://console.cloud.google.com/billing
2. Link a billing account to the project
3. Run the script again

### Issue: "Permission denied" errors
**Solution:** Ensure your gcloud account has sufficient permissions:
```bash
# Check your current account
gcloud auth list

# Login with the correct account
gcloud auth login
```

### Issue: "Container failed to start"
**Solution:** Check the Cloud Run logs:
```bash
gcloud run services logs read pizza-api --region us-central1 --limit 50
```

## Manual Steps (For Reference)

If you prefer to deploy manually, here are the equivalent commands:

```bash
# 1. Build Docker image
docker buildx build --platform linux/amd64 \
  -f Dockerfile.server \
  -t gcr.io/pizza-app-project-2026/pizza-api:latest \
  --push .

# 2. Deploy to Cloud Run
gcloud run deploy pizza-api \
  --image gcr.io/pizza-app-project-2026/pizza-api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080

# 3. Get service URL
gcloud run services describe pizza-api \
  --region us-central1 \
  --format='value(status.url)'

# 4. Test the API
curl https://pizza-api-331610961275.us-central1.run.app/api/menu
```

## Updating the Frontend

After deployment, update your React frontend to use the live API:

### 1. Get the deployed service URL:
```bash
gcloud run services describe pizza-api \
  --region us-central1 \
  --format='value(status.url)'
```

### 2. Update `src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://pizza-api-YOUR_PROJECT_ID.us-central1.run.app';
```

## Useful Commands

```bash
# View Cloud Run service details
gcloud run services describe pizza-api --region us-central1

# View recent logs
gcloud run services logs read pizza-api --region us-central1 --limit 50

# Stream live logs
gcloud run services logs read pizza-api --region us-central1 --follow

# List all Cloud Run services
gcloud run services list --region us-central1

# Delete the service
gcloud run services delete pizza-api --region us-central1

# Update the service (redeploy)
./deploy.sh
```

## API Endpoints

Once deployed, your API will be available at:
```
https://pizza-api-<PROJECT_NUMBER>.us-central1.run.app
```

Available endpoints:
- `GET /` - Welcome message
- `GET /api/menu` - Get pizzas and drinks menu
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `DELETE /api/orders/:id` - Delete an order

## Security Notes

- The service is deployed as **publicly accessible** (--allow-unauthenticated)
- No API keys are currently required
- The server uses HTTP/2 over HTTPS (Google Cloud Run enforces SSL)
- CORS is enabled for all origins

To restrict access, you can:
1. Remove `--allow-unauthenticated` flag
2. Use Cloud IAM policies to control access
3. Add authentication middleware to the server

## Cost Considerations

Cloud Run pricing (free tier):
- 2 million requests per month
- 360,000 GB-seconds per month
- Always within the free tier for testing

Your $300 credit should cover production use for several months.

## Support & Documentation

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Google Container Registry](https://cloud.google.com/container-registry/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/docs/reference)
