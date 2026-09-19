import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makePng(width, height, isMaskable = false) {
  const scanlines = [];
  const primaryR = 30, primaryG = 58, primaryB = 138; // #1e3a8a
  const secR = 59, secG = 130, secB = 246; // #3b82f6
  const goldR = 245, goldG = 158, goldB = 11; // #f59e0b

  for (let y = 0; y < height; y++) {
    const row = [0]; // filter byte 0
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const dx = nx - 0.5;
      const dy = ny - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base gradient
      let r = Math.round(primaryR + (secR - primaryR) * (nx * 0.5 + ny * 0.5));
      let g = Math.round(primaryG + (secG - primaryG) * (nx * 0.5 + ny * 0.5));
      let b = Math.round(primaryB + (secB - primaryB) * (nx * 0.5 + ny * 0.5));
      let a = 255;

      // Rounded rect if not maskable
      if (!isMaskable) {
        const cornerDist = Math.max(Math.abs(dx) - 0.38, 0)**2 + Math.max(Math.abs(dy) - 0.38, 0)**2;
        if (cornerDist > 0.014) {
          a = 0;
        }
      }

      // Draw emblem in center (safe zone)
      if (a > 0 && dist < 0.28) {
        if (dist < 0.20 && Math.abs(dx) * 1.5 + Math.abs(dy) < 0.24) {
          // gold cap/center
          r = goldR;
          g = goldG;
          b = goldB;
        } else if (dist > 0.23 && dist < 0.26) {
          // outer crest ring
          r = 255;
          g = 255;
          b = 255;
        }
      }

      row.push(r, g, b, a);
    }
    scanlines.push(Buffer.from(row));
  }

  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), makePng(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), makePng(512, 512));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), makePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), makePng(180, 180));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), makePng(64, 64));
console.log('PNG Icons successfully generated in /public');
