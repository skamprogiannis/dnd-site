# Chronicles of Lemuria

A digital archive of our D&D campaigns, legends, and characters.

## Features

- **Obsidian Support**: Native rendering of Obsidian Markdown, including Wikilinks, Callouts, and Graph View.
- **Headless CMS**: Integrated Decap CMS for web-based editing by players.
- **Automated Deployment**: Powered by Netlify for instant updates.
- **Character Sheets**: Support for uploading and downloading `.json` character sheets.

## How to Edit

1. Visit the [Admin Panel](https://dnd.caravanserai.gr/static/admin/).
2. Enter the secret phrase.
3. Log in with your GitHub account (or Google/email as configured).
4. Save your changes to update the live site.

## Infrastructure Setup (Netlify)

The site is hosted on **Netlify** and uses **Netlify Identity** for authentication.

### 1. Domain Configuration

To point `dnd.caravanserai.gr` to this site:

- **CNAME Record**: `dnd` -> `chronicles-of-lemuria.netlify.app`
- **TXT Record (Verification)**:
  - **Host**: `subdomain-owner-verification`
  - **Value**: `d3a8c538f99fdbbc4e42267f70c0e67`

### 2. Identity & CMS Settings

- **Enable Identity**: Done.
- **Registration**: Currently set to **Open** (with GitHub/Google support).
- **Enable Git Gateway**: Done. This connects the CMS to the GitHub API.

## Tech Stack

- **Engine**: [Quartz v4](https://quartz.jzhao.xyz/)
- **Hosting**: [Netlify](https://www.netlify.com/)
- **Editor**: [Decap CMS](https://decapcms.org/)
