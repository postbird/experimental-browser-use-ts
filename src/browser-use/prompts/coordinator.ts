import { readFile } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const coordinatorPrompt = async () => {
  const template = await readFile(`${__dirname}/templates/coordinator.md`, 'utf-8');

  return template;
};
