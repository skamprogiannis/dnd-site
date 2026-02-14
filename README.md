# D&D Character Site

Static HTML site for hosting D&D character sheets on dnd.caravanserai.gr

**Location:** `~/tabletop_games/D&D/dnd_site/`

## Structure

```
dnd_site/
├── index.html                    # Main landing page
├── site-lib/                     # Metadata for Obsidian JS
│   ├── metadata.json
│   └── search-index.json
├── lucian/
│   ├── index.html               # Lucian character sheet
│   ├── father-davor.html        # Father Davor NPC
│   ├── lady-isovold.html        # Lady Isovold NPC
│   ├── witch-hunter.html        # Witch Hunter background
│   ├── blood-of-the-creator.html # Lore document
│   └── images/                  # Character images
│       ├── lucian.png
│       ├── father-davor.png
│       ├── lady-isovold.png
│       └── lucian-shadows.png
├── deploy.sh                    # Deployment script
├── Caddyfile                    # Standalone Caddy config
├── Caddyfile.dnd               # Config to add to nexus365
├── docker-compose.standalone.yaml  # Standalone Docker setup
├── docker-compose.dnd.yaml     # Addition to nexus365 compose
├── DEPLOYMENT_GUIDE.md         # Detailed deployment instructions
└── TRANSFER_GUIDE.md          # How to transfer files to VPS
```

## Configuration

The project uses a `.env` file for deployment settings. See `.env.example` for the required variables:

- `VPS_USER`: Your SSH username on the server.
- `VPS_HOST`: The server hostname or IP address.
- `DEPLOY_DIR`: The path on the server where files should be uploaded.
- `SITE_URL`: The domain name for the site.
- `SSH_KEY_PATH`: (Optional) Path to your private SSH key.

## Deployment

1. **Setup Environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your specific details
   ```

2. **Run Deploy Script:**
   ```bash
   ./deploy.sh
   ```

## Prerequisites

1. **DNS Configuration:**
   - Create A record: `dnd.caravanserai.gr` → your VPS IP address
   - Wait for DNS propagation (can take up to 24 hours)

2. **Firewall:**
   - Ensure ports 80 and 443 are open

3. **Docker (for Option B):**
   - Docker and Docker Compose installed on VPS

## Adding New Characters

1. **Process Obsidian Export:**
   Use the `process_character.py` script to format your Obsidian exports correctly for the web:

   ```bash
   cd ~/tabletop_games/D&D/dnd_site
   python3 process_character.py "../Characters/YourCharacterFolder" "your-slug"
   ```

   - Replace `../Characters/YourCharacterFolder` with the path to your Obsidian HTML export folder.
   - Replace `your-slug` with the URL name you want (e.g., `kraag`).

2. **Add to Landing Page:**
   Open `index.html` and add a new character card inside the `<main class="character-grid">` section:

   ```html
   <a href="your-slug/" class="character-card">
     <h2>Character Name</h2>
     <p class="role">Class | Location</p>
     <p class="description">Brief description of the character.</p>
   </a>
   ```

3. **Deploy:**
   ```bash
   ./deploy.sh
   ```

## Technical Notes (Obsidian Exports)

- **JavaScript Dependency:** The HTML files use minified inline JS that expects a certain structure to render correctly.
- **Base Tag:** Each character file contains a `<base href="..">` tag. This tells the browser that the "root" of the site is one level up.
- **Metadata Fetches:** The JS attempts to fetch `/site-lib/metadata.json` and `/site-lib/search-index.json`.
- **Fix:** We've provided dummy files in `site-lib/` to satisfy these requests. If the page is blank, check the browser console for 404 errors.
- **Large Files:** Files are massive (~33MB) because images are base64 encoded.
