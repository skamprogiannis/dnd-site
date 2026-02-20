import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "Admin Login": "/static/edit",
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
