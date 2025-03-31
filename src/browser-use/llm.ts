import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOpenAI } from '@langchain/openai';

const vllm = new ChatOpenAI({
  modelName: 'qwen-vl-max-latest',
  temperature: 0,
  maxTokens: 2048,
});

const llm = new ChatMistralAI({
  modelName: 'mistral-large-latest',
  temperature: 0,
});

export const getVLLM = () => {
  return vllm;
};

export const getLLM = () => {
  return llm;
};
