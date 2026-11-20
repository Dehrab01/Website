# Ali Dehrab — Portfolio

Personal portfolio for **Ali Dehrab (Coach Dehrab)** — calisthenics coach, hybrid athlete and brand marketer based in Kuwait.

A static website: plain HTML, CSS and JavaScript. No build step, no backend, no cost.

## Publish on GitHub Pages (free)

1. Create a new repository on GitHub, click **Add file → Upload files**, and **drag** everything inside this folder (the `assets`, `css` and `js` folders plus the files) onto the page. Dragging keeps the folders; the "choose your files" button does not.
2. In the repository go to **Settings → Pages**.
3. Under **Source** choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

Tip: name the repository `<your-username>.github.io` and the site lives at `https://<your-username>.github.io/` directly.

## Run locally

Double-click `index.html`, or serve the folder:

```bash
python -m http.server 5173
```

Then open http://localhost:5173

## Edit the content

Almost everything is data-driven. Open `js/data.js` to change:

- `story` — the horizontal timeline
- `skills` — the calisthenics skills list
- `work` — roles (the first entry is shown in the red "Now" card in `index.html`)
- `gallery` — the poster wall
- `certs` — certificates and courses

Photos live in `assets/img` as optimized `.webp` files.

## Structure

```
index.html          page markup
css/style.css       all styling
js/data.js          content
js/main.js          rendering + animation
assets/img          optimized images
assets/vendor       GSAP, ScrollTrigger, Lenis (bundled, works offline)
assets/favicon.svg  browser tab icon
.nojekyll           tells GitHub Pages to serve files as-is
```
