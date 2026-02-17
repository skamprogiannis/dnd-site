import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const CharacterSheet: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const sheetPath = fileData.frontmatter?.sheet as string | undefined
  if (!sheetPath) {
    return null
  }

  const fileName = sheetPath.split("/").pop() || "character.json"
  // Ensure the path starts with a leading slash for absolute root referencing
  const fullPath = sheetPath.startsWith("/") ? sheetPath : `/${sheetPath}`

  return (
    <div class={classNames(displayClass, "character-sheet")}>
      <a
        href={fullPath}
        download={fileName}
        class="download-sheet-link"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          backgroundColor: "var(--secondary)",
          color: "var(--light)",
          borderRadius: "4px",
          textDecoration: "none",
          fontWeight: "bold",
          marginTop: "1rem",
          fontSize: "0.8rem",
          textAlign: "center",
          width: "100%",
          fontFamily: "var(--bodyFont)",
          cursor: "pointer",
        }}
      >
        Download Character JSON
      </a>
    </div>
  )
}

CharacterSheet.afterDOMLoaded = `
// No complex script needed - standard <a> tag with download attribute works best on static sites
// If the browser opens the JSON instead of downloading, the user can Ctrl+S
`

CharacterSheet.css = `
.character-sheet a:hover {
  background-color: var(--tertiary) !important;
}
`

export default (() => CharacterSheet) satisfies QuartzComponentConstructor
