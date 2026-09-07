import { encodeWav, mixToMono } from '@/utils/wavEncoder';

const ascii = (bytes: Uint8Array, offset: number, length: number) =>
  String.fromCharCode(...bytes.subarray(offset, offset + length));

describe('mixToMono', () => {
  it('returns a single channel untouched', () => {
    const channel = new Float32Array([0.1, -0.2]);
    expect(mixToMono([channel])).toBe(channel);
  });

  it('averages several channels', () => {
    const mono = mixToMono([new Float32Array([1, 0]), new Float32Array([0, -1])]);
    expect(Array.from(mono)).toEqual([0.5, -0.5]);
  });
});

describe('encodeWav', () => {
  it('writes a mono 16-bit RIFF header for the given sample rate', () => {
    const wav = encodeWav({ sampleRate: 24000, channels: [new Float32Array(10)] });
    const view = new DataView(wav.buffer);

    expect(wav.length).toBe(44 + 10 * 2);
    expect(ascii(wav, 0, 4)).toBe('RIFF');
    expect(view.getUint32(4, true)).toBe(36 + 20);
    expect(ascii(wav, 8, 4)).toBe('WAVE');
    expect(ascii(wav, 12, 4)).toBe('fmt ');
    expect(view.getUint16(20, true)).toBe(1);
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(24000);
    expect(view.getUint32(28, true)).toBe(48000);
    expect(view.getUint16(32, true)).toBe(2);
    expect(view.getUint16(34, true)).toBe(16);
    expect(ascii(wav, 36, 4)).toBe('data');
    expect(view.getUint32(40, true)).toBe(20);
  });

  it('scales samples to signed 16-bit and clamps out-of-range values', () => {
    const wav = encodeWav({
      sampleRate: 8000,
      channels: [new Float32Array([0, 1, -1, 0.5, 2, -2])],
    });
    const view = new DataView(wav.buffer);
    const samples = Array.from({ length: 6 }, (_, i) => view.getInt16(44 + i * 2, true));

    expect(samples).toEqual([0, 32767, -32768, 16383, 32767, -32768]);
  });

  it('mixes stereo input down to one channel', () => {
    const wav = encodeWav({
      sampleRate: 8000,
      channels: [new Float32Array([1, 1]), new Float32Array([0, -1])],
    });
    const view = new DataView(wav.buffer);

    expect(view.getUint32(40, true)).toBe(4);
    expect(view.getInt16(44, true)).toBe(16383);
    expect(view.getInt16(46, true)).toBe(0);
  });
});
