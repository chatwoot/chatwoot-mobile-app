import { getApps } from '@react-native-firebase/app';

export function isFirebaseInitialized(): boolean {
  return getApps().length > 0;
}

export async function waitForFirebaseInit(
  options: { timeoutMs?: number; pollMs?: number } = {}
): Promise<boolean> {
  const timeoutMs = options.timeoutMs ?? 5000;
  const pollMs = options.pollMs ?? 100;

  if (isFirebaseInitialized()) return true;

  const start = Date.now();
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (isFirebaseInitialized()) {
        clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve(false);
      }
    }, pollMs);
  });
}


