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
    content = re.sub(r"<base href=\"[^\"]*\">\s*", "", content)
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
        
        # Normalize the path from href for matching
        norm_path = path.replace("%20", " ").strip().lower()
        if norm_path.endswith(".html"):
            norm_path = norm_path[:-5]
        norm_path = norm_path.replace(" ", "-").replace("_", "-")
        
        # Search link_map keys
        for key, val in link_map.items():
            norm_key = key.lower()
            if norm_key.endswith(".html"):
                norm_key = norm_key[:-5]
            norm_key = norm_key.replace(" ", "-").replace("_", "-")
            
            if norm_path == norm_key:
                new_path = val
                break
        
        if new_path:
            print(f"    Linked path: {path} -> {new_path}")
            # If the link points to the CURRENT file being processed
            # Just return the anchor itself if present. Obsidian JS handles this better.
            current_target_name = link_map[source_file.name]
            if new_path == current_target_name:
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


    content = re.sub(r"href=\"([^\"]*)\"", link_replacer, content)

    # 3. Remove target="_self"
    content = re.sub(r"\s*target=\"_self\"", "", content)
    
    # FIX: Remove data-path attributes that cause "This page does not exist yet" overlay
    content = re.sub(r'\s*data-path="[^"]*"', "", content)
    
    # 4. Clean content
    content = clean_content(content)

    # 5. Update meta tags
    content = re.sub(
        r"<meta name=\"pathname\" content=\"[^\"]*\">",
        f'<meta name="pathname" content="{slug}/{target_file.name}">',
        content,
    )
    content = re.sub(
        r"<meta property=\"og:url\" content=\"[^\"]*\">",
        f'<meta property="og:url" content="https://dnd.caravanserai.gr/{slug}/{target_file.name}">',
        content,
    )

    # 7. Replace images with links to local files
    # Handle both Base64 and regular src attributes
    def image_replacer(match):
        tag_name = match.group(1)  # img or span
        attrs_before = match.group(2)
        src_val = match.group(3)
        attrs_after = match.group(4)
        
        # Try to find a name in alt, title, or src itself
        all_attrs = attrs_before + attrs_after + f' src="{src_val}"'
        name_match = re.search(r'(alt|title)="([^"]+)"', all_attrs)
        
        raw_name = None
        if name_match:
            raw_name = name_match.group(2)
        elif not src_val.startswith("data:"):
            raw_name = Path(src_val).name
            
        img_name = None
        if raw_name:
            # Clean name: remove special chars, spaces to hyphens
            # Try to match existing files in the images directory
            img_dir = Path(target_file).parent / "images"
            if not img_dir.exists():
                return match.group(0)
                
            # Check if name already has extension
            has_ext = any(
                raw_name.lower().endswith(e) for e in [".png", ".jpg", ".jpeg", ".gif"]
            )
            
            candidates = []
            if has_ext:
                candidates.append(raw_name)
                candidates.append(raw_name.lower())
                candidates.append(raw_name.replace(" ", "-").lower())
                candidates.append(raw_name.replace(" ", "_").lower())
            else:
                for ext in [".png", ".jpg", ".jpeg", ".gif"]:
                    candidates.append(f"{raw_name}{ext}")
                    candidates.append(f"{raw_name.lower()}{ext}")
                    candidates.append(f"{raw_name.replace(' ', '-').lower()}{ext}")
                    candidates.append(f"{raw_name.replace(' ', '_').lower()}{ext}")
            
            for candidate in candidates:
                if (img_dir / candidate).exists():
                    img_name = candidate
                    break
        
        if img_name:
            print(f"    Linked image: {img_name}")
            # Use slug/images/... because of <base href="..">
            return f'<img{attrs_before}src="{slug}/images/{img_name}"{attrs_after}>'
            
        return match.group(0)

    # First, let's normalize the Obsidian span+img structure to just the img tag
    content = re.sub(
        r'<span([^>]*?)src="([^"]+)"[^>]*?>(<img[^>]*?src="([^"]+)"[^>]*?>)</span>',
        r"\3",
        content,
        flags=re.DOTALL,
    )

    # Match <img ... src="..." ...> or <span ... src="..." ...>
    content = re.sub(
        r'<(img|span)([^>]*?)src="([^"]+)"([^>]*)>',
        image_replacer,
        content,
        flags=re.DOTALL,
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
    
    # Identify the main page
    # Priority: 1. matches slug, 2. contains 'index', 3. largest file
    slug_match = [f for f in html_files if f.stem.lower() == slug or slug in f.stem.lower()]
    index_match = [f for f in html_files if 'index' in f.name.lower()]
    
    if slug_match:
        main_page = slug_match[0]
    elif index_match:
        main_page = index_match[0]
    else:
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

    print(f"  Link map keys: {list(link_map.keys())}")
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

    # 5. Copy other assets (JSON, PDF)
    print(f"  Copying other assets...")
    for ext in ['*.json', '*.pdf']:
        for f in source_dir.glob(ext):
            dest_name = f.name.replace(" ", "-").lower()
            # If the name is something like Lucian_Dhampir_Ranger.json, rename to character slug
            if f.suffix == '.json' and len(list(source_dir.glob('*.json'))) == 1:
                dest_name = f"{slug}.json"
            shutil.copy2(f, deploy_dir / dest_name)
            print(f"    Copied: {dest_name}")

    # 6. Update global metadata
    update_global_metadata(site_dir, slug, processed_names)

    print(f"\nSuccessfully processed character '{slug}'!")
    print(f"Don't forget to add a link to '{slug}/' in index.html and run ./deploy.sh")


if __name__ == "__main__":
    main()
