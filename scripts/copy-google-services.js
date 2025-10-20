/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function copyIfExists(src, dest) {
  try {
    if (!src) return false;
    if (!fs.existsSync(src)) return false;
    const dir = path.dirname(dest);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied file to ${dest}`);
    return true;
  } catch (e) {
    console.log(`Failed to copy ${src} -> ${dest}:`, e.message);
    return false;
  }
}

function main() {
  console.log('[copy-google-services] hook started');
  const projectRoot = process.cwd();
  
  // Determine if this is a production build
  const isProd = process.env.ENVIRONMENT === 'prod' || process.env.EAS_BUILD_PROFILE === 'production';
  console.log('[copy-google-services] Environment:', process.env.ENVIRONMENT || 'not set');
  console.log('[copy-google-services] EAS Build Profile:', process.env.EAS_BUILD_PROFILE || 'not set');
  console.log('[copy-google-services] Is Production:', isProd);
  
  const androidEnvPath = process.env.GOOGLE_SERVICES_JSON || process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE;
  const iosEnvPath = process.env.GOOGLE_SERVICE_INFO_PLIST || process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE;

  // Choose the correct fallback file based on environment
  const fallbackAndroid = isProd 
    ? path.join(projectRoot, 'credentials/android/google-services.json')
    : path.join(projectRoot, 'credentials/android/google-services-dev.json');
  const fallbackIos = isProd 
    ? path.join(projectRoot, 'credentials/ios/GoogleService-Info.plist')
    : path.join(projectRoot, 'credentials/ios/GoogleService-Info-dev.plist');

  const androidSrc = androidEnvPath || fallbackAndroid;
  const iosSrc = iosEnvPath || fallbackIos;

  const androidDest = path.join(projectRoot, 'android/app/google-services.json');
  const iosDest = path.join(projectRoot, 'ios/GoogleService-Info.plist');

  console.log('[copy-google-services] ANDROID src:', androidSrc);
  console.log('[copy-google-services] IOS src:', iosSrc);

  const aOk = copyIfExists(androidSrc, androidDest);
  const iOk = copyIfExists(iosSrc, iosDest);

  if (!aOk) {
    console.log('[copy-google-services] Warning: android google-services.json not found');
  }
  if (!iOk) {
    console.log('[copy-google-services] Warning: ios GoogleService-Info.plist not found');
  }
  console.log('[copy-google-services] hook finished');
}

main();


