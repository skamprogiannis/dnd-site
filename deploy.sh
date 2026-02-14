#!/usr/bin/env bash
# Deployment script for D&D site
# This script reads configuration from a .env file

set -e  # Exit on error

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Configuration with defaults from environment variables
VPS_USER="${VPS_USER:-skamprogiannis}"
VPS_HOST="${VPS_HOST:-caravanserai.gr}"
DEPLOY_DIR="${DEPLOY_DIR:-/home/skamprogiannis/dnd_site}"
SITE_URL="${SITE_URL:-dnd.caravanserai.gr}"
SSH_KEY_PATH="${SSH_KEY_PATH:-}"

LOCAL_DIR="$(dirname "$0")"

# Set SSH command with key if provided
SSH_CMD="ssh"
if [ -n "$SSH_KEY_PATH" ]; then
    SSH_CMD="ssh -i $SSH_KEY_PATH"
fi

# Set RSYNC command with key if provided
RSYNC_CMD="rsync"
if [ -n "$SSH_KEY_PATH" ]; then
    RSYNC_CMD="rsync -e \"ssh -i $SSH_KEY_PATH\""
fi

echo "=========================================="
echo "D&D Site Deployment Script"
echo "=========================================="
echo ""
echo "VPS: $VPS_USER@$VPS_HOST"
echo "Deploy directory: $DEPLOY_DIR"
echo "Site URL: https://$SITE_URL"
echo ""

# Check if ssh is available
if ! command -v ssh &> /dev/null; then
    echo "Error: ssh is not installed"
    exit 1
fi

# Check if rsync is available
if ! command -v rsync &> /dev/null; then
    echo "Error: rsync is not installed"
    exit 1
fi

echo "Step 1: Creating directory structure on VPS..."
$SSH_CMD "$VPS_USER@$VPS_HOST" "sudo mkdir -p $DEPLOY_DIR && sudo chown \$USER:\$USER $DEPLOY_DIR"

echo ""
echo "Step 2: Uploading site files..."
# Upload everything except deployment scripts and secrets
eval "$RSYNC_CMD -avz --exclude='deploy.sh' --exclude='*.yaml' --exclude='Caddyfile*' --exclude='.env*' --exclude='.git*' --exclude='*.sh' --exclude='process_character.py' \
    \"$LOCAL_DIR/\" \"$VPS_USER@$VPS_HOST:$DEPLOY_DIR/\""

echo ""
echo "Step 3: Setting permissions..."
$SSH_CMD "$VPS_USER@$VPS_HOST" "sudo chmod -R 755 $DEPLOY_DIR"

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "Option A: Add to existing setup (Caddyfile):"
echo ""
cat << EOF
$SITE_URL {
    root * $DEPLOY_DIR
    file_server
    try_files {path} {path}/index.html =404
    encode gzip
}
EOF
echo ""
echo "Option B: Run as standalone Docker container:"
echo "  1. SSH to your VPS: ssh $VPS_USER@$VPS_HOST"
echo "  2. cd $DEPLOY_DIR"
echo "  3. docker compose -f docker-compose.standalone.yaml up -d"
echo ""
echo "Your site is available at: https://$SITE_URL"
