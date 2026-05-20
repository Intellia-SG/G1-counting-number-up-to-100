// ──────────────────────────────────────────────────
// Narration Scripts — Paragraphs & Questions ONLY
// NO titles are narrated — only content text
// ──────────────────────────────────────────────────

import { say, ask, cheer, emphasize, think, celebrate, instruct } from './audio';

// ─── INTRO SCREEN ────────────────────────────────
// Narrates: description paragraph + mascot speech (NOT the title)
export function introNarration() {
  return [
    cheer("Ready for a counting adventure?"),
    say("Join Wei Ming on a journey to count numbers 0 to 100 through stories, simulations, and fun games!"),
  ];
}

// ─── WONDER PHASE ────────────────────────────────
// Narrates: the question + subtext (NOT the emoji or section title)
export function wonderNarration(questionText, subtext) {
  return [
    ask(questionText),
    say(subtext),
  ];
}

export function wonderDiscoverNarration() {
  return [
    cheer("Let's find out together!"),
  ];
}

// ─── STORY PHASE ─────────────────────────────────
// Narrates: paragraph text + mascot text (NOT the slide title)
export function getStoryNarration(slideIndex) {
  switch (slideIndex) {
    case 0:
      return [
        say("One morning, Wei Ming ran to the school playground. His friends were playing hopscotch! He counted the squares: 1, 2, 3... all the way to 10. \"Counting is fun!\" he laughed."),
        cheer("Let's count with Wei Ming! 🔢"),
      ];
    case 1:
      return [
        say("After school, Wei Ming went to the market. The fruit seller had arranged apples in groups of ten. \"I have one hundred apples!\" she said. Wei Ming was amazed — that is so many! But how do you count to 100?"),
        think("Hmm... how DO you count to 100? 🤔"),
      ];
    case 2:
      return [
        say("The next day, his teacher showed the class a trick! Instead of counting one by one, you can skip count! By 2s: 2, 4, 6, 8... By 5s: 5, 10, 15, 20... By 10s: 10, 20, 30... all the way to 100!"),
        celebrate("So THAT's the secret! 💡"),
      ];
    case 3:
      return [
        say("Wei Ming was so excited! Now he could count anything — forwards, backwards, and even by skipping numbers! \"Can we practice more?\" he asked. And so, the counting adventure began..."),
        cheer("Your turn now! 🚀"),
      ];
    default:
      return [];
  }
}

// ─── SIMULATE PHASE ──────────────────────────────
// Narrates: instruction paragraphs for each station (NOT station titles)
export function simulateStation1Intro() {
  return [
    instruct("Click the squares to count. Each filled square equals one!"),
    say("Try counting to different numbers! There are no wrong answers."),
  ];
}

export function simulateStation2Intro() {
  return [
    instruct("One ten and some ones make the teen numbers!"),
    say("Slide the control to count the teen numbers!"),
  ];
}

export function simulateStation3Intro() {
  return [
    instruct("Skip counting is like taking big jumps on a number line!"),
    say("Choose to count by twos, fives, or tens and watch the numbers light up!"),
  ];
}

export function simulateStation4Intro() {
  return [
    instruct("Click any number to hear it! Explore patterns in the chart."),
    say("Notice how each row ends with a number ending in zero!"),
  ];
}

// ─── PLAY PHASE ──────────────────────────────────
// Narrates: question text only (NOT world title or HUD)
export function playWorldIntro(worldName) {
  return [
    celebrate(`Welcome to ${worldName}!`),
  ];
}

export function playReadQuestion(questionText) {
  return [
    ask(questionText),
  ];
}

// ─── REFLECT PHASE ───────────────────────────────
// Narrates: the question text only (NOT section title)
export function reflectQuestionNarration(questionText) {
  return [
    ask(questionText),
  ];
}

export function reflectCorrectNarration() {
  return [
    celebrate("Great job!"),
  ];
}

export function reflectConfidenceNarration() {
  return [
    ask("How do you feel about counting?"),
    say("Be honest — every answer is great!"),
  ];
}

export function reflectCertificateNarration(pct) {
  return [
    celebrate("Journey Complete!"),
    say(`You finished all 5 phases! You scored ${Math.round(pct)} percent!`),
  ];
}
