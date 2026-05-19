import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function clean() {
  const audioDir = path.join(__dirname, '../public/assets/audio');
  const mapFile = path.join(__dirname, '../src/utils/audioMap.js');
  
  if (!fs.existsSync(mapFile) || !fs.existsSync(audioDir)) {
    console.log("No audio map or audio directory found.");
    return;
  }
  
  const mapContent = fs.readFileSync(mapFile, 'utf8');
  const jsonStr = mapContent.substring(mapContent.indexOf('{'), mapContent.lastIndexOf('}') + 1);
  let audioMap = {};
  try {
    audioMap = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Could not parse audioMap.js");
    return;
  }
  
  const validFiles = Object.values(audioMap).map(p => path.basename(p));
  const existingFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
  
  for (const file of existingFiles) {
    if (!validFiles.includes(file)) {
      console.log(`Removing orphaned file: ${file}`);
      fs.unlinkSync(path.join(audioDir, file));
    }
  }
  
  console.log("Audio cleanup complete.");
}

clean();
