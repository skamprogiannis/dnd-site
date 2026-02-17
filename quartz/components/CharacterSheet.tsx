import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const CharacterSheet: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const sheetPath = fileData.frontmatter?.sheet as string | undefined
  if (!sheetPath) {
    return null
  }

  const fileName = sheetPath.split("/").pop() || "character.json"
  const fullPath = sheetPath.startsWith("/") ? sheetPath : `/${sheetPath}`

  return (
    <div class={classNames(displayClass, "character-sheet")}>
      <button
        type="button"
        class="download-sheet-btn"
        data-path={fullPath}
        data-filename={fileName}
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          backgroundColor: "var(--secondary)",
          color: "var(--light)",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
          marginTop: "1rem",
          fontSize: "0.8rem",
          textAlign: "center",
          width: "100%",
          fontFamily: "var(--bodyFont)",
        }}
      >
        Download Character JSON
      </button>
    </div>
  )
}

CharacterSheet.afterDOMLoaded = `
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".download-sheet-btn")
  if (!btn) return

  const path = btn.getAttribute("data-path")
  const filename = btn.getAttribute("data-filename")
  if (!path || !filename) return

  // Standard Link Download Method
  const link = document.createElement("a")
  link.href = path
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link)
  }, 100)
})
`

CharacterSheet.css = `
.character-sheet button:hover {
  background-color: var(--tertiary) !important;
}
`

export default (() => CharacterSheet) satisfies QuartzComponentConstructor
