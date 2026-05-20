// Pure Node.js PNG resize — no external deps
// Reads icon-512.png, outputs icon-192.png using bilinear sampling

import fs from 'fs';
import zlib from 'zlib';

const INPUT  = './public/icon-512.png';
const OUTPUT = './public/icon-192.png';
const OUT_W  = 192;
const OUT_H  = 192;

/* ---------- minimal PNG parser ---------- */
function parsePNG(buf) {
  let pos = 8; // skip signature
  let width, height, bitDepth, colorType, idat = [];
  while (pos < buf.length) {
    const len  = buf.readUInt32BE(pos); pos += 4;
    const type = buf.toString('ascii', pos, pos + 4); pos += 4;
    const data = buf.slice(pos, pos + len); pos += len;
    pos += 4; // CRC
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    }
  }
  const raw    = zlib.inflateSync(Buffer.concat(idat));
  const bpp    = colorType === 2 ? 3 : 4; // RGB or RGBA
  const stride = width * bpp + 1;
  // reconstruct filtered rows
  const pixels = Buffer.alloc(width * height * 4);
  let prevRow  = Buffer.alloc(stride - 1);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * stride];
    const row    = raw.slice(y * stride + 1, (y + 1) * stride);
    const recon  = Buffer.alloc(row.length);
    for (let i = 0; i < row.length; i++) {
      const a = i >= bpp ? recon[i - bpp] : 0;
      const b = prevRow[i];
      const c = i >= bpp ? prevRow[i - bpp] : 0;
      let v = row[i];
      if      (filter === 1) v = (v + a) & 0xff;
      else if (filter === 2) v = (v + b) & 0xff;
      else if (filter === 3) v = (v + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v = (v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
      recon[i] = v;
    }
    for (let x = 0; x < width; x++) {
      const base = y * width * 4 + x * 4;
      pixels[base]     = recon[x * bpp];
      pixels[base + 1] = recon[x * bpp + 1];
      pixels[base + 2] = recon[x * bpp + 2];
      pixels[base + 3] = bpp === 4 ? recon[x * bpp + 3] : 255;
    }
    prevRow = recon;
  }
  return { width, height, pixels };
}

/* ---------- bilinear resize ---------- */
function resize(src, sw, sh, dw, dh) {
  const dst = Buffer.alloc(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const gx = (x + 0.5) * (sw / dw) - 0.5;
      const gy = (y + 0.5) * (sh / dh) - 0.5;
      const x0 = Math.max(0, Math.floor(gx));
      const y0 = Math.max(0, Math.floor(gy));
      const x1 = Math.min(sw - 1, x0 + 1);
      const y1 = Math.min(sh - 1, y0 + 1);
      const fx = gx - x0, fy = gy - y0;
      for (let c = 0; c < 4; c++) {
        const tl = src[(y0 * sw + x0) * 4 + c];
        const tr = src[(y0 * sw + x1) * 4 + c];
        const bl = src[(y1 * sw + x0) * 4 + c];
        const br = src[(y1 * sw + x1) * 4 + c];
        dst[(y * dw + x) * 4 + c] = Math.round(
          tl * (1-fx)*(1-fy) + tr * fx*(1-fy) + bl * (1-fx)*fy + br * fx*fy
        );
      }
    }
  }
  return dst;
}

/* ---------- minimal PNG writer ---------- */
function writePNG(pixels, w, h) {
  const chunks = [];
  // Signature
  chunks.push(Buffer.from([137,80,78,71,13,10,26,10]));

  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const t   = Buffer.from(type);
    const crc = crc32(Buffer.concat([t, data]));
    const c   = Buffer.alloc(4); c.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, t, data, c]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  chunks.push(chunk('IHDR', ihdr));

  // IDAT — filter type 0 (None) for every row
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    pixels.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  chunks.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9 })));
  chunks.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(chunks);
}

// CRC-32 table
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ---------- main ---------- */
const src  = parsePNG(fs.readFileSync(INPUT));
const pix  = resize(src.pixels, src.width, src.height, OUT_W, OUT_H);
const png  = writePNG(pix, OUT_W, OUT_H);
fs.writeFileSync(OUTPUT, png);
console.log(`✅ Written ${OUTPUT} (${png.length} bytes)`);
