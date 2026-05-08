// Number word mappings for 0-100
const ones = ['zero','one','two','three','four','five','six','seven','eight','nine','ten',
  'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];

export function numberToWord(n) {
  if (n < 0 || n > 100 || !Number.isInteger(n)) return '';
  if (n === 100) return 'one hundred';
  if (n < 20) return ones[n];
  const t = tens[Math.floor(n / 10)];
  const o = n % 10;
  return o === 0 ? t : `${t}-${ones[o]}`;
}

export function wordToNumber(word) {
  const w = word.toLowerCase().trim();
  if (w === 'one hundred') return 100;
  for (let i = 0; i <= 100; i++) {
    if (numberToWord(i) === w) return i;
  }
  return -1;
}

// Generate plausible MCQ distractors
export function generateDistractors(correct, count = 3, min = 0, max = 100) {
  const set = new Set();
  let attempts = 0;
  while (set.size < count && attempts < 100) {
    const offset = Math.ceil(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1);
    const d = correct + offset;
    if (d >= min && d <= max && d !== correct) set.add(d);
    attempts++;
  }
  return [...set];
}

// Shuffle array (Fisher-Yates)
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Singapore context names
export const sgNames = ['Megan','Wei Ming','Priya','Raju','Ahmad','Siti','Li Hua','Arjun','Kavitha','Zhi Hao'];
export const sgObjects = ['apples','stickers','marbles','crayons','stars','books','toys','coins','shells','flowers'];
