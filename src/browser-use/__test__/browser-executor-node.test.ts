import { randomUUID } from 'crypto';
import { browserExecutor } from '../nodes/browser-executor';
import { BROWSER_POOL } from '../state';
import { launchTool } from '../tools/launch';

const tap = {
  what_the_user_wants_to_do_next_by_instruction: 'get the price of the first result',
  log: 'I will use action Tap to click on the search button next to the search bar.',
  error: undefined,
  more_actions_needed_by_instruction: true,
  action: { type: 'Tap', locate: { prompt: 'search button', bbox: [1107, 56, 1127, 76] } },
  sleep: 500,
};

const tab2 = {
  what_the_user_wants_to_do_next_by_instruction: 'login with the email and password',
  log: "I will use action Tap to click on the '登录' (Login) button first.",
  error: null,
  more_actions_needed_by_instruction: true,
  action: {
    type: 'Tap',
    locate: {
      bbox: [758, 579, 1039, 614],
      prompt: "'登录' (Login) button",
    },
  },
  sleep: 500,
};

const launchRes = await launchTool.invoke({ url: 'https://www.x.com', taskId: randomUUID() });

console.log('launchRes', launchRes);

const browserInstance = BROWSER_POOL.get(launchRes.taskId);

const pages = await browserInstance?.browser.pages();

const page = pages?.[0];

if (!page) {
  throw new Error('page not found');
}

await browserExecutor({
  executorInput: tab2 as any,
  taskId: launchRes.taskId,
  error: '',
  url: '',
  instruction: '',
  previousLogs: [],
  messages: [],
});
