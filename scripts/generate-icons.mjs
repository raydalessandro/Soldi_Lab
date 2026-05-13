// Generates PWA icons from the source logo PNG using sharp.
// Output goes into public/icons/. Run via `pnpm icons:generate`.
//
// Sizes follow PWA best practices: 192 and 512 are mandatory, plus
// maskable variants with safe-area padding so the icon survives the
// shape masking that Android applies on install. apple-touch-icon
// covers iOS Add-to-Home-Screen, favicon covers browsers.

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "prototype/assets/logo.png");
const OUT = path.join(ROOT, "public/icons");
const BRAND_BG = { r: 255, g: 255, b: 255, alpha: 1 };

const STANDARD_SIZES = [192, 256, 384, 512];
const MASKABLE_SIZES = [192, 512];
const APPLE_SIZE = 180;
const FAVICON_SIZES = [16, 32, 48];

await fs.mkdir(OUT, { recursive: true });

const source = sharp(SRC).removeAlpha().flatten({ background: BRAND_BG });
const meta = await sharp(SRC).metadata();
console.log(`source logo ${meta.width}x${meta.height}`);

for (const size of STANDARD_SIZES) {
  const out = path.join(OUT, `icon-${size}.png`);
  await source
    .clone()
    .resize(size, size, { fit: "contain", background: BRAND_BG })
    .png()
    .toFile(out);
  console.log(`wrote ${path.relative(ROOT, out)}`);
}

// Maskable: shrink the visible logo into the inner 80% (safe-area) so
// Android can mask the outer 20% without clipping the artwork.
for (const size of MASKABLE_SIZES) {
  const inner = Math.round(size * 0.8);
  const padding = Math.round((size - inner) / 2);
  const out = path.join(OUT, `icon-maskable-${size}.png`);
  const innerBuffer = await source
    .clone()
    .resize(inner, inner, { fit: "contain", background: BRAND_BG })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: innerBuffer, top: padding, left: padding }])
    .png()
    .toFile(out);
  console.log(`wrote ${path.relative(ROOT, out)}`);
}

await source
  .clone()
  .resize(APPLE_SIZE, APPLE_SIZE, { fit: "contain", background: BRAND_BG })
  .png()
  .toFile(path.join(OUT, "apple-touch-icon.png"));
console.log(`wrote public/icons/apple-touch-icon.png`);

for (const size of FAVICON_SIZES) {
  await source
    .clone()
    .resize(size, size, { fit: "contain", background: BRAND_BG })
    .png()
    .toFile(path.join(OUT, `favicon-${size}.png`));
}
console.log(`wrote favicon-{16,32,48}.png`);

// Single favicon.ico (32x32) at /public for browsers that look there.
await source
  .clone()
  .resize(32, 32, { fit: "contain", background: BRAND_BG })
  .png()
  .toFile(path.join(ROOT, "public", "favicon.png"));
console.log(`wrote public/favicon.png`);
