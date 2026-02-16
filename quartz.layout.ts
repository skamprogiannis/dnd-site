import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "Admin Login": "/static/admin/",
      "Source Code": "https://github.com/skamprogiannis/dnd-site",
    },
  }),
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
        const lowerName = node.displayName.toLowerCase()
        if (lowerName === "npcs") {
          node.displayName = "NPCs"
        } else if (lowerName === "characters") {
          node.displayName = "Characters"
        } else if (node.name === "Lucian" && node.file) {
          node.displayName = "Lucian, the Pale Inquisitor"
        } else {
          node.displayName = node.displayName
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        }
        return node
      },
      filterFn: (node) => {
        // Hide the "Lucian" subfolder (it has no .file property)
        if (node.name === "Lucian" && !node.file) {
          return false
        }
        return true
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
  right: [
    Component.Graph({
      localGraph: {
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 50,
        fontSize: 0.6,
      },
      globalGraph: {
        repelForce: 0.5,
        centerForce: 0.2,
        linkDistance: 50,
        fontSize: 0.6,
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
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
        const lowerName = node.displayName.toLowerCase()
        if (lowerName === "npcs") {
          node.displayName = "NPCs"
        } else if (lowerName === "characters") {
          node.displayName = "Characters"
        } else if (node.name === "Lucian" && node.file) {
          node.displayName = "Lucian, the Pale Inquisitor"
        } else {
          node.displayName = node.displayName
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        }
        return node
      },
      filterFn: (node) => {
        if (node.name === "Lucian" && !node.file) {
          return false
        }
        return true
      },
    }),
  ],
  right: [],
}
