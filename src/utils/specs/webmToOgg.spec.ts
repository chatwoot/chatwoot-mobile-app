import fs from 'fs';
import path from 'path';

import { opusPacketSamples, webmToOgg, WebmError } from '@/utils/webmToOgg';

const fixture = new Uint8Array(fs.readFileSync(path.join(__dirname, 'fixtures/opus-mono.webm')));

type Page = {
  headerType: number;
  granule: number;
  sequence: number;
  crc: number;
  packets: Uint8Array[];
  bytes: Uint8Array;
};

// Splits an Ogg stream into pages, joining segments back into packets.
const readPages = (ogg: Uint8Array): Page[] => {
  const pages: Page[] = [];
  let offset = 0;
  while (offset < ogg.length) {
    const view = new DataView(ogg.buffer, ogg.byteOffset + offset);
    expect(String.fromCharCode(...ogg.subarray(offset, offset + 4))).toBe('OggS');
    const segmentCount = ogg[offset + 26];
    const segments = Array.from(ogg.subarray(offset + 27, offset + 27 + segmentCount));
    let cursor = offset + 27 + segmentCount;
    const packets: Uint8Array[] = [];
    let current: number[] = [];
    for (const segment of segments) {
      current.push(...ogg.subarray(cursor, cursor + segment));
      cursor += segment;
      if (segment < 255) {
        packets.push(Uint8Array.from(current));
        current = [];
      }
    }
    pages.push({
      headerType: ogg[offset + 5],
      granule: view.getUint32(6, true) + view.getUint32(10, true) * 0x100000000,
      sequence: view.getUint32(18, true),
      crc: view.getUint32(22, true),
      packets,
      bytes: ogg.subarray(offset, cursor),
    });
    offset = cursor;
  }
  return pages;
};

const OGG_CRC_TABLE = Array.from({ length: 256 }, (_, i) => {
  let r = i << 24;
  for (let j = 0; j < 8; j += 1) {
    r = r & 0x80000000 ? ((r << 1) ^ 0x04c11db7) >>> 0 : (r << 1) >>> 0;
  }
  return r >>> 0;
});

const crcOf = (page: Uint8Array) => {
  const copy = Uint8Array.from(page);
  copy.fill(0, 22, 26);
  let crc = 0;
  for (const byte of copy) {
    crc = ((crc << 8) ^ OGG_CRC_TABLE[((crc >>> 24) ^ byte) & 0xff]) >>> 0;
  }
  return crc;
};

describe('webmToOgg', () => {
  const ogg = webmToOgg(fixture);
  const pages = readPages(ogg);

  it('starts with a beginning-of-stream page carrying the OpusHead from the file', () => {
    expect(pages[0].headerType & 0x02).toBe(0x02);
    expect(pages[0].granule).toBe(0);
    expect(pages[0].packets).toHaveLength(1);
    const head = pages[0].packets[0];
    expect(String.fromCharCode(...head.subarray(0, 8))).toBe('OpusHead');
    expect(head[9]).toBe(1); // channels
    // The header is the file's own CodecPrivate, carried through unchanged.
    const marker = Array.from('OpusHead', char => char.charCodeAt(0));
    const at = fixture.findIndex((_, i) => marker.every((byte, j) => fixture[i + j] === byte));
    expect(at).toBeGreaterThan(0);
    expect(head).toEqual(fixture.subarray(at, at + head.length));
  });

  it('follows with an OpusTags page', () => {
    expect(String.fromCharCode(...pages[1].packets[0].subarray(0, 8))).toBe('OpusTags');
    expect(pages[1].granule).toBe(0);
  });

  it('numbers pages sequentially and marks only the last one end-of-stream', () => {
    pages.forEach((page, index) => expect(page.sequence).toBe(index));
    expect(pages.slice(0, -1).every(page => (page.headerType & 0x04) === 0)).toBe(true);
    expect(pages[pages.length - 1].headerType & 0x04).toBe(0x04);
  });

  it('writes a valid CRC on every page', () => {
    pages.forEach(page => expect(page.crc).toBe(crcOf(page.bytes)));
  });

  it('carries every audio packet with a granule position that tracks decoded samples', () => {
    const audioPages = pages.slice(2);
    const packets = audioPages.flatMap(page => page.packets);
    // 3.9 s of 20 ms frames.
    expect(packets.length).toBeGreaterThan(180);
    expect(packets.every(packet => opusPacketSamples(packet) === 960)).toBe(true);

    let expected = 0;
    audioPages.forEach(page => {
      expected += page.packets.reduce((sum, packet) => sum + opusPacketSamples(packet), 0);
      expect(page.granule).toBe(expected);
    });
    expect(expected / 48000).toBeCloseTo(3.9, 1);
  });

  it('accepts an ArrayBuffer input', () => {
    const buffer = fixture.buffer.slice(
      fixture.byteOffset,
      fixture.byteOffset + fixture.byteLength,
    ) as ArrayBuffer;
    expect(webmToOgg(buffer)).toEqual(ogg);
  });

  it('rejects files that are not EBML', () => {
    expect(() => webmToOgg(new Uint8Array([0x4f, 0x67, 0x67, 0x53, 0, 0, 0, 0]))).toThrow(
      WebmError,
    );
  });

  it('rejects a WebM without an Opus track', () => {
    const noOpus = Uint8Array.from(fixture);
    const marker = Array.from('A_OPUS', char => char.charCodeAt(0));
    const at = noOpus.findIndex((_, i) => marker.every((byte, j) => noOpus[i + j] === byte));
    noOpus.set(
      Array.from('A_VORB', char => char.charCodeAt(0)),
      at,
    );
    expect(() => webmToOgg(noOpus)).toThrow('No Opus audio track found');
  });
});

describe('opusPacketSamples', () => {
  const packet = (toc: number, second = 0) => new Uint8Array([toc, second]);

  it('reads SILK, hybrid and CELT frame sizes from the TOC byte', () => {
    expect(opusPacketSamples(packet(0b00000_000))).toBe(480); // SILK NB 10 ms
    expect(opusPacketSamples(packet(0b00001_000))).toBe(960); // SILK NB 20 ms
    expect(opusPacketSamples(packet(0b00011_000))).toBe(2880); // SILK NB 60 ms
    expect(opusPacketSamples(packet(0b01100_000))).toBe(480); // hybrid 10 ms
    expect(opusPacketSamples(packet(0b10000_000))).toBe(120); // CELT 2.5 ms
    expect(opusPacketSamples(packet(0b10011_000))).toBe(960); // CELT 20 ms
  });

  it('multiplies by the frame count code', () => {
    expect(opusPacketSamples(packet(0b00001_001))).toBe(1920);
    expect(opusPacketSamples(packet(0b00001_010))).toBe(1920);
    expect(opusPacketSamples(packet(0b00001_011, 3))).toBe(2880);
    expect(opusPacketSamples(new Uint8Array())).toBe(0);
  });
});
