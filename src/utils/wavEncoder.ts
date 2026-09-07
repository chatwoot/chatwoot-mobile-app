export type PcmAudio = {
  sampleRate: number;
  channels: Float32Array[];
};

const WAV_HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;

const writeAscii = (view: DataView, offset: number, text: string) => {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
};

/** Averages every channel into one, so a voice note stays small. */
export const mixToMono = (channels: Float32Array[]): Float32Array => {
  if (channels.length === 1) {
    return channels[0];
  }
  const length = channels[0].length;
  const mono = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    let sum = 0;
    for (let c = 0; c < channels.length; c += 1) {
      sum += channels[c][i];
    }
    mono[i] = sum / channels.length;
  }
  return mono;
};

/** Encodes PCM as a mono 16-bit little-endian RIFF/WAVE file. */
export const encodeWav = ({ sampleRate, channels }: PcmAudio): Uint8Array => {
  const samples = mixToMono(channels);
  const dataBytes = samples.length * BYTES_PER_SAMPLE;
  const buffer = new ArrayBuffer(WAV_HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * BYTES_PER_SAMPLE, true);
  view.setUint16(32, BYTES_PER_SAMPLE, true);
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = WAV_HEADER_BYTES;
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += BYTES_PER_SAMPLE;
  }

  return new Uint8Array(buffer);
};
