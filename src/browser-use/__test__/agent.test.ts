import { HumanMessage } from '@langchain/core/messages';
import { graph } from '../graph';

const res = await graph.invoke({
  messages: [
    new HumanMessage(
      "open www.ebay.com, find the search bar, and search for 'iphone', then get the price of the first one",
    ),
  ],
});

console.log(`[agent]:`, res);
