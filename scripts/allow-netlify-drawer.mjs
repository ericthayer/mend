// Deploy previews and branch deploys inject the Netlify Drawer, which frames
// https://app.netlify.com/. Production keeps the stricter policy where the
// missing frame-src falls back to default-src 'self' and blocks all framing.
import { readFile, writeFile } from 'node:fs/promises';

const headersPath = new URL('../dist/_headers', import.meta.url);
const anchor = 'object-src ';
const directive = "frame-src 'self' https://app.netlify.com; ";

const headers = await readFile(headersPath, 'utf8');

if (headers.includes('frame-src')) {
  console.log('dist/_headers already declares frame-src; leaving it unchanged.');
  process.exit(0);
}

if (!headers.includes(anchor)) {
  console.error(
    `Expected "${anchor}" in dist/_headers to anchor the frame-src insertion. ` +
      'Update public/_headers or this script so the preview CSP stays in sync.',
  );
  process.exit(1);
}

await writeFile(headersPath, headers.replace(anchor, directive + anchor));
console.log("Preview CSP now allows frame-src 'self' https://app.netlify.com.");
