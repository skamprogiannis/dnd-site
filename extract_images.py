#!/usr/bin/env python3
import os
import re
import base64
import binascii
from pathlib import Path


def extract_images_from_html(html_path):
    print(f"Processing {html_path}...")
    with open(html_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Create images directory relative to the HTML file
    base_dir = html_path.parent
    img_dir = base_dir / "images"
    img_dir.mkdir(exist_ok=True)

    # Regex to find img tags with base64 src
    # Pattern: <img ... src="data:image/(png|jpeg|jpg|gif);base64,([A-Za-z0-9+/=]+)" ...>
    img_pattern = re.compile(
        r'<img([^>]+)src="data:image/([^;]+);base64,([^"]+)"([^>]*)>'
    )

    count = 0

    def replacer(match):
        nonlocal count
        count += 1
        attrs_before = match.group(1)
        ext = match.group(2)
        b64_data = match.group(3)
        attrs_after = match.group(4)

        # Try to find a name in alt or title
        img_name = f"extracted-{count}"
        all_attrs = attrs_before + attrs_after
        name_match = re.search(r'(alt|title)="([^"]+)"', all_attrs)
        if name_match:
            # Clean name: remove special chars, spaces to hyphens
            raw_name = name_match.group(2)
            clean_name = (
                re.sub(r"[^a-zA-Z0-9\s-]", "", raw_name)
                .strip()
                .replace(" ", "-")
                .lower()
            )
            if clean_name:
                img_name = clean_name

        filename = f"{img_name}.{ext}"
        filepath = img_dir / filename

        # If file exists, add a suffix
        suffix = 1
        while filepath.exists():
            filepath = img_dir / f"{img_name}-{suffix}.{ext}"
            suffix += 1

        try:
            # Fix padding if necessary
            missing_padding = len(b64_data) % 4
            if missing_padding:
                b64_data += "=" * (4 - missing_padding)

            img_data = base64.b64decode(b64_data)
            with open(filepath, "wb") as img_f:
                img_f.write(img_data)

            print(f"  Extracted: {filepath.name}")
            return f'<img{attrs_before}src="images/{filepath.name}"{attrs_after}>'
        except (binascii.Error, ValueError) as e:
            print(f"  Error extracting image {count}: {e}")
            return match.group(0)

    new_content = img_pattern.sub(replacer, content)

    if count > 0:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  Successfully extracted {count} images and updated HTML.")
    else:
        print("  No base64 images found.")


def main():
    root_dir = Path("/home/stefan/tabletop_games/D&D/dnd_site")
    for html_file in root_dir.rglob("*.html"):
        # Skip the root index.html as it shouldn't have embedded character images
        if html_file.name == "index.html" and html_file.parent == root_dir:
            continue
        extract_images_from_html(html_file)


if __name__ == "__main__":
    main()
