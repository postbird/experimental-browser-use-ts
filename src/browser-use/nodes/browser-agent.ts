import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { Command } from '@langchain/langgraph';
import { getVLLM } from '../llm';
import { executorHumanPrompt, executorPrompt } from '../prompts/executor';
import { BROWSER_POOL, BrowserAgentAnnotation } from '../state';
import { safeWriteLogFile } from '../utils';
import { adaptQwenVLResponseJSON } from '../utils/adaptor';
import { safeParseJson } from '../utils/parse';
import { TVLLMOutput } from '../utils/schema';

export const browserAgent = async (state: typeof BrowserAgentAnnotation.State) => {
  const { taskId, instruction, previousLogs } = state;

  const { browser } = BROWSER_POOL.get(taskId) || {};

  if (!browser) {
    throw new Error('browser not found');
  }

  console.log(await browser.pages());

  const pages = await browser.pages();

  const page = pages[0];

  if (!page) {
    throw new Error('page not found');
  }
  console.log('[browser-agent] taskId is: ', taskId);

  try {
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10 * 1000 });
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10 * 1000 });
  } catch (err) {
    console.warn('[browser-agent] waitForNavigation failed: ', err.message);
  } finally {
    console.log('[browser-agent] waitForNavigation completed');
  }

  const snapshot = await page.screenshot({ type: 'jpeg', quality: 100, encoding: 'base64' });

  const snapshotBase64 = `data:image/jpeg;base64,${snapshot}`;

  safeWriteLogFile(
    `${taskId}/snapshot-${Date.now()}.jpeg`,
    Buffer.from(snapshotBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64'),
  );

  const vllm = getVLLM();

  const invokeMessage = [
    new SystemMessage({ content: await executorPrompt() }),
    new HumanMessage({
      content: [
        { type: 'image_url', image_url: { url: snapshotBase64, detail: 'high' } },
        { type: 'text', text: await executorHumanPrompt({ instruction, previousLogs }) },
      ],
    }),
  ];

  try {
    console.log('[browser-agent] call model start');

    // There are often errors occurred with structured output, so we use unstructured output, and then fix it by ourself
    // const res = await vllm.withStructuredOutput(VLLMOutputSchema).invoke(invokeMessage);

    const aiMessage = await vllm.invoke(invokeMessage);

    console.log('[browser-agent] call model result is', aiMessage.content);

    // extract json from ai message content; then fix it by adaptor
    const llmResult: TVLLMOutput = adaptQwenVLResponseJSON(safeParseJson(aiMessage.content as string));

    console.log('[browser-agent] ai message json parse result', llmResult);

    if (!llmResult.more_actions_needed_by_instruction || !llmResult.action) {
      // task completed
      const aiMessage = new AIMessage({
        content: `${llmResult.result}`,
        name: 'browserAgent',
      });

      return new Command({
        goto: 'coordinatorAgent',
        update: { messages: [aiMessage] },
      });
    } else {
      // task continue to execute browser
      return new Command({
        goto: 'browserExecutor',
        update: {
          executorInput: llmResult,
        },
      });
    }
  } catch (err) {
    console.error('[browser-agent] failed', err);
    return new Command({
      goto: 'coordinatorAgent',
      update: {
        messages: [
          new AIMessage({ content: `I can not complete the task,error is ${err.message}`, name: 'browserAgent' }),
        ],
      },
    });
  }
};
