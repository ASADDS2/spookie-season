import { describe, expect, it } from 'vitest';
import { isCorrectAnswer } from '../lib/leaderboard-rules';

describe('Leaderboard answer credit', () => {
  it('credits a correct answer', () => expect(isCorrectAnswer('history-1', 1)).toBe(true));
  it('does not credit an incorrect answer', () => expect(isCorrectAnswer('history-1', 0)).toBe(false));
  it('rejects unknown questions', () => expect(() => isCorrectAnswer('invented', 1)).toThrow());
});