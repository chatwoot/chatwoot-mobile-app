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
  
  // Determine environment: check EAS_BUILD_PROFILE, ENVIRONMENT, or default to production
  const easProfile = process.env.EAS_BUILD_PROFILE || '';
  const environment = process.env.ENVIRONMENT || '';
  const isDevelopment = easProfile === 'development' || environment === 'dev';
  
  console.log('[copy-google-services] EAS_BUILD_PROFILE:', easProfile);
  console.log('[copy-google-services] ENVIRONMENT:', environment);
  console.log('[copy-google-services] isDevelopment:', isDevelopment);
  
  const androidEnvPath = process.env.GOOGLE_SERVICES_JSON || process.env.EXPO_PUBLIC_ANDROID_GOOGLE_SERVICES_FILE;
  const iosEnvPath = process.env.GOOGLE_SERVICE_INFO_PLIST || process.env.EXPO_PUBLIC_IOS_GOOGLE_SERVICES_FILE;

  // Choose correct fallback files based on environment
  const fallbackAndroid = isDevelopment
    ? path.join(projectRoot, 'credentials/android/google-services-dev.json')
    : path.join(projectRoot, 'credentials/android/google-services.json');
  const fallbackIos = isDevelopment
    ? path.join(projectRoot, 'credentials/ios/GoogleService-Info-dev.plist')
    : path.join(projectRoot, 'credentials/ios/GoogleService-Info.plist');

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


