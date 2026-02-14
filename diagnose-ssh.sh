#!/usr/bin/env bash
# SSH Diagnostic Script
# Run this to troubleshoot SSH connection issues

echo "=========================================="
echo "SSH Connection Diagnostic"
echo "=========================================="
echo ""

# Check if keys exist
echo "1. Checking SSH keys..."
if [ -f ~/.ssh/id_ed25519 ]; then
    echo "   ✓ Private key exists: ~/.ssh/id_ed25519"
    echo "   Permissions: $(stat -c '%a' ~/.ssh/id_ed25519) (should be 600)"
else
    echo "   ✗ Private key NOT found!"
fi

if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "   ✓ Public key exists: ~/.ssh/id_ed25519.pub"
    echo "   Permissions: $(stat -c '%a' ~/.ssh/id_ed25519.pub) (should be 644)"
    echo ""
    echo "   Your public key (copy this to Google Cloud):"
    echo "   $(cat ~/.ssh/id_ed25519.pub)"
else
    echo "   ✗ Public key NOT found!"
fi

echo ""
echo "2. Checking SSH agent..."
if pgrep -u "$USER" ssh-agent > /dev/null; then
    echo "   ✓ SSH agent is running"
    echo "   Loaded keys:"
    ssh-add -l 2>/dev/null || echo "   (No keys loaded)"
else
    echo "   ✗ SSH agent is NOT running"
fi

echo ""
echo "3. Testing SSH connection with verbose output..."
echo "   Running: ssh -v -i ~/.ssh/id_ed25519 skamprogiannis@caravanserai.gr"
echo "   (Press Ctrl+C to cancel after you see the error)"
echo ""

# This will fail but show us why
ssh -v -i ~/.ssh/id_ed25519 skamprogiannis@caravanserai.gr 2>&1 | head -30

echo ""
echo "=========================================="
echo "Most Common Issues:"
echo "=========================================="
echo ""
echo "1. Key not loaded in agent:"
echo "   Fix: eval \"\$(ssh-agent -s)\" && ssh-add ~/.ssh/id_ed25519"
echo ""
echo "2. Wrong key permissions:"
echo "   Fix: chmod 600 ~/.ssh/id_ed25519 && chmod 644 ~/.ssh/id_ed25519.pub"
echo ""
echo "3. Key not added to Google Cloud:"
echo "   Go to: https://console.cloud.google.com/compute/instances"
echo "   Click your VM → Edit → SSH Keys → Add your public key"
echo ""
echo "4. Wrong username:"
echo "   Make sure the username at the end of your public key matches: skamprogiannis"
echo ""
echo "Your public key:"
cat ~/.ssh/id_ed25519.pub
echo ""
echo "Username should be: skamprogiannis"
