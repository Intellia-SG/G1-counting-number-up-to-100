import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phrases = [
  // IntroScreen
  { text: "Welcome to Number Bonds for Subtraction!", style: 'statement' },
  { text: "Are you ready to explore?", style: 'question' },
  
  // StoryPhase
  { text: "One morning, Wei Ming ran to the school playground. His friends were playing hopscotch! He counted the squares: 1, 2, 3... all the way to 10. \"Counting is fun!\" he laughed.", style: 'statement' },
  { text: "After school, Wei Ming went to the market. The fruit seller had arranged apples in groups of ten. \"I have one hundred apples!\" she said. Wei Ming was amazed — that is so many! But how do you count to 100?", style: 'statement' },
  { text: "The next day, his teacher showed the class a trick! Instead of counting one by one, you can skip count! By 2s: 2, 4, 6, 8... By 5s: 5, 10, 15, 20... By 10s: 10, 20, 30... all the way to 100!", style: 'statement' },
  { text: "Wei Ming was so excited! Now he could count anything — forwards, backwards, and even by skipping numbers! \"Can we practice more?\" he asked. And so, the counting adventure began...", style: 'statement' },
  { text: "Let's count with Wei Ming! 🔢", style: 'encouragement' },
  { text: "Hmm... how DO you count to 100? 🤔", style: 'thinking' },
  { text: "So THAT's the secret! 💡", style: 'celebration' },
  { text: "Your turn now! 🚀", style: 'encouragement' },
  { text: "Let's find out together!", style: 'encouragement' },

  // WonderPhase
  { text: "If you had a jar full of marbles, how would you count them super fast?", style: 'question' },
  { text: "What comes after ninety-nine? Can you count that high?", style: 'question' },
  { text: "Can you count by twos? 2, 4, 6... what comes next?", style: 'question' },
  { text: "How many fingers do you have on both hands? Can you count by fives to 100?", style: 'question' },
  { text: "If you count backwards from 10, what happens when you reach zero?", style: 'question' },

  // ReflectPhase
  { text: "Great job!", style: 'celebration' },
  { text: "What number comes after 29?", style: 'question' },
  { text: "Count by 5s: 5, 10, 15, ___. What comes next?", style: 'question' },
  { text: "Which is more: 47 or 74?", style: 'question' }
];

async function generate() {
  let apiKey = process.env.VITE_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    try {
      const envFile = path.join(__dirname, '../.env.local');
      if (fs.existsSync(envFile)) {
        const envContent = fs.readFileSync(envFile, 'utf-8');
        const match = envContent.match(/VITE_ELEVENLABS_API_KEY=(.+)/);
        if (match) apiKey = match[1].trim();
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!apiKey) {
    console.error("No VITE_ELEVENLABS_API_KEY found in environment or .env.local.");
    return;
  }
  
  const voiceId = "Xb7hH8MSUJpSbSDYk0k2"; // Alice
  const audioDir = path.join(__dirname, '../public/assets/audio');
  
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const audioMap = {};
  
  for (let i = 0; i < phrases.length; i++) {
    const p = phrases[i];
    const filename = `audio_${i}.mp3`;
    const filePath = path.join(audioDir, filename);
    const relPath = `/assets/audio/${filename}`;
    audioMap[p.text] = relPath;
    
    if (fs.existsSync(filePath)) {
      console.log(`Skipping existing: ${p.text}`);
      continue;
    }
    
    console.log(`Generating: ${p.text}`);
    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: p.text,
          model_id: 'eleven_multilingual_v2',
        })
      });
      
      if (!resp.ok) {
        throw new Error(`API error: ${resp.statusText}`);
      }
      
      const buffer = await resp.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`Saved ${filename}`);
      
    } catch (err) {
      console.error(`Failed to generate ${p.text}`, err);
    }
  }
  
  const mapCode = `export const audioMap = ${JSON.stringify(audioMap, null, 2)};\nexport default audioMap;`;
  fs.writeFileSync(path.join(__dirname, '../src/utils/audioMap.js'), mapCode);
  console.log("Updated src/utils/audioMap.js");
}

generate();
