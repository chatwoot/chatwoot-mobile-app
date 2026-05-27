import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Asset } from 'react-native-image-picker';
import * as FileSystem from 'expo-file-system';

/**
 * Threshold above which images get compressed (in MB).
 * Anything under this is sent as-is to preserve quality
 * (e.g. small screenshots, receipts where detail matters).
 */
const COMPRESSION_THRESHOLD_MB = 1.5;

/**
 * Max dimension (longest side) after compression.
 */
const MAX_DIMENSION = 1920;

/**
 * JPEG quality after recompression (0..1).
 */
const COMPRESSION_QUALITY = 0.8;

const HEIC_MIME = ['image/heic', 'image/heif'];

const isImageAsset = (asset: Asset): boolean => {
  if (!asset.type) {
    // Fall back to URI/filename extension if type missing
    const probe = (asset.fileName || asset.uri || '').toLowerCase();
    return /\.(png|jpe?g|gif|webp|heic|heif|bmp)(\?|$)/.test(probe);
  }
  return asset.type.startsWith('image/');
};

const isHeic = (asset: Asset): boolean => {
  if (asset.type && HEIC_MIME.includes(asset.type.toLowerCase())) return true;
  const probe = (asset.fileName || asset.uri || '').toLowerCase();
  return /\.(heic|heif)(\?|$)/.test(probe);
};

const extensionFromType = (type?: string | null): string => {
  if (!type) return 'jpg';
  const t = type.toLowerCase();
  if (t.includes('png')) return 'png';
  if (t.includes('gif')) return 'gif';
  if (t.includes('webp')) return 'webp';
  if (t.includes('heic') || t.includes('heif')) return 'heic';
  if (t.includes('jpeg') || t.includes('jpg')) return 'jpg';
  return 'jpg';
};

const typeFromExtension = (ext: string): string => {
  const e = ext.toLowerCase();
  if (e === 'png') return 'image/png';
  if (e === 'gif') return 'image/gif';
  if (e === 'webp') return 'image/webp';
  if (e === 'heic' || e === 'heif') return 'image/heic';
  return 'image/jpeg';
};

/**
 * Ensure the asset has a valid fileName with an extension that matches
 * its MIME type. The iOS image picker sometimes returns null fileName
 * (especially for screenshots and iCloud-stored photos), which causes
 * the multipart upload to be rejected by the Chatwoot backend.
 */
export const normalizeAssetFilename = (asset: Asset): Asset => {
  const ext = extensionFromType(asset.type);
  const inferredType = asset.type || typeFromExtension(ext);

  // Build a guaranteed-non-empty filename
  let name = asset.fileName?.trim();
  if (!name) {
    // No filename at all — generate one from timestamp
    name = `attachment_${Date.now()}.${ext}`;
  } else if (!/\.[a-z0-9]{2,5}$/i.test(name)) {
    // Has a name but no extension — append the correct one
    name = `${name}.${ext}`;
  }

  return {
    ...asset,
    fileName: name,
    type: inferredType,
  };
};

/**
 * Compress an image asset if needed, and always normalize its filename
 * and MIME type for safe multipart upload.
 *
 * Returns the (possibly modified) asset. Never throws — falls back to
 * the normalized original on any error so the user can still try to send.
 */
export const compressImageIfNeeded = async (asset: Asset): Promise<Asset> => {
  // Always normalize, even when no compression is needed.
  // This is what fixes the "queda en rojo" bug for small PNG screenshots.
  const normalized = normalizeAssetFilename(asset);

  try {
    if (!normalized.uri) return normalized;
    if (!isImageAsset(normalized)) return normalized;

    const sizeMB = (normalized.fileSize ?? 0) / (1024 * 1024);
    const needsCompression = sizeMB > COMPRESSION_THRESHOLD_MB || isHeic(normalized);
    if (!needsCompression) return normalized;

    const context = ImageManipulator.manipulate(normalized.uri);
    context.resize({ width: MAX_DIMENSION });
    const image = await context.renderAsync();
    const result = await image.saveAsync({
      compress: COMPRESSION_QUALITY,
      format: SaveFormat.JPEG,
    });

    let newSize = normalized.fileSize ?? 0;
    try {
      const info = await FileSystem.getInfoAsync(result.uri, { size: true });
      if (info.exists && 'size' in info && typeof info.size === 'number') {
        newSize = info.size;
      }
    } catch {
      // keep prior size estimate
    }

    const baseName = (normalized.fileName || `attachment_${Date.now()}`).replace(
      /\.(heic|heif|png|webp|gif|bmp|jpe?g)$/i,
      '',
    );

    return {
      ...normalized,
      uri: result.uri,
      type: 'image/jpeg',
      fileName: `${baseName}.jpg`,
      fileSize: newSize,
      width: result.width,
      height: result.height,
    };
  } catch {
    return normalized;
  }
};
