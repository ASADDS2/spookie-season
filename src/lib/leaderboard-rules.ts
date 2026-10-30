import topics from './quiz-topics.json';

export function isCorrectAnswer(questionId: string, option: number) {
  const question = topics.flatMap(topic => topic.questions).find(item => item.id === questionId);
  if (!question || !Number.isInteger(option) || option < 0 || option >= question.options.length) throw new Error('Invalid answer');
  return option === question.correctIndex;
}