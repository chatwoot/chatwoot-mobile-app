import { errorMessage } from '@/utils/errorUtils';

describe('#errorMessage', () => {
  it('returns the message of an Error', () => {
    expect(errorMessage(new Error('No app associated with this mime type'))).toBe(
      'No app associated with this mime type',
    );
  });

  it('returns a string unchanged', () => {
    expect(errorMessage('File load error')).toBe('File load error');
  });

  it('returns the message of a native module rejection', () => {
    expect(errorMessage({ code: 'ENOENT', message: 'File does not exist' })).toBe(
      'File does not exist',
    );
  });

  it('falls back when the object has no string message', () => {
    expect(errorMessage({ message: { detail: 'nested' } })).toBe('Error');
  });

  it('falls back for null and undefined', () => {
    expect(errorMessage(null)).toBe('Error');
    expect(errorMessage(undefined)).toBe('Error');
  });
});
