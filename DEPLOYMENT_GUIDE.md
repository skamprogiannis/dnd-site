# D&D Site Deployment Package - READY

## What's Been Created

All files are ready in: `~/tabletop_games/D&D/dnd_site/`

### Structure:

```
dnd_site/
├── index.html                    # Main landing page (dark theme)
├── lucian/
│   ├── index.html               # Lucian character (main page)
│   ├── father-davor.html        # Father Davor NPC
│   ├── lady-isovold.html        # Lady Isovold NPC
│   ├── witch-hunter.html        # Witch Hunter background
│   ├── blood-of-the-creator.html # Lore document
│   └── images/                  # All character images
├── deploy.sh                    # One-click deployment script
├── Caddyfile                    # Standalone config
├── Caddyfile.dnd               # Add to nexus365
├── docker-compose.standalone.yaml
├── docker-compose.dnd.yaml
└── README.md
```

## What Was Fixed

✅ **File names**: Converted spaces to hyphens (e.g., `Father Davor.html` → `father-davor.html`)
✅ **HTML links**: Changed from `Lucian/Father Davor.html` to relative `father-davor.html`
✅ **Removed**: `<base href="..">` tags
✅ **Removed**: `target="_self"` from all links (user decides how to open)
✅ **Cleaned**: Fixed spacing issues like "word , word" → "word, word"
✅ **Meta tags**: Updated for new domain (dnd.caravanserai.gr)

## Quick Start

### Step 1: Configure DNS (Papaki)

1. Log into Papaki control panel
2. Find DNS management for caravanserai.gr
3. Add A record:
   - Name: `dnd`
   - Type: `A`
   - Value: `[Your VPS IP address]`
4. Wait for propagation (usually 5-30 minutes)

### Step 2: Deploy

**Option A - Add to nexus365 (Recommended):**

```bash
cd ~/tabletop_games/D&D/dnd_site
./deploy.sh
```

Then on VPS:

```bash
# Add this to your nexus365/Caddyfile:
dnd.caravanserai.gr {
    root * /var/www/dnd-site
    file_server
    try_files {path} {path}/index.html =404
    encode gzip
}

# Reload Caddy
cd ~/repositories/portfolio_projects/nexus365
docker compose restart caddy
```

**Option B - Standalone Docker:**

```bash
# Upload files
scp -r ~/tabletop_games/D&D/dnd_site/* user@caravanserai.gr:/var/www/dnd-site/

# On VPS:
cd /var/www/dnd-site
docker compose -f docker-compose.standalone.yaml up -d
```

### Step 3: Verify

Visit: `https://dnd.caravanserai.gr`

You should see:

- Main page with Lucian character card
- Click through to Lucian's full character sheet
- All internal links working
- Forgotten Realms wiki links functional

## Adding Future Characters

1. Process new HTML files with `process_dnd_files.py` (template in repo)
2. Create directory: `dnd_site/new-character/`
3. Add files + images
4. Update `dnd_site/index.html` with new character card
5. Run `./deploy.sh` again

## Important Notes

⚠️ **Some links in original files were broken** (like `href="Torm"` or `href=".html"`)
These were Obsidian wikilinks that didn't export properly. They still exist but won't break the site.

✅ **All main navigation works:**

- Lucian ↔ Father Davor ✓
- Lucian ↔ Lady Isovold ✓
- Lucian → Blood of the Creator ✓
- All Forgotten Realms wiki links ✓

## Support

If deployment fails:

1. Check DNS propagation: `dig dnd.caravanserai.gr`
2. Verify VPS ports: `sudo ufw status` (should show 80, 443 open)
3. Check Caddy logs: `docker logs nexus_proxy` (or `dnd_caddy`)
4. Ensure /var/www/dnd-site exists and has correct permissions

Ready to deploy! 🎲
