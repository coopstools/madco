# Metro Atlanta Dance — Website

Static site replacing Squarespace. Hosted on GitHub Pages with a custom Squarespace-managed domain.

## Stack

- Plain HTML / CSS / JS — no build step, no dependencies
- Google Fonts: Cormorant Garamond, DM Sans, Space Mono
- Images served from existing Squarespace CDN (no migration needed yet)
- Mindbody for class registration (external link)

## Repo structure

```
/
├── index.html          ← Homepage
├── style.css           ← All styles
├── main.js             ← Nav dropdowns, scroll effects, reveal animations
├── CNAME               ← Custom domain (metroatlantadance.com)
└── .github/
    └── workflows/
        └── deploy.yml  ← Auto-deploys to GitHub Pages on push to main
```

## First-time setup

### 1. Create the GitHub repo

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow will fire automatically on your next push

### 3. Point your Squarespace domain to GitHub Pages

In **Squarespace Domains → DNS Settings**, add these records:

| Type  | Host | Value                    |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | YOUR_USERNAME.github.io  |

DNS propagation takes up to 48 hours. GitHub will auto-provision an SSL certificate once it resolves.

> **Note:** The `CNAME` file in this repo already contains `metroatlantadance.com`. Don't delete it — GitHub Pages needs it to map your custom domain.

### 4. Verify

Once deployed, visit `https://metroatlantadance.com` — you should see the new site.

## Adding subpages

Create a new folder and `index.html` for each page, e.g.:

```
/about/index.html
/summer-schedule/index.html
```

GitHub Pages serves `folder/index.html` at `yourdomain.com/folder/` automatically.

## Ongoing development

For simple edits (copy, links, hours), edit directly in this repo on GitHub.com — the action deploys in ~30 seconds.

For heavier iteration (new sections, components), use **Claude Code** (desktop app) which can run a local dev server and push changes directly.
