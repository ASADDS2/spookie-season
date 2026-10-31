import { describe, expect, it } from 'vitest';
import { isCorrectAnswer, shuffleQuestions } from '../lib/leaderboard-rules';
import topics from '../lib/quiz-topics.json';

describe('Leaderboard answer credit', () => {
  it('credits a correct answer', () => expect(isCorrectAnswer('history-1', 'Samhain')).toBe(true));
  it('does not credit an incorrect answer', () => expect(isCorrectAnswer('history-1', 'Yule')).toBe(false));
  it('rejects unknown questions', () => expect(() => isCorrectAnswer('invented', 'Samhain')).toThrow());
  it('rejects options that do not belong to the question', () => expect(() => isCorrectAnswer('history-1', 'Invented option')).toThrow());
});

describe('Question shuffling', () => {
  const history = topics.find(topic => topic.id === 'history')!;

  it('keeps every question and option exactly once', () => {
    const shuffled = shuffleQuestions(history.questions);
    expect(shuffled.map(question => question.id).sort()).toEqual(history.questions.map(question => question.id).sort());
    for (const question of shuffled) {
      const original = history.questions.find(item => item.id === question.id)!;
      expect([...question.options].sort()).toEqual([...original.options].sort());
    }
  });

  it('keeps correctIndex pointing at the right answer after shuffling', () => {
    for (const question of shuffleQuestions(history.questions)) {
      const original = history.questions.find(item => item.id === question.id)!;
      expect(question.options[question.correctIndex]).toBe(original.options[original.correctIndex]);
    }
  });
});
