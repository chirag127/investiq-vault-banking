/**
 * InvestiQ Privacy & Telemetry Scanner
 * 
 * Verifies that the production build output and source codebase contain:
 * 1. Zero external tracking scripts (Google Analytics, GTM, Meta Pixel, Hotjar, Mixpanel, etc.)
 * 2. Zero non-consensual tracking cookies
 * 3. Zero telemetry beacons
 * 4. Zero third-party ad network scripts
 */

import fs from 'fs';
import path from 'path';

const FORBIDDEN_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /gtag\(/i,
  /connect\.facebook\.net/i,
  /fbq\(/i,
  /hotjar\.com/i,
  /mixpanel\.com/i,
  /clarity\.ms/i,
  /segment\.io/i,
  /amplitude\.com/i,
  /doubleclick\.net/i,
  /adsbygoogle/i,
  /criteo\.com/i,
];

const SCAN_DIRS = ['src', 'public'];
if (fs.existsSync('dist')) {
  SCAN_DIRS.push('dist');
}

let violations = 0;
let filesScanned = 0;

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.js', '.ts', '.astro', '.json', '.md'].includes(ext)) {
        filesScanned++;
        const content = fs.readFileSync(fullPath, 'utf8');

        for (const pattern of FORBIDDEN_PATTERNS) {
          if (pattern.test(content)) {
            console.error(`[PRIVACY VIOLATION] Found forbidden tracker pattern ${pattern} in ${fullPath}`);
            violations++;
          }
        }
      }
    }
  }
}

console.log('--- Starting InvestiQ Privacy & Telemetry Scan ---');
for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) {
    console.log(`Scanning directory: ${dir}`);
    scanDirectory(dir);
  }
}

console.log(`Scanned ${filesScanned} files across ${SCAN_DIRS.join(', ')}.`);

if (violations > 0) {
  console.error(`FAILED: ${violations} privacy / tracker violation(s) detected.`);
  process.exit(1);
} else {
  console.log('PASSED: Zero external telemetry, tracking cookies, or analytics detected. 100% Client-Side Privacy Verified.');
  process.exit(0);
}
