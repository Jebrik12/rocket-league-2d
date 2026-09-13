/**
 * Lightweight, zero-dependency GIF89a animated GIF encoder
 * Supports 256-color quantization, LZW compression, looping, and variable framerate.
 */

// Simple & fast Octree / Popularity Color Quantizer
class ColorQuantizer {
  private palette: [number, number, number][] = [];
  private colorMap: Map<number, number> = new Map();

  constructor(pixels: Uint8ClampedArray, maxColors: number = 256) {
    this.buildPalette(pixels, maxColors);
  }

  private buildPalette(pixels: Uint8ClampedArray, maxColors: number) {
    // Sample colors to find dominant palette
    const colorCounts = new Map<number, number>();
    const len = pixels.length;
    // Sample every 4th pixel for speed on larger frames
    const step = len > 640 * 360 * 4 ? 8 : 4;

    for (let i = 0; i < len; i += step * 4) {
      const a = pixels[i + 3];
      if (a < 128) continue;
      // 5-bit quantization for bucket counting
      const r = (pixels[i] >> 3) << 3;
      const g = (pixels[i + 1] >> 3) << 3;
      const b = (pixels[i + 2] >> 3) << 3;
      const key = (r << 16) | (g << 8) | b;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }

    // Sort by popularity
    const sorted = Array.from(colorCounts.entries()).sort((a, b) => b[1] - a[1]);
    const numColors = Math.min(maxColors, Math.max(16, sorted.length));

    for (let i = 0; i < numColors; i++) {
      if (i < sorted.length) {
        const key = sorted[i][0];
        const r = (key >> 16) & 0xff;
        const g = (key >> 8) & 0xff;
        const b = key & 0xff;
        this.palette.push([r, g, b]);
      } else {
        this.palette.push([0, 0, 0]);
      }
    }

    // Pad to power of 2
    while (this.palette.length < 256) {
      this.palette.push([0, 0, 0]);
    }
  }

  public getPalette(): [number, number, number][] {
    return this.palette;
  }

  public lookup(r: number, g: number, b: number): number {
    // Quantize key
    const qr = r >> 3;
    const qg = g >> 3;
    const qb = b >> 3;
    const key = (qr << 10) | (qg << 5) | qb;

    if (this.colorMap.has(key)) {
      return this.colorMap.get(key)!;
    }

    // Find closest match in palette (Euclidean distance in RGB space)
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < 256; i++) {
      const [pr, pg, pb] = this.palette[i];
      const dr = r - pr;
      const dg = g - pg;
      const db = b - pb;
      // Weighted color difference for human eye sensitivity
      const dist = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
        if (dist === 0) break;
      }
    }

    this.colorMap.set(key, bestIdx);
    return bestIdx;
  }
}

// LZW Stream Encoder for GIF image data
class LZWEncoder {
  private width: number;
  private height: number;
  private pixels: Uint8Array;
  private initCodeSize: number;

  private accum = new Uint8Array(256);
  private aCount = 0;
  private curAccum = 0;
  private curBits = 0;

  private htab = new Int32Array(5003);
  private codetab = new Int32Array(5003);
  private hsize = 5003;
  private freeEnt = 0;
  private clearFlag = false;
  private gInitBits = 0;
  private nBits = 0;
  private maxcode = 0;
  private clearCode = 0;
  private eofCode = 0;

  constructor(width: number, height: number, pixels: Uint8Array, colorDepth: number = 8) {
    this.width = width;
    this.height = height;
    this.pixels = pixels;
    this.initCodeSize = Math.max(2, colorDepth);
  }

  private charOut(c: number, outs: number[]) {
    this.accum[this.aCount++] = c;
    if (this.aCount >= 254) {
      this.flushChar(outs);
    }
  }

  private flushChar(outs: number[]) {
    if (this.aCount > 0) {
      outs.push(this.aCount);
      for (let i = 0; i < this.aCount; i++) {
        outs.push(this.accum[i]);
      }
      this.aCount = 0;
    }
  }

  private output(code: number, outs: number[]) {
    this.curAccum |= code << this.curBits;
    this.curBits += this.nBits;

    while (this.curBits >= 8) {
      this.charOut(this.curAccum & 0xff, outs);
      this.curAccum >>= 8;
      this.curBits -= 8;
    }

    if (this.freeEnt > this.maxcode || this.clearFlag) {
      if (this.clearFlag) {
        this.maxcode = (1 << (this.nBits = this.gInitBits)) - 1;
        this.clearFlag = false;
      } else {
        this.nBits++;
        if (this.nBits === 12) {
          this.maxcode = 1 << 12;
        } else {
          this.maxcode = (1 << this.nBits) - 1;
        }
      }
    }

    if (code === this.eofCode) {
      while (this.curBits > 0) {
        this.charOut(this.curAccum & 0xff, outs);
        this.curAccum >>= 8;
        this.curBits -= 8;
      }
      this.flushChar(outs);
    }
  }

  private clearTable(outs: number[]) {
    for (let i = 0; i < this.hsize; ++i) {
      this.htab[i] = -1;
    }
    this.freeEnt = this.clearCode + 2;
    this.clearFlag = true;
    this.output(this.clearCode, outs);
  }

