# How to Transfer Files to Your VPS

Your D&D site is now located at: `~/tabletop_games/D&D/dnd_site/`

## Method 1: Using SCP (Recommended)

SCP (Secure Copy Protocol) transfers files over SSH. It's built into most systems.

### Basic Syntax:

```bash
scp -r [source] [destination]
```

### From your local computer to VPS:

**Option A: Copy everything**

```bash
# Replace 'stefan' with your VPS username and update the path
scp -r ~/tabletop_games/D&D/dnd_site/* stefan@caravanserai.gr:/var/www/dnd-site/
```

**Option B: Copy excluding deployment configs (if configuring manually)**

```bash
# This copies only the HTML and images, not the config files
cd ~/tabletop_games/D&D/dnd_site
scp -r index.html lucian stefan@caravanserai.gr:/var/www/dnd-site/
```

### If you need to create the directory first:

```bash
# SSH into VPS and create directory
ssh stefan@caravanserai.gr "sudo mkdir -p /var/www/dnd-site && sudo chown \$USER:\$USER /var/www/dnd-site"

# Then copy files
scp -r ~/tabletop_games/D&D/dnd_site/* stefan@caravanserai.gr:/var/www/dnd-site/
```

## Method 2: Using RSYNC (Better for updates)

Rsync is faster for subsequent uploads because it only transfers changed files.

```bash
# First time - copy everything
rsync -avz ~/tabletop_games/D&D/dnd_site/ stefan@caravanserai.gr:/var/www/dnd-site/

# Later - only copy changed files (much faster!)
rsync -avz ~/tabletop_games/D&D/dnd_site/ stefan@caravanserai.gr:/var/www/dnd-site/
```

## Method 3: Using Git (If you prefer version control)

If you want to use git for deployment:

```bash
# On VPS, initialize a bare repo
ssh stefan@caravanserai.gr
cd /var/www
mkdir dnd-site.git && cd dnd-site.git
git init --bare

# Create post-receive hook
cat > hooks/post-receive << 'EOF'
#!/bin/bash
GIT_WORK_TREE=/var/www/dnd-site git checkout -f
EOF
chmod +x hooks/post-receive
exit

# On local machine, add remote and push
cd ~/tabletop_games/D&D/dnd_site
git init
git add .
git commit -m "Initial D&D site"
git remote add deploy stefan@caravanserai.gr:/var/www/dnd-site.git
git push deploy main
```

## Method 4: Using the Deploy Script

The easiest method - just run the included script:

```bash
cd ~/tabletop_games/D&D/dnd_site
./deploy.sh
```

This script will:

1. Create the directory on your VPS
2. Upload all files using rsync
3. Set correct permissions
4. Show you next steps

**Note:** Make sure to update the VPS_USER and VPS_HOST variables in deploy.sh first:

```bash
# Edit these lines in deploy.sh:
VPS_USER="your-vps-username"
VPS_HOST="caravanserai.gr"  # or your VPS IP address
```

## Prerequisites Check

Before transferring, make sure:

1. **SSH access works:**

   ```bash
   ssh stefan@caravanserai.gr
   # Should log you into the VPS without password (if using keys)
   ```

2. **Directory exists and you have permissions:**

   ```bash
   # On VPS:
   sudo mkdir -p /var/www/dnd-site
   sudo chown $USER:$USER /var/www/dnd-site
   ```

3. **Firewall allows connections:**
   ```bash
   # On VPS:
   sudo ufw status
   # Should show ports 80, 443, and 22 (SSH) are open
   ```

## Troubleshooting

### "Permission denied"

```bash
# Fix permissions on VPS
ssh stefan@caravanserai.gr "sudo chown -R \$USER:\$USER /var/www/dnd-site"
```

### "No such file or directory"

```bash
# Create the directory first
ssh stefan@caravanserai.gr "sudo mkdir -p /var/www/dnd-site"
```

### "Connection refused"

- Check that SSH is running on VPS: `sudo systemctl status ssh`
- Check firewall: `sudo ufw allow 22`
- Verify IP address/hostname is correct

### Slow transfer

Use compression with scp:

```bash
scp -r -C ~/tabletop_games/D&D/dnd_site/* stefan@caravanserai.gr:/var/www/dnd-site/
```

Or use rsync (recommended):

```bash
rsync -avz --progress ~/tabletop_games/D&D/dnd_site/ stefan@caravanserai.gr:/var/www/dnd-site/
```

## Quick Reference

| Command                     | Purpose                         |
| --------------------------- | ------------------------------- |
| `scp -r source dest`        | Copy files recursively          |
| `rsync -avz source dest`    | Sync files (faster for updates) |
| `ssh user@host`             | Connect to VPS                  |
| `sudo chown user:group dir` | Change ownership                |
| `sudo mkdir -p dir`         | Create directory (with parents) |

## After Transfer

Once files are on your VPS:

1. **If adding to nexus365:**

   ```bash
   # SSH to VPS
   ssh stefan@caravanserai.gr

   # Add to Caddyfile
   cd ~/repositories/portfolio_projects/nexus365
   # Edit Caddyfile to add dnd.caravanserai.gr block

   # Reload
   docker compose restart caddy
   ```

2. **If using standalone Docker:**
   ```bash
   # On VPS
   cd /var/www/dnd-site
   docker compose -f docker-compose.standalone.yaml up -d
   ```

## Alternative: Using SFTP Client

If you prefer a GUI:

- **FileZilla** (Windows/Mac/Linux) - Free
- **Cyberduck** (Mac/Windows) - Free
- **WinSCP** (Windows) - Free

Connect with:

- Protocol: SFTP (SSH File Transfer Protocol)
- Host: caravanserai.gr (or your VPS IP)
- Username: your VPS username
- Password: your VPS password (or use SSH key)

Then simply drag and drop files to `/var/www/dnd-site/`
