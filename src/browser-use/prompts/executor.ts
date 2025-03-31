import { readFile } from 'fs/promises';
import nunjucks from 'nunjucks';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const nunjucksInstance = new nunjucks.Environment(null, {
  autoescape: false,
  throwOnUndefined: true,
});

const __dirname = dirname(fileURLToPath(import.meta.url));

export const executorPrompt = async () => {
  const template = await readFile(`${__dirname}/templates/executor.md`, 'utf-8');

  return template;
};

export const executorHumanPrompt = async (params: { previousLogs: string[]; instruction: string }) => {
  const template = await readFile(`${__dirname}/templates/executor-human.md`, 'utf-8');

  return nunjucksInstance.renderString(template, params);
};
