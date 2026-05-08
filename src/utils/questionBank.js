import { numberToWord, generateDistractors, shuffle, sgNames, sgObjects } from './numberWords';

function getRangeForDifficulty(difficulty) {
  if (difficulty === 1) return { min: 0, max: 10 };
  if (difficulty === 2) return { min: 11, max: 40 };
  return { min: 41, max: 100 };
}

function randInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Count objects
function genCountChoose(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const correct = randInRange(r.min, r.max);
  const obj = pickRandom(sgObjects);
  const distractors = generateDistractors(correct, 3, r.min, r.max);
  return {
    id, type: 'count_choose_numeral', difficulty,
    questionText: `Count the ${obj}. How many are there?`,
    visual: 'objects', visualCount: correct, visualObject: obj,
    options: shuffle([correct, ...distractors].map(String)),
    correctAnswer: String(correct),
    hint1: `Try counting each ${obj.slice(0, -1)} one by one!`,
    hint2: `Start from 1 and count to the last ${obj.slice(0, -1)}.`,
    explanation: `There are ${correct} ${obj}. The number is ${correct} (${numberToWord(correct)}).`,
  };
}

// What number comes before/after
function genBeforeAfter(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const num = randInRange(Math.max(r.min, 1), r.max - 1);
  const isBefore = Math.random() > 0.5;
  const correct = isBefore ? num - 1 : num + 1;
  return {
    id, type: 'before_after', difficulty,
    questionText: `What number comes ${isBefore ? 'before' : 'after'} ${num}?`,
    options: shuffle([String(correct), ...generateDistractors(correct, 3, r.min, r.max).map(String)]),
    correctAnswer: String(correct),
    hint1: `Think: ${num} ${isBefore ? 'minus' : 'plus'} 1.`,
    hint2: `Count: ... ${isBefore ? `?, ${num}` : `${num}, ?`} ...`,
    explanation: `The number ${isBefore ? 'before' : 'after'} ${num} is ${correct}.`,
  };
}

// Skip counting: what comes next
function genSkipCount(id, difficulty) {
  const skipValues = difficulty === 1 ? [2] : difficulty === 2 ? [2, 5] : [2, 5, 10];
  const by = pickRandom(skipValues);
  const r = getRangeForDifficulty(difficulty);
  const start = randInRange(Math.max(r.min, by), Math.min(r.max - by * 3, r.max));
  const seq = [start, start + by, start + by * 2];
  const correct = start + by * 3;
  return {
    id, type: 'skip_count', difficulty,
    questionText: `Count by ${by}s: ${seq.join(', ')}, ___`,
    options: shuffle([String(correct), ...generateDistractors(correct, 3, r.min, r.max + 10).map(String)]),
    correctAnswer: String(correct),
    hint1: `Each number is ${by} more than the last.`,
    hint2: `${seq[seq.length - 1]} + ${by} = ?`,
    explanation: `Counting by ${by}s: ${[...seq, correct].join(', ')}.`,
  };
}

// Fill in the missing number in sequence
function genFillSequence(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const start = randInRange(r.min, r.max - 4);
  const seq = [start, start + 1, start + 2, start + 3, start + 4];
  const blankIdx = randInRange(1, 3);
  const correct = seq[blankIdx];
  const display = seq.map((n, i) => i === blankIdx ? '___' : String(n)).join(', ');
  return {
    id, type: 'fill_sequence', difficulty,
    questionText: `Fill in the missing number: ${display}`,
    options: shuffle([String(correct), ...generateDistractors(correct, 3, r.min, r.max).map(String)]),
    correctAnswer: String(correct),
    hint1: 'Count up one by one to find the missing number.',
    hint2: `What comes after ${seq[blankIdx - 1]}?`,
    explanation: `The sequence is: ${seq.join(', ')}.`,
  };
}

// Count backwards
function genCountBackward(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const start = randInRange(Math.max(r.min + 3, 4), r.max);
  const seq = [start, start - 1, start - 2];
  const correct = start - 3;
  return {
    id, type: 'count_backward', difficulty,
    questionText: `Count backwards: ${seq.join(', ')}, ___`,
    options: shuffle([String(correct), ...generateDistractors(correct, 3, Math.max(0, r.min - 3), r.max).map(String)]),
    correctAnswer: String(correct),
    hint1: 'Each number is 1 less than the one before.',
    hint2: `${seq[seq.length - 1]} - 1 = ?`,
    explanation: `Counting backwards: ${[...seq, correct].join(', ')}.`,
  };
}

