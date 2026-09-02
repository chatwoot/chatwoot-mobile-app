/**
 * Re-wraps the Opus packets of a WebM (Matroska) file into an Ogg container
 * without touching the audio data. Browser MediaRecorder output is WebM/Opus,
 * which iOS cannot open, while Ogg/Opus can be decoded on device.
 *
 * Only what MediaRecorder produces is handled: a single Opus audio track,
 * SimpleBlock or BlockGroup frames without lacing, and a segment or cluster
 * whose size may be unknown.
 */

const EBML_HEADER = 0x1a45dfa3;
const SEGMENT = 0x18538067;
const TRACKS = 0x1654ae6b;
const TRACK_ENTRY = 0xae;
const TRACK_NUMBER = 0xd7;
const CODEC_ID = 0x86;
const CODEC_PRIVATE = 0x63a2;
const AUDIO = 0xe1;
const CHANNELS = 0x9f;
const CLUSTER = 0x1f43b675;
const BLOCK_GROUP = 0xa0;
const BLOCK = 0xa1;
const SIMPLE_BLOCK = 0xa3;

// Elements whose children are parsed in place. Everything else is skipped by
// its declared size, so their size never needs to be known.
const MASTER_ELEMENTS = new Set([
  EBML_HEADER,
  SEGMENT,
  TRACKS,
  TRACK_ENTRY,
  AUDIO,
  CLUSTER,
  BLOCK_GROUP,
]);

const OPUS_CODEC_ID = 'A_OPUS';
const OPUS_SAMPLE_RATE = 48000;
const OGG_SERIAL = 0x43570a1d;
const MAX_PACKETS_PER_PAGE = 50;

const OGG_CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let r = i << 24;
    for (let j = 0; j < 8; j += 1) {
      r = r & 0x80000000 ? ((r << 1) ^ 0x04c11db7) >>> 0 : (r << 1) >>> 0;
    }
    table[i] = r >>> 0;
  }
  return table;
})();

const oggCrc32 = (bytes: Uint8Array): number => {
  let crc = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = ((crc << 8) ^ OGG_CRC_TABLE[((crc >>> 24) ^ bytes[i]) & 0xff]) >>> 0;
  }
  return crc;
};

export class WebmError extends Error {}

type Vint = { value: number; length: number; unknown: boolean };

const readVint = (bytes: Uint8Array, offset: number, keepMarker: boolean): Vint => {
  if (offset >= bytes.length) {
    throw new WebmError('Unexpected end of file');
  }
  const first = bytes[offset];
  let length = 1;
  let mask = 0x80;
  while (length <= 8 && !(first & mask)) {
    length += 1;
    mask >>= 1;
  }
  if (length > 8 || offset + length > bytes.length) {
    throw new WebmError('Invalid EBML variable-length integer');
  }
  let value = keepMarker ? first : first & (mask - 1);
  let allOnes = (first & (mask - 1)) === mask - 1;
  for (let i = 1; i < length; i += 1) {
    const byte = bytes[offset + i];
    value = value * 256 + byte;
    allOnes = allOnes && byte === 0xff;
  }
  return { value, length, unknown: !keepMarker && allOnes };
};

type OpusTrack = {
  number: number;
  channels: number;
  codecPrivate: Uint8Array | null;
};

type ParsedWebm = {
  track: OpusTrack;
  packets: Uint8Array[];
};

const parseBlock = (
  bytes: Uint8Array,
  start: number,
  size: number,
  track: OpusTrack | null,
  packets: Uint8Array[],
) => {
  const trackNumber = readVint(bytes, start, false);
  if (!track || trackNumber.value !== track.number) {
    return;
  }
  const flags = bytes[start + trackNumber.length + 2];
  if (flags & 0x06) {
    throw new WebmError('Laced blocks are not supported');
  }
  const dataStart = start + trackNumber.length + 3;
  packets.push(bytes.subarray(dataStart, start + size));
};

const parseWebm = (bytes: Uint8Array): ParsedWebm => {
  if (readVint(bytes, 0, true).value !== EBML_HEADER) {
    throw new WebmError('Not an EBML file');
  }

  const packets: Uint8Array[] = [];
  let opusTrack: OpusTrack | null = null;
  let currentTrack: {
    number: number;
    codecId: string;
    channels: number;
    codecPrivate: Uint8Array | null;
  } | null = null;

  const finishTrack = () => {
    if (currentTrack && currentTrack.codecId === OPUS_CODEC_ID && !opusTrack) {
      opusTrack = {
        number: currentTrack.number,
        channels: currentTrack.channels,
        codecPrivate: currentTrack.codecPrivate,
      };
    }
    currentTrack = null;
  };

  let offset = 0;
  while (offset < bytes.length) {
    const id = readVint(bytes, offset, true);
    const size = readVint(bytes, offset + id.length, false);
    const dataStart = offset + id.length + size.length;

    if (MASTER_ELEMENTS.has(id.value)) {
      if (id.value === TRACK_ENTRY) {
        finishTrack();
        currentTrack = { number: 0, codecId: '', channels: 1, codecPrivate: null };
      } else if (id.value === CLUSTER) {
        finishTrack();
      }
      offset = dataStart;
      continue;
    }

    if (size.unknown) {
      throw new WebmError('Unknown-size element outside a master element');
    }
    const dataEnd = Math.min(dataStart + size.value, bytes.length);
    const data = bytes.subarray(dataStart, dataEnd);

    switch (id.value) {
      case TRACK_NUMBER:
        if (currentTrack) {
          currentTrack.number = data.reduce((acc, byte) => acc * 256 + byte, 0);
        }
        break;
      case CODEC_ID:
        if (currentTrack) {
          currentTrack.codecId = String.fromCharCode(...data);
        }
        break;
      case CODEC_PRIVATE:
        if (currentTrack) {
          currentTrack.codecPrivate = data;
        }
        break;
      case CHANNELS:
        if (currentTrack) {
          currentTrack.channels = data.reduce((acc, byte) => acc * 256 + byte, 0);
        }
        break;
      case SIMPLE_BLOCK:
      case BLOCK:
        finishTrack();
        parseBlock(bytes, dataStart, dataEnd - dataStart, opusTrack, packets);
        break;
      default:
        break;
    }
    offset = dataEnd;
  }
  finishTrack();

  if (!opusTrack) {
    throw new WebmError('No Opus audio track found');
  }
  if (packets.length === 0) {
    throw new WebmError('No audio frames found');
  }
  return { track: opusTrack, packets };
};

