import { HumanMessage } from '@langchain/core/messages';
import { graph } from './browser-use/graph';

const humanInput =
  'open huggingface.co, search deepseek, find the deepseek-r1 model, extract the number of downloads last month';

const result = await graph.invoke({
  messages: [
    new HumanMessage({
      content: humanInput,
    }),
  ],
});

console.log(result);
