import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'binary');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function createPng(width, height, drawFn) {
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Bloom Saloon Icon: Dark luxury background (#141218) with gold circle and scissor motif
function drawSalonIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const maxR = w / 2;

  // Maskable icons need 15% safe padding
  const scale = isMaskable ? 0.72 : 0.88;

  // Background: dark obsidian gradient
  let bgR = 20, bgG = 18, bgB = 24, bgA = 255;
  if (!isMaskable && r > maxR - 4) {
    // rounded square corner smooth anti-aliasing
    const distToEdge = Math.max(Math.abs(x - cx), Math.abs(y - cy));
    const cornerR = w * 0.22;
    // Keep solid squircle or circle
    bgA = 255;
  }

  // Outer gold rim circle
  const rimRadius = (w * 0.44) * scale;
  const rimWidth = Math.max(2, w * 0.02);

  if (Math.abs(r - rimRadius) < rimWidth) {
    return [226, 183, 85, 255]; // Gold #E2B755
  }

  // Inner scissors / "B" emblem geometry
  const nx = (x - cx) / (w * scale);
  const ny = (y - cy) / (h * scale);

  // Scissor blades (crossed diagonal lines)
  const isBlade1 = Math.abs(nx - ny * 0.8) < 0.05 && ny < 0.25 && ny > -0.35;
  const isBlade2 = Math.abs(nx + ny * 0.8) < 0.05 && ny < 0.25 && ny > -0.35;
  
  // Scissor finger rings
  const rRing1 = Math.sqrt((nx - 0.16) ** 2 + (ny - 0.26) ** 2);
  const isRing1 = Math.abs(rRing1 - 0.1) < 0.035;

  const rRing2 = Math.sqrt((nx + 0.16) ** 2 + (ny - 0.26) ** 2);
  const isRing2 = Math.abs(rRing2 - 0.1) < 0.035;

  // Center pivot bolt
  const rPivot = Math.sqrt(nx ** 2 + (ny + 0.02) ** 2);
  const isPivot = rPivot < 0.04;

  if (isBlade1 || isBlade2 || isRing1 || isRing2 || isPivot) {
    // Radiant metallic gold gradient
    return [240, 213, 140, 255]; // #F0D58C
  }

  return [bgR, bgG, bgB, bgA];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Generating PWA icons in /public...');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192, (x,y,w,h) => drawSalonIcon(x,y,w,h, false)));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512, (x,y,w,h) => drawSalonIcon(x,y,w,h, false)));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x,y,w,h) => drawSalonIcon(x,y,w,h, true)));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, (x,y,w,h) => drawSalonIcon(x,y,w,h, false)));

// Also create vector icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#141218"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="#E2B755" stroke-width="12"/>
  <g stroke="#F0D58C" stroke-width="18" stroke-linecap="round" fill="none">
    <!-- Scissor blades -->
    <path d="M190 320 L320 150" />
    <path d="M320 320 L190 150" />
    <!-- Finger rings -->
    <circle cx="170" cy="355" r="38" />
    <circle cx="342" cy="355" r="38" />
  </g>
  <circle cx="256" cy="235" r="14" fill="#E2B755"/>
  <text x="256" y="445" font-family="'Cinzel', serif" font-size="34" font-weight="bold" fill="#E2B755" text-anchor="middle" letter-spacing="4">BLOOM SALOON</text>
</svg>`;

fs.writeFileSync(path.join(outDir, 'icon.svg'), svg);
fs.writeFileSync(path.join(outDir, 'favicon.svg'), svg);

console.log('Successfully generated all PWA and Android icon assets!');
