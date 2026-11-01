# ALINVEST Website — Quality and Maintenance

## Project principles
- Static-first institutional and commercial website.
- Portuguese (Mozambique) content and ALINVEST brand system.
- Presentation layer remains independent from the content provider.
- WordPress is an optional adapter, not a mandatory runtime dependency.
- Never publish accreditation, certification, client, project or performance claims unless verified and approved.

## Content provider contract
The presentation layer consumes the structured model exposed as `window.SERVICE_CONTENT`:
- `provider`
- `areas`
- `programas`
- `apoio`
- `noticias`

A future CMS adapter must return this same schema (or an explicitly versioned successor), validate and normalize remote data, preserve built-in fallback content, and never inject unsanitized HTML. The current WordPress adapter is optional and must remain disabled until a real endpoint and editorial workflow are configured. A provider change must not require changes to page templates.

## Publishing checklist
1. Confirm the target Vercel project and custom domain.
2. Confirm production environment variables for the contact email service without exposing their values.
3. Run `node scripts/check-site.mjs`.
4. Test homepage, all detail slugs, article slugs, privacy policy, mobile navigation, slideshow controls, and contact form.
5. Verify email delivery end-to-end before enabling the success message in production.
6. Inspect the production URL and compare it with the approved commit.

## Quality gates
- Keep semantic landmarks and a single primary H1 per rendered page.
- All interactive controls must be keyboard accessible and labelled.
- Respect `prefers-reduced-motion`.
- Keep canonical URLs, Open Graph metadata, robots.txt and sitemap.xml in sync.
- Use responsive, compressed images with documented licensing.
- Do not expose secrets in source, client-side code, logs or commits.

## Infrastructure note
Two Vercel projects are connected to the same GitHub repository (`website`, `website-1gtk`). Confirm which project owns the production domain before changing project settings, deleting either project, changing DNS, or promoting a deployment.
