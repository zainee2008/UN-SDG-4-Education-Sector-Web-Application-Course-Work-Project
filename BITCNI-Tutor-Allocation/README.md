# BITCNI Tutor Allocation System

An interactive portfolio edition of a university group project for coordinating tutor support across schools. The system provides separate school and staff portals for requests, tutors, assignments and reporting.

## Live-demo architecture

The original coursework version used a PHP connector and MySQL. This public edition deliberately does **not** publish that connector or any database credentials.

- The interface remains HTML, CSS and JavaScript.
- `sql.js` runs a small SQLite-compatible sample database in the browser.
- Each visitor gets an isolated dataset saved in their own browser.
- Add, edit and delete actions remain interactive.
- “Reset sample data” restores the original demo records.
- No cloud server, paid database or account is required.

This model is intended for portfolio demonstration. It is not a shared production database.

## Features

- School lookup and selection
- Tutor-request creation and editing
- Tutor and subject management
- Request-to-tutor assignment workflow
- Regional, deprivation and status reporting
- Tables, filters, pagination and Chart.js visualisations
- Responsive portfolio landing page

## Technology

HTML5, CSS3, JavaScript, SQL, Chart.js and sql.js/WebAssembly.

## Run locally

The WebAssembly database must be served over HTTP rather than opened by double-clicking the HTML file.

```bash
python3 -m http.server 8000 --directory public/demo
```

Then open `http://localhost:8000`.

## Publish free with GitHub Pages

1. Create a new **public** GitHub repository.
2. Upload or push this project to the repository's `main` branch.
3. Open **Settings → Pages** in GitHub.
4. Under **Build and deployment**, select **GitHub Actions** as the source.
5. The included workflow publishes `public/demo` automatically.

The final URL will normally be:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

Every later push to `main` republishes the site.

## Security note

The PHP file supplied with the coursework accepted arbitrary SQL from the browser and contained database credentials. It must not be committed or deployed publicly. The university database password used in the original file should be changed or revoked before this repository is made public.

## Project attribution

This was created as a university group project. When presenting it on GitHub or a CV, describe your own contribution accurately and credit the collaborative nature of the work.

## Moving to a real shared database later

For a multi-user production version, replace the browser database with a protected API and a managed database such as Supabase. Use authentication, row-level access controls and parameterised operations; never restore a public endpoint that executes SQL received from the browser.
