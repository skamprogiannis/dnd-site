import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const CharacterSheet: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const sheetPath = fileData.frontmatter?.sheet as string | undefined
  if (!sheetPath) {
    return null
  }

  const fileName = sheetPath.split("/").pop() || "character.json"

  return (
    <div class={classNames(displayClass, "character-sheet")}>
      <button
        type="button"
        class="download-sheet-btn"
        data-path={`/${sheetPath}`}
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
document.querySelectorAll('.download-sheet-btn').forEach(btn => {
  btn.onclick = (e) => {
    e.preventDefault()
    const path = btn.dataset.path
    const filename = btn.dataset.filename
    fetch(path)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      })
      .catch(() => {
        window.location.href = path
      })
  }
})
`

CharacterSheet.css = `
.character-sheet button:hover {
  background-color: var(--tertiary) !important;
}
`

export default (() => CharacterSheet) satisfies QuartzComponentConstructor
