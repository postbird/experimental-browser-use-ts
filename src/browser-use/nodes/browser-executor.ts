import { Annotation, Command } from '@langchain/langgraph';
import { BROWSER_POOL, BrowserAgentAnnotation } from '../state';
import { defaultViewportHeight, defaultViewportWidth } from '../tools/launch';
import { sleep } from '../utils';
import { calculateClientCoordinates, scrollPage } from '../utils/dom';
import { TVLLMOutput } from '../utils/schema';

export const BrowserExecutorAnnotation = Annotation.Root({
  executorInput: Annotation<TVLLMOutput | undefined>({
    default: () => undefined,
    reducer: (_, input) => input,
  }),
});

export const ExecuteBrowserNodeAnnotation = Annotation.Root({
  ...BrowserAgentAnnotation.spec,
  ...BrowserExecutorAnnotation.spec,
});

export const browserExecutor = async (state: typeof ExecuteBrowserNodeAnnotation.State) => {
  const { executorInput, taskId } = state;

  console.log('[browser-executor] state ', state);

  const { browser } = BROWSER_POOL.get(taskId) || {};

  if (!browser) {
    throw new Error('browser not found');
  }

  const pages = await browser.pages();

  const page = pages[0];

  if (!executorInput) {
    throw new Error('executorInput not found');
  }

  console.log('[browser-executor] executorInput is', JSON.stringify(executorInput));

  const { action, sleep: waitForSleep } = executorInput;

  if (!action) {
    throw new Error('Action not found');
  }

  if (waitForSleep) {
    await sleep(waitForSleep);
  }

  const { type, locate, param } = action;

  if (type === 'Input' || type === 'Tap' || type === 'Hover') {
    if (!locate?.bbox) {
      throw new Error('Can not locate element');
    }

    const { width, height } = (await page.viewport()) || { width: defaultViewportWidth, height: defaultViewportHeight };

    const { scrollX, scrollY, devicePixelRatio } = await page.evaluate(() => {
      return {
        scrollX: window.scrollX || window.pageXOffset,
        scrollY: window.scrollY || window.pageYOffset,
        devicePixelRatio: window.devicePixelRatio,
      };
    });

    console.log('[browser-executor] scroll is', { scrollX, scrollY, devicePixelRatio });

    const { centerX, centerY } = await calculateClientCoordinates(locate.bbox);

    console.log('[browser-executor] centerX and centerY by bbox', centerX, centerY);

    const centerElement = await page.evaluateHandle(
      ({ centerX, centerY }) => {
        const element = document.elementFromPoint(centerX, centerY);
        return element;
      },
      { centerX, centerY },
    );

    console.log('[browser-executor] focusElementResult', centerElement);

    if (!centerElement) {
      return new Command({
        goto: 'browserAgent',
        update: {
          previousLogs: [],
        },
      });
    }

    if (type === 'Input' && param?.value) {
      console.log('[browser-executor] Input');
      await page.mouse.click(centerX, centerY);
      await page.evaluate(
        async (element, action, centerX, centerY) => {
          if (action.type === 'Input' && element && element.hasAttribute('value')) {
            // clear the current input values
            // @ts-expect-error
            element.value = '';
          }
        },
        centerElement,
        action,
        centerX,
        centerY,
      );
      await sleep(500);
      await page.keyboard.type(param.value);
    } else if (type === 'Tap') {
      console.log('[browser-executor] Tap by mouse {x,y}', centerX, centerY);
      await page.mouse.click(centerX, centerY);
    } else if (type === 'Hover') {
      console.log('[browser-executor] Hover');
      await page.mouse.move(centerX, centerY);
    }
  } else if (type === 'Scroll') {
    console.log('[browser-executor] Scroll');
    await scrollPage(page, action);
  }

  return new Command({
    goto: 'browserAgent',
    update: {
      previousLogs: [executorInput.log],
    },
  });
};
