import { HumanMessage } from '@langchain/core/messages';
import { graph } from '../graph';

const res = await graph.invoke({
  messages: [
    new HumanMessage({
      content:
        'open huggingface.co, search deepseek, find the deepseek-r1 model, extract the number of downloads last month',
    }),
    // "open www.ebay.com, find the search bar, and search for 'iphone', then get the price of the first result",
    // "open github.com, search 'browser-use' project, then get the star numbers of the browser-use project",
    // 'open x.com,login with the email(ptbird@yeah.net) and password(gaoyang5211314), post a tweet, content is "hello browser-use"',
  ],
});

console.log('🔎 ➡️ graph.ts:20 ➡️ res:', res);
