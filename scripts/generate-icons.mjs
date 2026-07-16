/**
 * Generates the PWA icon set from a hand-authored flower SVG.
 * Outputs are committed to public/ so builds never depend on this script.
 * Run: pnpm generate:icons
 */
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

// Five dusty-rose petals, marigold heart, ink outlines — matches the
// pressed-flower journal style of the in-app art.
const flower = `
  <g stroke="#3E322B" stroke-width="2.5" stroke-linejoin="round">
    <path d="M50 74 Q48 84 49 92" fill="none" stroke-width="3" stroke-linecap="round"/>
    <path d="M49 84 Q38 82 34 73 Q46 72 50 82 Z" fill="#6B8F5E"/>
    <ellipse cx="50" cy="30" rx="11" ry="15" fill="#C4698F" transform="rotate(-4 50 30)"/>
    <ellipse cx="69" cy="43" rx="11" ry="15" fill="#C4698F" transform="rotate(66 69 43)"/>
    <ellipse cx="62" cy="65" rx="11" ry="15" fill="#C4698F" transform="rotate(140 62 65)"/>
    <ellipse cx="38" cy="66" rx="11" ry="15" fill="#C4698F" transform="rotate(-146 38 66)"/>
    <ellipse cx="31" cy="44" rx="11" ry="15" fill="#C4698F" transform="rotate(-70 31 44)"/>
    <circle cx="50" cy="49" r="12" fill="#E0A83C"/>
    <circle cx="47" cy="46" r="2" fill="#3E322B" stroke="none"/>
    <circle cx="54" cy="50" r="2" fill="#3E322B" stroke="none"/>
    <circle cx="49" cy="54" r="2" fill="#3E322B" stroke="none"/>
  </g>
`;

/** Full-bleed parchment tile with the flower scaled about its center. */
function tile(scale) {
  const t = `translate(${50 * (1 - scale)} ${50 * (1 - scale)}) scale(${scale})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#FAF6EC"/>
    <g transform="${t}">${flower}</g>
  </svg>`;
}

const outputs = [
  { file: "public/icons/icon-192.png", size: 192, scale: 0.86 },
  { file: "public/icons/icon-512.png", size: 512, scale: 0.86 },
  // maskable: art inside the 80% safe zone so circular masks don't clip it
  { file: "public/icons/icon-maskable-192.png", size: 192, scale: 0.66 },
  { file: "public/icons/icon-maskable-512.png", size: 512, scale: 0.66 },
  { file: "public/apple-touch-icon.png", size: 180, scale: 0.86 },
];

await mkdir("public/icons", { recursive: true });

for (const { file, size, scale } of outputs) {
  await sharp(Buffer.from(tile(scale))).resize(size, size).png().toFile(file);
  console.log(`✓ ${file}`);
}

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${flower}</svg>`;
await writeFile("public/favicon.svg", favicon);
console.log("✓ public/favicon.svg");
