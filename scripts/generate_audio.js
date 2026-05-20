import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Voice Settings (copied from numberbound) ──
const getElevenLabsSettings = (style) => {
  switch (style) {
    case 'celebration': return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question': return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis': return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking': return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default: return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

// ─── PARAGRAPHS & QUESTIONS ONLY (no titles!) ──
const phrases = [
  // IntroScreen — paragraph + mascot speech
  { text: "Ready for a counting adventure?", style: 'encouragement' },
  { text: "Join Wei Ming on a journey to count numbers 0 to 100 through stories, simulations, and fun games!", style: 'statement' },

  // StoryPhase — paragraph text (4 slides)
  { text: "One morning, Wei Ming ran to the school playground. His friends were playing hopscotch! He counted the squares: 1, 2, 3... all the way to 10. \"Counting is fun!\" he laughed.", style: 'statement' },
  { text: "After school, Wei Ming went to the market. The fruit seller had arranged apples in groups of ten. \"I have one hundred apples!\" she said. Wei Ming was amazed — that is so many! But how do you count to 100?", style: 'statement' },
  { text: "The next day, his teacher showed the class a trick! Instead of counting one by one, you can skip count! By 2s: 2, 4, 6, 8... By 5s: 5, 10, 15, 20... By 10s: 10, 20, 30... all the way to 100!", style: 'statement' },
  { text: "Wei Ming was so excited! Now he could count anything — forwards, backwards, and even by skipping numbers! \"Can we practice more?\" he asked. And so, the counting adventure began...", style: 'statement' },

  // StoryPhase — mascot speech bubbles
  { text: "Let's count with Wei Ming! 🔢", style: 'encouragement' },
  { text: "Hmm... how DO you count to 100? 🤔", style: 'thinking' },
  { text: "So THAT's the secret! 💡", style: 'celebration' },
  { text: "Your turn now! 🚀", style: 'encouragement' },

  // WonderPhase — questions (no titles, no emojis-only)
  { text: "If you had a jar full of marbles, how would you count them super fast?", style: 'question' },
  { text: "What if there's a magical trick using groups of ten?", style: 'statement' },
  { text: "What comes after ninety-nine? Can you count that high?", style: 'question' },
  { text: "The biggest number we'll explore today has a very special name!", style: 'statement' },
  { text: "Can you count by twos? 2, 4, 6... what comes next?", style: 'question' },
  { text: "Skip counting is like taking big jumps on a number line!", style: 'statement' },
  { text: "How many fingers do you have on both hands? Can you count by fives to 100?", style: 'question' },
  { text: "Your fingers are the best counting tool ever!", style: 'statement' },
  { text: "If you count backwards from 10, what happens when you reach zero?", style: 'question' },
  { text: "Counting backwards is like a rocket countdown — 3, 2, 1, blast off!", style: 'statement' },
  { text: "Let's find out together!", style: 'encouragement' },

  // SimulatePhase — instruction paragraphs
  { text: "Click the squares to count. Each filled square equals one!", style: 'instruction' },
  { text: "Try counting to different numbers! There are no wrong answers.", style: 'statement' },
  { text: "One ten and some ones make the teen numbers!", style: 'instruction' },
  { text: "Slide the control to count the teen numbers!", style: 'statement' },
  { text: "Skip counting is like taking big jumps on a number line!", style: 'instruction' },
  { text: "Choose to count by twos, fives, or tens and watch the numbers light up!", style: 'statement' },
  { text: "Click any number to hear it! Explore patterns in the chart.", style: 'instruction' },
  { text: "Notice how each row ends with a number ending in zero!", style: 'statement' },

  // ReflectPhase — questions only
  { text: "Great job!", style: 'celebration' },
  { text: "What number comes after 29?", style: 'question' },
  { text: "Count by 5s: 5, 10, 15, ___. What comes next?", style: 'question' },
  { text: "Which is more: 47 or 74?", style: 'question' },
  { text: "How do you feel about counting?", style: 'question' },
  { text: "Be honest — every answer is great!", style: 'statement' },

  // ReflectPhase — certificate
  { text: "Journey Complete!", style: 'celebration' },
];

function slugify(text, index) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
  return `audio_${slug}_${index}`;
}

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
    } catch (e) { /* ignore */ }
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
    const filename = `${slugify(p.text, i)}.mp3`;
    const filePath = path.join(audioDir, filename);
    const relPath = `/assets/audio/${filename}`;
    audioMap[p.text] = relPath;

    if (fs.existsSync(filePath)) {
      console.log(`Skipping existing: ${p.text.slice(0, 60)}...`);
      continue;
    }

    console.log(`Generating [${p.style}]: ${p.text.slice(0, 60)}...`);
    const voiceSettings = getElevenLabsSettings(p.style);

    try {
      const resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: p.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
      });

      if (!resp.ok) {
        throw new Error(`API error: ${resp.status} ${resp.statusText}`);
      }

      const buffer = await resp.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
      console.log(`  ✓ Saved ${filename}`);

      // Rate limit: pause 500ms between calls
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  const mapCode = `export const audioMap = ${JSON.stringify(audioMap, null, 2)};\nexport default audioMap;`;
  fs.writeFileSync(path.join(__dirname, '../src/utils/audioMap.js'), mapCode);
  console.log("\n✓ Updated src/utils/audioMap.js");
}

generate();
