export const ELLA_CAT_QUOTES = [
  "Paws what you're doing and ask me anything.",
  "Keeping your flat purr-fectly organized.",
  "Less stress. More purrs.",
  "I chase problems so you don't have to.",
  "The only tenant who never misses rent is me. 😸",
  "I'm not kitten around, I can help.",
] as const;

export function getRandomCatQuote(): string {
  const index = Math.floor(Math.random() * ELLA_CAT_QUOTES.length);
  return ELLA_CAT_QUOTES[index];
}
