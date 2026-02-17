import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "Admin Login": "/static/admin/edit.html",
      "Source Code": "https://github.com/skamprogiannis/dnd-site",
    },
  }),
}

const nameOverrides: Record<string, string> = {
  npcs: "NPCs",
  characters: "Characters",
  lore: "Lore",
  "custom-backgrounds": "Custom Backgrounds",
}

function unslugify(text: string): string {
  if (!text) return ""
  return text
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      title: "Explorer",
      folderClickBehavior: "collapse",
      folderDefaultState: "collapsed",
      useSavedState: true,
      mapFn: (node) => {
        const slug = node.slugSegment ? node.slugSegment.toLowerCase() : ""
        if (nameOverrides[slug]) {
          node.displayName = nameOverrides[slug]
        } else if (slug === "lucian") {
          node.displayName = "Lucian, the Pale Inquisitor"
        } else {
          node.displayName = unslugify(node.displayName)
        }
      },
      filterFn: (node) => {
        const slug = node.slugSegment ? node.slugSegment.toLowerCase() : ""
        // Never hide the root node
        if (node.slug === "") return true
        // Hide internal assets/static folders
        if (slug === "assets" || slug === "static") return false
        // Hide the home page file
        if (node.slug === "index") return false
        return true
      },
    }),
  ],
  right: [
    Component.Graph({
      localGraph: {
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 50,
        fontSize: 0.6,
        scale: 2.0,
      },
      globalGraph: {
        repelForce: 0.5,
        centerForce: 0.2,
        linkDistance: 50,
        fontSize: 0.6,
        scale: 2.0,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.CharacterSheet(),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      title: "Explorer",
      folderClickBehavior: "collapse",
      folderDefaultState: "collapsed",
      useSavedState: true,
      mapFn: (node) => {
        const slug = node.slugSegment ? node.slugSegment.toLowerCase() : ""
        if (nameOverrides[slug]) {
          node.displayName = nameOverrides[slug]
        } else if (slug === "lucian") {
          node.displayName = "Lucian, the Pale Inquisitor"
        } else {
          node.displayName = unslugify(node.displayName)
        }
      },
      filterFn: (node) => {
        const slug = node.slugSegment ? node.slugSegment.toLowerCase() : ""
        if (node.slug === "") return true
        if (slug === "assets" || slug === "static") return false
        if (node.slug === "index") return false
        return true
      },
    }),
  ],
  right: [
    Component.Graph({
      localGraph: {
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 50,
        fontSize: 0.6,
        scale: 2.0,
      },
      globalGraph: {
        repelForce: 0.5,
        centerForce: 0.2,
        linkDistance: 50,
        fontSize: 0.6,
        scale: 2.0,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.CharacterSheet(),
    Component.Backlinks(),
  ],
}
