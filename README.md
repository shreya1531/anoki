# Anokhi Diamond Atelier — revised website

Open index.html in a modern browser. Keep every HTML, CSS, JS file and the assets folder together. No installation or framework is needed.

The home page comes from the first supplied ZIP. Rose, Mayura and Temple use the second ZIP’s visual assets and inspiration-to-jewellery reveals. Each story has the matching jewellery image and information immediately after its reveal. Every header and footer uses the original image logo and home-page design.

Google Fonts, Instagram and WhatsApp links require internet access. The enquiry form prepares a WhatsApp message for you to review and send; it does not store submissions.

All imagery and collection descriptions are illustrative, as in the supplied websites; specifications and pricing are confirmed with the atelier.


## Latest revision
- Base: first ZIP. Mayura page rebuilt from the second ZIP (its copy, details section and closing call-to-action) with a new 7-chapter scroll reveal (sketch → gold necklace).
- Temple hero banner replaced with assets/temple-hero.jpg.
- story-polish.css / story-polish.js: hero framing, text legibility, caption/title/closing-line timing (never shown together), responsive jewel placement, header-aware sticky stage.

## Sea reveal and scoped visual revision
- Open `index.html` to begin. All supplied assets are included locally in `assets/`.
- The See collection opens `see.html`: moving waves recede with scroll to reveal an ocean-inspired jewellery suite on velvet. Motion adapts to reduced-motion preferences.
- Selection categories keep the existing carousel and five-image gallery interaction, with matching velvet-backed jewellery photography and detail crops.
- Added editorial jewellery and craft details to the belief, code, process, diamond origins, trust, founder, FAQ and footer sections.
- The original hero banner, Journey 3, existing story pages, business policies and enquiry behaviour remain unchanged.
- New jewellery visuals and the See description are illustrative editorial concepts, not actual inventory or approved product photography.
- The supplied Full Moon card still points to `fullmoon.html`, which was not included in the original archive; this unrequested page has not been invented.

## Revision: smoothness, Moonlight, simple cards
- All scroll reveals (Rose, Temple, Mayura, See, Moonlight) now glide with frame-rate independent easing (`reveal-smooth.js`), so they feel the same on 60/120/144 Hz screens. Temple previously snapped straight to the scrollbar; it now eases like the others. The reveal designs themselves are unchanged.
- Moonlight to Majesty (`moonlight.html`) added from the supplied moonlight file, fitted into the Anokhi header/footer. The Full Moon card in Collections opens it; Temple's "Next" link continues to Moonlight, then See.
- Collections are plain image cards with text on top (no motion). The selection category page shows five equal, plain cards.
- Home hero is 10px taller at every breakpoint.

## Revision: popup form, See colours, Moonlight fit
- "Make Your Anokhi" / "Tell Us Your Story" (and every other enquiry button, including those on the story pages) now open the Journey 3 form as a popup. Close with the X, a click outside, or Esc.
- See page details use the same ivory look as the other story pages.
- Moonlight: pearl necklace and earrings now sit fully inside the stage on any screen shape; the Full Moon card on the home page shows the moon photo.
- Home hero is another 10px taller.

## Revision: line-by-line reveal, category pages, process section
- The Anokhi Belief and The Anokhi Code sections now reveal one line / one tile at a time, slowly, as you scroll (`line-reveal.css/js`).
- Category pages: each of the 5 pages has 5 different relevant pieces (3 cards per row). Hovering a card shows the same piece from a closer, different angle. The illustrative note and the "Ask Anokhi" / "Make Your Anokhi" buttons are removed from these pages.
- "Crafted for you, step by step": the photo row is removed.

## Revision: designs on the category pages
- Each selection category page now shows the five designs from the supplied design sheet (names, e.g. "Solitaire Charm", "Emerald Floral Choker"), three per row, with the name and a "From ₹…" price beneath each card. Hovering a card shows a closer, tilted view of the same design.
- The prices in `categoryGalleries` (inside index.html, field `price`) are placeholders. Replace them with the figures from the master pricing workbook before launch.

## Revision: sharper, zoomed-out design images
- The 25 category designs were upscaled 4x with an AI super-resolution model (EDSR) and reframed so the whole piece is visible with space around it (previously cropped tight). Hover still shows a closer, tilted view.
