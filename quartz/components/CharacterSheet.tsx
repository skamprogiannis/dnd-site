import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { classNames } from "../util/lang"

const CharacterSheet: QuartzComponent = ({ fileData, displayClass, cfg }: QuartzComponentProps) => {
  const sheetPath = fileData.frontmatter?.sheet as string | undefined
  if (!sheetPath) {
    return null
  }

  // Extract filename
  const fileName = sheetPath.split("/").pop() || "character.json"

  return (
    <div class={classNames(displayClass, "character-sheet")}>
      <a
        href={`/${sheetPath}`}
        download={fileName}
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
        }}
      >
        Download Character JSON
      </a>
    </div>
  )
}

CharacterSheet.css = `
.character-sheet a:hover {
  background-color: var(--tertiary) !important;
  color: var(--light) !important;
}
`

export default (() => CharacterSheet) satisfies QuartzComponentConstructor
