# Chronicles of Lemuria

A digital archive of our D&D campaigns, legends, and characters.

## Features

- **Obsidian Support**: Native rendering of Obsidian Markdown, including Wikilinks, Callouts, and Graph View.
- **Headless CMS**: Integrated Decap CMS for web-based editing by players.
- **Automated Deployment**: Powered by Netlify for instant updates.

## How to Edit

1. Visit the [Admin Panel](https://dnd.caravanserai.gr/static/admin/).
2. Enter the secret phrase (`Kraag`).
3. Log in with your GitHub account (or email if invited via Netlify Identity).
4. Save your changes to update the live site.

## Setup Instructions (Netlify)

1. **Enable Identity**: In Netlify, go to `Site configuration > Identity` and click **Enable Identity**.
2. **Registration**: Set to **Invite only** to keep the site private.
3. **Services**: Scroll down to `Services > Git Gateway` and click **Enable Git Gateway**.
4. **Custom Domain**:
   - Add `dnd.caravanserai.gr` in Netlify under `Domain management`.
   - Update your DNS provider (e.g., Cloudflare, GoDaddy) to point the CNAME record for `dnd` to your Netlify site URL (`chronicles-of-lemuria.netlify.app`).

## Tech Stack

- **Engine**: [Quartz v4](https://quartz.jzhao.xyz/)
- **Hosting**: [Netlify](https://www.netlify.com/)
- **Editor**: [Decap CMS](https://decapcms.org/)