// How many tens and ones
function genTensOnes(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const num = randInRange(Math.max(r.min, 10), r.max);
  const t = Math.floor(num / 10);
  const o = num % 10;
  return {
    id, type: 'tens_ones', difficulty,
    questionText: `${t} tens and ${o} ones = ?`,
    visual: 'blocks', visualTens: t, visualOnes: o,
    options: shuffle([String(num), ...generateDistractors(num, 3, r.min, r.max).map(String)]),
    correctAnswer: String(num),
    hint1: 'Each tens stick equals 10!',
    hint2: `${t} tens = ${t * 10}. Now add ${o} ones.`,
    explanation: `${t} tens and ${o} ones = ${t * 10} + ${o} = ${num}.`,
  };
}

// Ordering
function genOrdering(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const nums = [];
  while (nums.length < 4) {
    const n = randInRange(r.min, r.max);
    if (!nums.includes(n)) nums.push(n);
  }
  const sorted = [...nums].sort((a, b) => a - b);
  return {
    id, type: 'ordering', difficulty,
    questionText: `Arrange from smallest to largest: ${nums.join(', ')}`,
    orderNumbers: nums,
    correctAnswer: sorted.join(','),
    hint1: 'Find the smallest number first!',
    hint2: `Which is smaller: ${nums[0]} or ${nums[1]}?`,
    explanation: `Correct order: ${sorted.join(', ')}.`,
  };
}

// Tenframe reading
function genTenframeRead(id, difficulty) {
  const num = randInRange(1, 10);
  return {
    id, type: 'tenframe_read', difficulty,
    questionText: 'How many counters are in the ten-frame?',
    visual: 'tenframe', visualCount: num,
    options: shuffle([String(num), ...generateDistractors(num, 3, 0, 10).map(String)]),
    correctAnswer: String(num),
    hint1: 'Count each filled circle in the frame.',
    hint2: 'The top row has 5 spots, the bottom row has 5 spots.',
    explanation: `There are ${num} counters in the ten-frame.`,
  };
}

// Word problem about counting
function genWordProblem(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const num = randInRange(r.min, r.max);
  const name = pickRandom(sgNames);
  const obj = pickRandom(sgObjects);
  const questionText = `${name} counted ${num} ${obj}. Which number did ${name} say last?`;
  return {
    id, type: 'word_problem', difficulty,
    questionText,
    options: shuffle([String(num), ...generateDistractors(num, 3, r.min, r.max).map(String)]),
    correctAnswer: String(num),
    hint1: 'The last number you say when counting IS the total!',
    hint2: `${name} counted up to ${num}.`,
    explanation: `${name} counted ${num} ${obj}. The last number said is ${num}.`,
  };
}

// Compare numbers
function genCompare(id, difficulty) {
  const r = getRangeForDifficulty(difficulty);
  const a = randInRange(r.min, r.max);
  let b = randInRange(r.min, r.max);
  while (b === a) b = randInRange(r.min, r.max);
  const correct = Math.max(a, b);
  return {
    id, type: 'compare', difficulty,
    questionText: `Which is more: ${a} or ${b}?`,
    options: shuffle([String(a), String(b)]),
    correctAnswer: String(correct),
    hint1: 'The bigger number comes later when you count.',
    hint2: `Count: which number do you say later — ${a} or ${b}?`,
    explanation: `${correct} is more because it comes later when counting.`,
  };
}

const generators = [
  genCountChoose, genBeforeAfter, genSkipCount, genFillSequence,
  genCountBackward, genTensOnes, genOrdering, genTenframeRead, genWordProblem, genCompare,
];

const diffDist = [1,1,1,1,2,2,2,2,3,3];

export function generateQuestionBank() {
  const bank = [];
  let qid = 1;
  generators.forEach((gen, gi) => {
    diffDist.forEach(diff => {
      bank.push(gen(`Q${gi + 1}_${String(qid).padStart(3, '0')}`, diff));
      qid++;
    });
  });
  return shuffle(bank);
}

export function generatePracticeSet() {
  const practice = [];
  let qid = 1;
  generators.forEach((gen, gi) => {
    practice.push(gen(`P${gi + 1}_${String(qid).padStart(3, '0')}`, 1));
    qid++;
  });
  return shuffle(practice);
}
