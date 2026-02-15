import shutil
import os
from pathlib import Path
import subprocess

def main():
    # Paths
    base_dir = Path("/home/stefan/tabletop_games/D&D")
    html_source = base_dir / "characters/lucian"
    img_source = base_dir / "obsidian/Lucian/Images"
    json_source = html_source / "Lucian_Dhampir_Ranger.json"
    
    staging_dir = Path("/home/stefan/tabletop_games/D&D/dnd_site/staging/lucian")
    
    # Clean staging
    if staging_dir.exists():
        shutil.rmtree(staging_dir)
    staging_dir.mkdir(parents=True)
    
    print("Staging files...")
    
    # Copy HTMLs
    for f in html_source.glob("*.html"):
        shutil.copy2(f, staging_dir)
        
    # Copy Images
    img_dest = staging_dir / "Images"
    img_dest.mkdir()
    for f in img_source.glob("*"):
        shutil.copy2(f, img_dest)
        
    # Copy JSON
    if json_source.exists():
        shutil.copy2(json_source, staging_dir / "lucian.json")
        print("JSON found and staged.")
        
    # Run processor
    print("Running process_character.py...")
    cmd = ["python3", "process_character.py", str(staging_dir), "lucian"]
    subprocess.run(cmd, check=True)
    
    # Post-process to add JSON link
    index_file = Path("lucian/index.html")
    if index_file.exists():
        with open(index_file, 'r') as f:
            content = f.read()
            
        # Add JSON link before body end if not present
        if "lucian.json" not in content:
            link_html = '<div style="text-align: center; margin-top: 20px; font-size: 0.8em;"><a href="lucian/lucian.json" style="color: #666; text-decoration: none;">Raw JSON</a></div>'
            content = content.replace("</body>", f"{link_html}</body>")
            
            with open(index_file, 'w') as f:
                f.write(content)
            print("Added JSON link to index.html")

    # Copy JSON to final dest (process_character doesn't copy non-html/img by default)
    final_dest = Path("lucian/lucian.json")
    if (staging_dir / "lucian.json").exists():
        shutil.copy2(staging_dir / "lucian.json", final_dest)

if __name__ == "__main__":
    main()
