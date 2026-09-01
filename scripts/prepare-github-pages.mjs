import { copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outputDir = path.resolve('dist/public');

// GitHub Pages serves 404.html for direct SPA routes. Reusing the built index
// keeps /ramza/<route> refreshes inside the Wouter application.
await copyFile(path.join(outputDir, 'index.html'), path.join(outputDir, '404.html'));
await writeFile(path.join(outputDir, '.nojekyll'), '');
