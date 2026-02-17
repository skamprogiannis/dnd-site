# Chronicles of Lemuria

A digital archive of our D&D campaigns, legends, and characters.

## Features

- **Obsidian Support**: Native rendering of Obsidian Markdown, including Wikilinks, Callouts, and Graph View.
- **Headless CMS**: Integrated Decap CMS for web-based editing by players.
- **Automated Deployment**: Powered by Vercel for instant updates.
- **Character Sheets**: Support for uploading and downloading `.json` character sheets.

## How to Edit

1. Visit the [Admin Panel](https://dnd.caravanserai.gr/static/admin/edit.html).
2. Enter the secret phrase.
3. Log in with your GitHub account.
4. Save your changes to update the live site.

## Infrastructure Setup (Vercel)

The site is hosted on **Vercel** which handles both the build process and the GitHub authentication.

### 1. Domain Configuration

To point `dnd.caravanserai.gr` to this site:

- **CNAME Record**: `dnd` -> `cname.vercel-dns.com`

### 2. Environment Variables

Add these to your Vercel Project Settings:

- `GITHUB_CLIENT_ID`: From your GitHub OAuth App.
- `GITHUB_CLIENT_SECRET`: From your GitHub OAuth App.

### 3. Authentication

The site uses internal serverless functions (`api/auth.js` and `api/callback.js`) to handle the login handshake.

- **GitHub App Callback URL**: Must be set to `https://dnd.caravanserai.gr/api/callback`.

## Tech Stack

- **Engine**: [Quartz v4](https://quartz.jzhao.xyz/)
- **Hosting**: [Vercel](https://vercel.com/)
- **Editor**: [Decap CMS](https://decapcms.org/)

