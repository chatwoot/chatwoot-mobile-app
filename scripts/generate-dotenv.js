/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function main() {
  const outPath = path.join(process.cwd(), '.env');
  const lines = [];

  // Capture all EXPO_PUBLIC_* vars so Expo CLI/Metro can inline them if it reads .env
  Object.keys(process.env)
    .filter(key => key.startsWith('EXPO_PUBLIC_'))
    .sort()
    .forEach(key => {
      let value = String(process.env[key] ?? '');
      // Ensure newlines are escaped
      value = value.replace(/\n/g, '\\n');
      lines.push(`${key}=${value}`);
    });

  // Only write if we have something
  const content = lines.join('\n') + (lines.length ? '\n' : '');
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`[generate-dotenv] Wrote ${lines.length} EXPO_PUBLIC_* vars to ${outPath}`);
}

main();


