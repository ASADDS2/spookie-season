import topics from './quiz-topics.json';

export type QuizQuestion = (typeof topics)[number]['questions'][number];

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const held = copy[index]!;
    copy[index] = copy[swap]!;
    copy[swap] = held;
  }
  return copy;
}

export function shuffleQuestions(questions: readonly QuizQuestion[]): QuizQuestion[] {
  return shuffle(questions).map(question => {
    const correct = question.options[question.correctIndex]!;
    const options = shuffle(question.options);
    return { ...question, options, correctIndex: options.indexOf(correct) };
  });
}

export function isCorrectAnswer(questionId: string, option: string) {
  const question = topics.flatMap(topic => topic.questions).find(item => item.id === questionId);
  if (!question || !question.options.includes(option)) throw new Error('Invalid answer');
  return option === question.options[question.correctIndex];
}