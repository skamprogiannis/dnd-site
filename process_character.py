#!/usr/bin/env python3
"""
Generic script to process Obsidian-exported HTML files for the D&D site.
Usage: python3 process_character.py <source_dir> <character_slug>
Example: python3 process_character.py "./Characters/Kraag" "kraag"
"""

import sys
import re
import shutil
import json
from pathlib import Path


def clean_content(content):
    """Clean up weird spacing and commas"""
    # Fix "word , word" or "word ," -> "word, word" or "word,"
    content = re.sub(r"\s+,", ",", content)
    # Ensure there is a space AFTER a comma if there isn't one
    content = re.sub(r",([^\s])", r", \1", content)
    # Fix double spaces
    content = re.sub(r"  +", " ", content)
    # Fix "because because"
    content = re.sub(r"\bbecause because\b", "because", content)
    return content


def process_html_file(source_file, target_file, slug, link_map, original_main_name):
    """Process a single HTML file"""
    print(f"  Processing: {source_file.name} -> {target_file.name}")

    with open(source_file, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Handle <base> tag. Remove existing and add correct one.
    # We use <base href=".."> so that site-lib/ and other root assets are found.
    content = re.sub(r'<base href="[^"]*">\s*', "", content)
    content = re.sub(r"<head>", '<head>\n<base href="..">', content)

    # 2. Fix links
    # We want to find all href="something"
    def link_replacer(match):
        href = match.group(1)

        # Skip external links
        if href.startswith("http") or href.startswith("data:"):
            return match.group(0)

        # Extract path and anchor
        parts = href.split("#", 1)
        path = parts[0]
        anchor = parts[1] if len(parts) > 1 else None

        # Check if this path is in our link map
        new_path = None
        # Try exact match
        if path in link_map:
            new_path = link_map[path]
        # Try basename match (e.g. "Lucian/Father Davor.html" -> "Father Davor.html")
        else:
            base_path = Path(path).name
            if base_path in link_map:
                new_path = link_map[base_path]

        if new_path:
            # If the link points to the CURRENT file being processed
            if source_file.name == path or Path(path).name == source_file.name:
                if anchor:
                    return f'href="#{anchor}"'
                else:
                    return f'href="{slug}/{new_path}"'

            # Link to another page in the same character set
            result = f'href="{slug}/{new_path}"'
            if anchor:
                result += f"#{anchor}"
            return result

        return match.group(0)

    content = re.sub(r'href="([^"]*)"', link_replacer, content)

    # 3. Remove target="_self"
    content = re.sub(r'\s*target="_self"', "", content)

    # 4. Clean content
    content = clean_content(content)

    # 5. Update meta tags
    content = re.sub(
        r'<meta name="pathname" content="[^"]*">',
        f'<meta name="pathname" content="{slug}/{target_file.name}">',
        content,
    )
    content = re.sub(
        r'<meta property="og:url" content="[^"]*">',
        f'<meta property="og:url" content="https://dnd.caravanserai.gr/{slug}/{target_file.name}">',
        content,
    )

    # 7. Replace Base64 images with links to local files
    # Find all <img src="data:image/..." ...> tags
    def image_replacer(match):
        attrs_before = match.group(1)
        # ext = match.group(2) # We don't rely on this extension, we check the filesystem
        # b64_data = match.group(3)
        attrs_after = match.group(4)

        # Try to find a name in alt or title
        all_attrs = attrs_before + attrs_after
        name_match = re.search(r'(alt|title)="([^"]+)"', all_attrs)

        img_name = None
        if name_match:
            # Clean name: remove special chars, spaces to hyphens
            raw_name = name_match.group(2)
            # Try to match existing files in the images directory
            # We expect images to be in {deploy_dir}/images/
            img_dir = Path(target_file).parent / "images"
            if not img_dir.exists():
                return match.group(0)  # Keep original if no images dir

            # Try exact match first
            for ext in [".png", ".jpg", ".jpeg", ".gif"]:
                # Check for "Lucian.png"
                if (img_dir / f"{raw_name}{ext}").exists():
                    img_name = f"{raw_name}{ext}"
                    break
                # Check for "lucian.png" (lowercase)
                if (img_dir / f"{raw_name.lower()}{ext}").exists():
                    img_name = f"{raw_name.lower()}{ext}"
                    break
                # Check for hyphenated "lucian-shadows.png"
                clean_name = raw_name.replace(" ", "-").lower()
                if (img_dir / f"{clean_name}{ext}").exists():
                    img_name = f"{clean_name}{ext}"
                    break
                # Special check: try to match against copied files which were forced to be hyphenated
                # Our copy logic was: dest_name = img.name.replace(" ", "-").lower()
                # So we should look for that exact pattern
                target_img_name = raw_name.replace(" ", "-").lower() + ext
                if (img_dir / target_img_name).exists():
                    img_name = target_img_name
                    break

        if img_name:
            print(f"    Linked image: {img_name}")
            return f'<img{attrs_before}src="images/{img_name}"{attrs_after}>'

        print(
            f"    Warning: Could not match image for {name_match.group(2) if name_match else 'unknown'}"
        )
        # Return original matched string if no file found (don't break it)
        return match.group(0)

    # Pattern: <img ... src="data:image/(png|jpeg|jpg|gif);base64,([A-Za-z0-9+/=]+)" ...>
    content = re.sub(
        r'<img([^>]+)src="data:image/([^;]+);base64,([^"]+)"([^>]*)>',
        image_replacer,
        content,
    )

    with open(target_file, "w", encoding="utf-8") as f:
        f.write(content)


def update_global_metadata(site_dir, slug, files):
    """Update site-lib/metadata.json with the new files"""
    meta_path = site_dir / "site-lib" / "metadata.json"
    meta_path.parent.mkdir(exist_ok=True)

    data = {}
    if meta_path.exists():
        try:
            with open(meta_path, "r") as f:
                data = json.load(f)
        except:
            pass

    if "files" not in data:
        data["files"] = []

    for f in files:
        rel_path = f"{slug}/{f}"
        if rel_path not in data["files"]:
            data["files"].append(rel_path)

    with open(meta_path, "w") as f:
        json.dump(data, f, indent=2)


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 process_character.py <source_dir> <character_slug>")
        sys.exit(1)

    source_dir = Path(sys.argv[1]).resolve()
    slug = sys.argv[2]

    # Base site directory
    site_dir = Path(__file__).parent.resolve()
    deploy_dir = site_dir / slug

    if not source_dir.exists():
        print(f"Error: Source directory {source_dir} does not exist.")
        sys.exit(1)

    print(f"Exporting {source_dir.name} to {deploy_dir}...")
    deploy_dir.mkdir(parents=True, exist_ok=True)

    # 1. Find all HTML files
    html_files = list(source_dir.glob("*.html"))
    if not html_files:
        print("No HTML files found in source directory.")
        sys.exit(1)

    # 2. Create link map
    link_map = {}
    main_page = None
    max_size = -1
    for f in html_files:
        size = f.stat().st_size
        if size > max_size:
            max_size = size
            main_page = f

    for f in html_files:
        new_name = f.name.replace(" ", "-").lower()
        if f == main_page:
            new_name = "index.html"
        link_map[f.name] = new_name

    # 3. Process files
    processed_names = []
    main_page_name = main_page.name if main_page else ""
    for source_file in html_files:
        target_name = link_map[source_file.name]
        target_file = deploy_dir / target_name
        process_html_file(source_file, target_file, slug, link_map, main_page_name)
        processed_names.append(target_name)

    # 4. Copy images
    img_src = source_dir / "Images"
    if img_src.exists():
        img_dest = deploy_dir / "images"
        img_dest.mkdir(exist_ok=True)
        print(f"  Copying images...")
        for img in img_src.glob("*"):
            if img.is_file():
                shutil.copy2(img, img_dest / img.name.replace(" ", "-").lower())

    # 5. Update global metadata
    update_global_metadata(site_dir, slug, processed_names)

    print(f"\nSuccessfully processed character '{slug}'!")
    print(f"Don't forget to add a link to '{slug}/' in index.html and run ./deploy.sh")


if __name__ == "__main__":
    main()
