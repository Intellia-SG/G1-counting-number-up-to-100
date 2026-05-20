import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function clean() {
  const audioMapModule = await import('../src/utils/audioMap.js');
  const audioMap = audioMapModule.audioMap || audioMapModule.default || {};
  const validFiles = new Set(Object.values(audioMap).map(p => path.basename(p)));
  const audioDir = path.join(__dirname, '../public/assets/audio');

  if (!fs.existsSync(audioDir)) {
    console.log('No audio directory found.');
    return;
  }

  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
  let removed = 0;

  for (const file of files) {
    if (!validFiles.has(file)) {
      fs.unlinkSync(path.join(audioDir, file));
      console.log(`Removed orphan: ${file}`);
      removed++;
    }
  }

  console.log(`\n✓ Cleanup complete. Removed ${removed} orphaned file(s). ${files.length - removed} valid file(s) remain.`);
}

clean();