  public encode(outs: number[]) {
    outs.push(this.initCodeSize);

    this.gInitBits = this.initCodeSize + 1;
    this.nBits = this.gInitBits;
    this.maxcode = (1 << this.nBits) - 1;
    this.clearCode = 1 << this.initCodeSize;
    this.eofCode = this.clearCode + 1;
    this.freeEnt = this.clearCode + 2;
    this.aCount = 0;
    this.curAccum = 0;
    this.curBits = 0;

    let ent = this.pixels[0];
    let hshift = 0;
    let fcode: number;
    for (fcode = this.hsize; fcode < 65536; fcode *= 2) {
      ++hshift;
    }
    hshift = 8 - hshift;
    const hsizeReg = this.hsize;
    this.clearTable(outs);

    const len = this.width * this.height;
    for (let i = 1; i < len; ++i) {
      const c = this.pixels[i];
      fcode = (c << 12) + ent;
      let idx = (c << hshift) ^ ent;

      if (this.htab[idx] === fcode) {
        ent = this.codetab[idx];
        continue;
      } else if (this.htab[idx] >= 0) {
        let disp = hsizeReg - idx;
        if (idx === 0) disp = 1;
        let hit = false;
        do {
          idx -= disp;
          if (idx < 0) idx += hsizeReg;
          if (this.htab[idx] === fcode) {
            ent = this.codetab[idx];
            hit = true;
            break;
          }
        } while (this.htab[idx] >= 0);
        if (hit) continue;
      }

      this.output(ent, outs);
      ent = c;
      if (this.freeEnt < 1 << 12) {
        this.codetab[idx] = this.freeEnt++;
        this.htab[idx] = fcode;
      } else {
        this.clearTable(outs);
      }
    }

    this.output(ent, outs);
    this.output(this.eofCode, outs);
    outs.push(0); // Block terminator
  }
}

export interface GifFrame {
  imageData: ImageData;
  delayMs: number; // e.g. 50ms for 20fps
}

export class GifEncoder {
  private width: number;
  private height: number;
  private frames: GifFrame[] = [];
  private loopCount: number = 0; // 0 = infinite loop

  constructor(width: number, height: number, loopCount: number = 0) {
    this.width = width;
    this.height = height;
    this.loopCount = loopCount;
  }

  public addFrame(imageData: ImageData, delayMs: number = 50) {
    this.frames.push({ imageData, delayMs });
  }

  public build(onProgress?: (pct: number) => void): Blob {
    const bytes: number[] = [];

    // 1. Header: GIF89a
    const header = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // 'GIF89a'
    for (const b of header) bytes.push(b);

    // 2. Logical Screen Descriptor
    bytes.push(this.width & 0xff, (this.width >> 8) & 0xff);
    bytes.push(this.height & 0xff, (this.height >> 8) & 0xff);
    // GCT Flag: 0 (we use Local Color Table per frame for superior quality)
    bytes.push(0x70, 0x00, 0x00);

    // 3. Netscape 2.0 Application Extension (Looping)
    if (this.loopCount >= 0) {
      bytes.push(0x21, 0xff, 0x0b); // Extension intro + Block size (11)
      const appName = [0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30]; // 'NETSCAPE2.0'
      for (const b of appName) bytes.push(b);
      bytes.push(0x03, 0x01); // Sub-block size + loop sub-block ID
      bytes.push(this.loopCount & 0xff, (this.loopCount >> 8) & 0xff);
      bytes.push(0x00); // Sub-block terminator
    }

    const totalFrames = this.frames.length;

    // 4. Encode Each Frame
    for (let f = 0; f < totalFrames; f++) {
      const frame = this.frames[f];
      const { imageData, delayMs } = frame;
      const pixels = imageData.data;

      // Color quantization
      const quantizer = new ColorQuantizer(pixels, 256);
      const palette = quantizer.getPalette();

      // Indexed pixel buffer
      const indexedPixels = new Uint8Array(this.width * this.height);
      let pIdx = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        indexedPixels[pIdx++] = quantizer.lookup(pixels[i], pixels[i + 1], pixels[i + 2]);
      }

      // Graphic Control Extension
      bytes.push(0x21, 0xf9, 0x04); // Extension intro + GCE label + byte count
      bytes.push(0x04); // Disposal method 1 (do not dispose, leave in place)
      const delayUnits = Math.max(2, Math.round(delayMs / 10)); // hundredths of a second
      bytes.push(delayUnits & 0xff, (delayUnits >> 8) & 0xff);
      bytes.push(0x00); // Transparent color index (none)
      bytes.push(0x00); // Block terminator

      // Image Descriptor
      bytes.push(0x2c); // Image separator
      bytes.push(0, 0, 0, 0); // Image Left, Top (0, 0)
      bytes.push(this.width & 0xff, (this.width >> 8) & 0xff);
      bytes.push(this.height & 0xff, (this.height >> 8) & 0xff);
      // Local Color Table Flag: 1, Interlace: 0, Sort: 0, Size: 7 (256 colors) -> 0x87
      bytes.push(0x87);

      // Local Color Table (768 bytes)
      for (let c = 0; c < 256; c++) {
        const [r, g, b] = palette[c];
        bytes.push(r, g, b);
      }

      // LZW Image Data
      const lzw = new LZWEncoder(this.width, this.height, indexedPixels, 8);
      lzw.encode(bytes);

      if (onProgress) {
        onProgress(Math.round(((f + 1) / totalFrames) * 100));
      }
    }

    // 5. GIF Trailer
    bytes.push(0x3b);

    return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
  }
}
