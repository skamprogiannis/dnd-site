# D&D Character Site

This repository hosts the character sheets, lore, and history of our D&D campaign at **[dnd.caravanserai.gr](https://dnd.caravanserai.gr)**.

It allows us to publish our Obsidian notes directly to the web.

## 🗡️ How to Add Your Character

If you are a player in the campaign, follow these steps to add your character sheet to the site.

### 1. Prepare Your Notes

Export your character notes from Obsidian as HTML files.

- Make sure all your linked images are in a folder named `Images` next to your HTML files.
- Put everything in a folder named after your character (e.g., `Kraag/`).

### 2. Run the Magic Script

We have a script that automatically fixes links, optimizes images, and makes everything web-ready.

1.  Open a terminal in this folder.
2.  Run the following command (replace the path and name):

    ```bash
    python3 process_character.py "../path/to/your/ObsidianExport/Kraag" "kraag"
    ```

    - **First argument:** The path to your exported Obsidian folder.
    - **Second argument:** The "slug" (URL name) for your character (lowercase, no spaces, e.g., `kraag` or `lucian`).

    _The script will create a new folder in this repository with your optimized files._

### 3. Add to the Homepage

Open `index.html` and find the `<main class="character-grid">` section. Copy and paste the block below, filling in your details:

```html
<a href="kraag/" class="character-card">
  <p class="role">Orc Barbarian | Many-Arrows</p>
  <h2>Kraag</h2>
  <p class="description">A brief description of your character goes here...</p>
  <div class="card-footer">View Character Sheet</div>
</a>
```

### 4. Publish

Commit your changes and push them to GitHub. The site updates automatically!

```bash
git add .
git commit -m "Add Kraag to the chronicles"
git push origin main
```

---

## 🛠️ For the Tech-Savvy (Technical Details)

- **Hosting:** The site is hosted on GitHub Pages and served via the custom domain `dnd.caravanserai.gr`.
- **Obsidian Compatibility:** Obsidian exports often use absolute paths and Base64 images. Our `process_character.py` script:
  - Extracts Base64 images into optimized `.png` files (reducing file sizes by ~90%).
  - Injects a `<base>` tag to ensure internal wiki-links work correctly.
  - Fixes metadata fetches for the interactive graph/search features.
- **Structure:** Each character gets their own directory (e.g., `lucian/`), keeping the repository clean and modular.
