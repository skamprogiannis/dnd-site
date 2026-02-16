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
        if (node.displayName === "npcs") {
          node.displayName = "NPCs"
        } else {
          node.displayName = node.displayName
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        }
        return node
      },
      filterFn: (node) => {
        return node.name !== "The Blood of the Creator"
      },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
  right: [
    Component.Graph(),
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
        if (node.displayName === "npcs") {
          node.displayName = "NPCs"
        } else {
          node.displayName = node.displayName
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
        }
        return node
      },
      filterFn: (node) => {
        return node.name !== "The Blood of the Creator"
      },
    }),
  ],
  right: [],
}
