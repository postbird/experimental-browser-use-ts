import { randomUUID } from 'crypto';
import { BROWSER_POOL } from '../state';
import { launchTool } from '../tools/launch';

export const llmOutput = {
  what_the_user_wants_to_do_next_by_instruction:
    "find the search bar, and search for 'iphone', and get the price of the first result",
  log: "I will use action Input to enter 'iphone' in the search bar first.",
  error: null,
  more_actions_needed_by_instruction: true,
  action: {
    type: 'Input',
    locate: {
      bbox: [251, 69, 783, 84],
      prompt: 'The search bar',
    },
    param: {
      value: 'iphone',
    },
  },
};

const launchRes = await launchTool.invoke({ url: 'https://www.ebay.com', taskId: randomUUID() });

console.log('launchRes', launchRes);

const browserInstance = BROWSER_POOL.get(launchRes.taskId);

if (!browserInstance?.browser) {
  throw new Error('browser not found');
}

const pages = await browserInstance?.browser.pages();

const page = pages[0];

if (!page) {
  throw new Error('page not found');
}

// 计算输入框中心坐标
const bbox = llmOutput.action?.locate?.bbox;

function calculateClientCoordinates(_bbox) {
  const [left, top, right, bottom] = _bbox;
  const clientX = left + (right - left) / 2;
  const clientY = top + (bottom - top) / 2;
  return { clientX, clientY };
}

const { clientX, clientY } = calculateClientCoordinates(bbox);

console.log('🔎 ➡️ puppeteer.test.ts:46 ➡️ clientX, clientY:', clientX, clientY);

const el = await page.evaluate(
  async (x, y) => {
    const element = document.elementFromPoint(x, y);

    await (element as any)?.focus?.();
  },
  clientX,
  clientY,
);

await page.keyboard.type('iphone');

console.log('🔎 ➡️ puppeteer.test.ts:58 ➡️ el:', el);
