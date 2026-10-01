/**
 * `stopRecorder()` resolves with a status string such as `Already stopped` when the
 * recorder is not running, and with a null file URL when the platform has no path to
 * report. Only a file path can be turned into an attachment.
 */
export const isRecordedFilePath = (value: unknown): value is string =>
  typeof value === 'string' && (value.startsWith('file://') || value.startsWith('/'));
