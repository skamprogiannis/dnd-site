# Chronicles of Lemuria

A digital archive of our D&D campaigns, legends, and characters.

## Features

- **Obsidian Support**: Native rendering of Obsidian Markdown, including Wikilinks, Callouts, and Graph View.
- **Headless CMS**: Integrated Decap CMS for web-based editing by players.
- **Automated Deployment**: Powered by GitHub Actions for free, reliable updates.
- **Character Sheets**: Support for uploading and downloading `.json` character sheets.

## How to Edit

1. Visit the [Admin Panel](https://dnd.caravanserai.gr/static/admin/).
2. Enter the secret phrase.
3. Log in with your GitHub account.
4. Save your changes to update the live site.

## Setup Instructions (GitHub Pages + Vercel)

### 1. OAuth Proxy (Vercel)

To handle the GitHub login, you need a small proxy:

1. Deploy [decap-proxy](https://github.com/sterlingwes/decap-proxy) to Vercel.
2. In GitHub, go to `Settings > Developer Settings > OAuth Apps` and create a new app.
   - **Homepage URL**: `https://dnd.caravanserai.gr`
   - **Authorization callback URL**: `https://your-proxy.vercel.app/api/callback`
3. Set the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables in Vercel.
4. Update `base_url` in `quartz/static/admin/config.yml` to your Vercel URL.

### 2. Domain Configuration

- **CNAME Record**: `dnd` -> `skamprogiannis.github.io` (or your GitHub Pages domain)
- **GitHub Settings**: In your repo, go to `Settings > Pages` and set the custom domain to `dnd.caravanserai.gr`.

## Tech Stack

- **Engine**: [Quartz v4](https://quartz.jzhao.xyz/)
- **Hosting**: GitHub Pages
- **Editor**: [Decap CMS](https://decapcms.org/)
- **Auth Proxy**: Vercel

