import { QUOTAS } from './questionTypes';
import { generateQuestion } from './questionGenerator';
import { shuffle } from '../utils/shuffle';

export function buildSession() {
  const session = [];
  const usedKeys = new Set(); // For deduplication

  for (const [type, count] of Object.entries(QUOTAS)) {
    let generated = 0;
    while (generated < count) {
      const q = generateQuestion(type);
      
      const optionsKey = Array.isArray(q.options)
        ? [...q.options].sort().join(',')
        : (q.options || '');
      
      const key = `${type}_${q.correctAnswer}_${optionsKey}`;
      
      if (!usedKeys.has(key)) {
        usedKeys.add(key);
        session.push(q);
        generated++;
      }
    }
  }

  return shuffle(session); // Fisher-Yates shuffle
}
