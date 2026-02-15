# D&D Character Site

Static HTML site for hosting D&D character sheets on **dnd.caravanserai.gr**. Hosted on GitHub Pages.

## 🚀 Deployment (GitHub Pages)

This site is hosted on GitHub Pages. To deploy changes, simply push to the `main` branch.

1. **Commit your changes:**

   ```bash
   git add .
   git commit -m "Update character sheets"
   ```

2. **Push to GitHub:**

   ```bash
   git push origin main
   ```

3. **Verify:**
   Visit [https://dnd.caravanserai.gr](https://dnd.caravanserai.gr)

## 🎲 Adding New Characters

1. **Process Obsidian Export:**
   Use the `process_character.py` script to format your Obsidian exports correctly for the web. This script fixes links, optimizes images (converting Base64 to files), and handles metadata.

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
   Commit and push your changes to GitHub.

## 📁 Structure

```
dnd_site/
├── index.html                    # Main landing page
├── site-lib/                     # Metadata for Obsidian JS
│   ├── metadata.json
│   └── search-index.json
├── lucian/                       # Example character folder
│   ├── index.html               # Main character sheet
│   ├── father-davor.html        # Related NPC
│   └── images/                  # Extracted images (optimized)
├── process_character.py          # Script to process Obsidian exports
└── CNAME                         # Custom domain configuration for GitHub Pages
```

## 🛠️ Technical Details

- **Obsidian Compatibility:** The HTML files use minified inline JS that expects a certain structure. We include `site-lib/` metadata files and inject a `<base href="..">` tag to ensure correct rendering.
- **Image Optimization:** The processing script automatically extracts Base64 images from Obsidian exports and saves them as physical files, reducing HTML size from ~30MB to ~2MB.
- **Hosting:** Static hosting via GitHub Pages with a custom domain (`dnd.caravanserai.gr`).
