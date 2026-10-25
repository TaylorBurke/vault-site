// Hand-written (no build step): a toolbar button that opens a random note.
import { h } from "preact"

// Runs in the browser. `fetchData` is a global promise of static/contentIndex.json
// that Quartz injects on every page; `spaNavigate` swaps pages without a full reload.
const script = `
async function goRandom() {
  const index = await fetchData
  const here = document.body.dataset.slug
  const slugs = Object.keys(index).filter((s) => s !== here && s !== "index" && !s.startsWith("tags/"))
  if (slugs.length === 0) return
  const slug = slugs[Math.floor(Math.random() * slugs.length)]
  const url = new URL("/" + slug, window.location.origin)
  if (window.spaNavigate) window.spaNavigate(url)
  else window.location.assign(url)
}

function setupRandomPage() {
  for (const btn of document.getElementsByClassName("random-page")) {
    btn.addEventListener("click", goRandom)
    window.addCleanup(() => btn.removeEventListener("click", goRandom))
  }
}

document.addEventListener("nav", setupRandomPage)
`

const css = `
.random-page {
  cursor: pointer;
  padding: 0;
  background: none;
  border: none;
  width: 20px;
  height: 32px;
  margin: 0;
  flex-shrink: 0;
  color: var(--darkgray);
  display: flex;
  align-items: center;
}
.random-page svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: var(--darkgray);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.random-page:hover svg {
  stroke: var(--secondary);
}
`

// Dice icon
const RandomPage = ({ displayClass }) =>
  h(
    "button",
    {
      class: ["random-page", displayClass].filter(Boolean).join(" "),
      "aria-label": "Random page",
      title: "Random page",
    },
    h(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", "aria-hidden": "true" },
      h("rect", { x: 3, y: 3, width: 18, height: 18, rx: 3 }),
      h("circle", { cx: 8.5, cy: 8.5, r: 1, fill: "currentColor" }),
      h("circle", { cx: 15.5, cy: 15.5, r: 1, fill: "currentColor" }),
      h("circle", { cx: 12, cy: 12, r: 1, fill: "currentColor" }),
    ),
  )

RandomPage.afterDOMLoaded = script
RandomPage.css = css

const RandomPage_default = () => RandomPage

export { RandomPage_default as RandomPage }