/** Number of 48 kHz samples a packet decodes to, read from its TOC byte. */
export const opusPacketSamples = (packet: Uint8Array): number => {
  if (packet.length === 0) {
    return 0;
  }
  const toc = packet[0];
  const config = toc >> 3;
  let frameMs: number;
  if (config < 12) {
    frameMs = [10, 20, 40, 60][config & 0x3];
  } else if (config < 16) {
    frameMs = [10, 20][config & 0x1];
  } else {
    frameMs = [2.5, 5, 10, 20][config & 0x3];
  }
  const code = toc & 0x3;
  let frames: number;
  if (code === 0) {
    frames = 1;
  } else if (code === 3) {
    frames = packet.length > 1 ? packet[1] & 0x3f : 0;
  } else {
    frames = 2;
  }
  return Math.round(frames * frameMs * (OPUS_SAMPLE_RATE / 1000));
};

const ascii = (text: string) => Uint8Array.from(text, char => char.charCodeAt(0));

const opusHead = (channels: number): Uint8Array => {
  const head = new Uint8Array(19);
  const view = new DataView(head.buffer);
  head.set(ascii('OpusHead'), 0);
  head[8] = 1; // version
  head[9] = channels;
  view.setUint16(10, 0, true); // pre-skip
  view.setUint32(12, OPUS_SAMPLE_RATE, true);
  view.setInt16(16, 0, true); // output gain
  head[18] = 0; // channel mapping family
  return head;
};

const opusTags = (): Uint8Array => {
  const vendor = ascii('chatwoot-mobile');
  const tags = new Uint8Array(8 + 4 + vendor.length + 4);
  const view = new DataView(tags.buffer);
  tags.set(ascii('OpusTags'), 0);
  view.setUint32(8, vendor.length, true);
  tags.set(vendor, 12);
  view.setUint32(12 + vendor.length, 0, true); // user comment count
  return tags;
};

type OggPage = {
  packets: Uint8Array[];
  granule: number;
  first: boolean;
  last: boolean;
};

const encodePage = (page: OggPage, sequence: number): Uint8Array => {
  const segments: number[] = [];
  for (const packet of page.packets) {
    let remaining = packet.length;
    while (remaining >= 255) {
      segments.push(255);
      remaining -= 255;
    }
    segments.push(remaining);
  }
  if (segments.length > 255) {
    throw new WebmError('Too many segments for one Ogg page');
  }
  const payloadLength = page.packets.reduce((sum, packet) => sum + packet.length, 0);
  const bytes = new Uint8Array(27 + segments.length + payloadLength);
  const view = new DataView(bytes.buffer);
  bytes.set(ascii('OggS'), 0);
  bytes[4] = 0;
  bytes[5] = (page.first ? 0x02 : 0) | (page.last ? 0x04 : 0);
  view.setUint32(6, page.granule >>> 0, true);
  view.setUint32(10, Math.floor(page.granule / 0x100000000), true);
  view.setUint32(14, OGG_SERIAL, true);
  view.setUint32(18, sequence, true);
  view.setUint32(22, 0, true);
  bytes[26] = segments.length;
  bytes.set(segments, 27);
  let offset = 27 + segments.length;
  for (const packet of page.packets) {
    bytes.set(packet, offset);
    offset += packet.length;
  }
  view.setUint32(22, oggCrc32(bytes), true);
  return bytes;
};

/** Returns the same Opus stream as an Ogg/Opus file. */
export const webmToOgg = (input: ArrayBuffer | Uint8Array): Uint8Array => {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const { track, packets } = parseWebm(bytes);

  const head =
    track.codecPrivate && track.codecPrivate.length >= 19
      ? track.codecPrivate
      : opusHead(track.channels);

  const pages: OggPage[] = [
    { packets: [head], granule: 0, first: true, last: false },
    { packets: [opusTags()], granule: 0, first: false, last: false },
  ];

  let granule = 0;
  for (let i = 0; i < packets.length; i += MAX_PACKETS_PER_PAGE) {
    const chunk = packets.slice(i, i + MAX_PACKETS_PER_PAGE);
    granule += chunk.reduce((sum, packet) => sum + opusPacketSamples(packet), 0);
    pages.push({
      packets: chunk,
      granule,
      first: false,
      last: i + MAX_PACKETS_PER_PAGE >= packets.length,
    });
  }

  const encoded = pages.map((page, index) => encodePage(page, index));
  const output = new Uint8Array(encoded.reduce((sum, page) => sum + page.length, 0));
  let offset = 0;
  for (const page of encoded) {
    output.set(page, offset);
    offset += page.length;
  }
  return output;
};
