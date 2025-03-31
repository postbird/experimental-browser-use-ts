import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';
import { z } from 'zod';
import { getLLM } from '../llm';
import { coordinatorPrompt } from '../prompts/coordinator';
import { BrowserAgentAnnotation } from '../state';

const coordinatorOutputSchema = z.object({
  action: z
    .object({
      url: z.string().describe('the url to visit'),
      instruction: z.string().describe('the instruction to visit the url'),
    })
    .nullable()
    .describe('the action to visit the url'),
});

export const coordinatorAgent = async (state: typeof BrowserAgentAnnotation.State) => {
  const { messages } = await state;

  const systemPrompt = await coordinatorPrompt();

  const systemMessage = new SystemMessage({ content: systemPrompt });

  let invokeMessages = messages;

  let llm: any = getLLM();

  if (messages[messages?.length - 1].getType() === 'ai') {
    return new Command({
      goto: 'dropBrowser',
      update: {},
    });
  } else {
    invokeMessages = [systemMessage, ...invokeMessages];
    llm = llm.withStructuredOutput(coordinatorOutputSchema);
    const result = await llm.invoke(invokeMessages);

    if (!result?.action || !result?.action?.url || !result?.action?.instruction) {
      return new Command({
        goto: 'dropBrowser',
        update: {
          messages:
            messages[messages?.length - 1].getType() === 'ai'
              ? []
              : [
                  new AIMessage({
                    content: `Not found the url or instruction from the message`,
                    name: 'coordinatorAgent',
                  }),
                ],
        },
      });
    }

    return new Command({
      goto: 'launchBrowser',
      update: {
        messages: [
          new HumanMessage({
            content: `The action is ${result.action.url} with instruction ${result.action.instruction}`,
            id: messages[messages.length - 1].id, // replace the origin human message the same id
            name: 'coordinator',
          }),
        ],
        url: result.action.url,
        instruction: result.action.instruction,
      },
    });
  }
};
