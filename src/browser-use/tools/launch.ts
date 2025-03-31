import { tool } from '@langchain/core/tools';
import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import { z } from 'zod';
import { BROWSER_POOL } from '../state';
import { getLogFilePath, sleep } from '../utils';

interface LaunchInput {
  url: string;
  taskId: string;
}

export const defaultUA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

export const defaultViewportWidth = 1440;

export const defaultViewportHeight = 768;

export const defaultViewportScale = process.platform === 'darwin' ? 2 : 1;

export const defaultWaitForNetworkIdleTimeout = 3 * 1000;

const run = async (params: LaunchInput) => {
  const { url, taskId } = params;

  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS === 'true',
    timeout: 3_1000,
    defaultViewport: {
      width: defaultViewportWidth,
      height: defaultViewportHeight,
      deviceScaleFactor: defaultViewportScale,
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-features=PasswordLeakDetection',
      '--disable-save-password-bubble',
      `--user-agent="${defaultUA}"`,
      `--start-maximized`,
    ],
  });

  const pages = await browser.pages();

  await Promise.all(pages.map(page => page.close()));

  const page = await browser.newPage();

  console.log(new Date().toString(), 'page created');

  const recorder = new PuppeteerScreenRecorder(page);

  await page.goto(url, { timeout: 0 });

  const filePath = getLogFilePath(`${taskId}/recorder.mp4`);

  await recorder.start(filePath);

  try {
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: defaultWaitForNetworkIdleTimeout,
    });
  } catch (err) {}

  // keep urls are opened in the same tab
  page.on('popup', async popup => {
    if (!popup) {
      console.warn('got a popup event, but the popup is not ready yet, skip');
      return;
    }
    const url = await popup.url();
    await popup.close(); // Close the newly opened TAB
    await page.goto(url, { timeout: 0 });

    try {
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: defaultWaitForNetworkIdleTimeout,
      });
    } catch (err) {}
  });

  await sleep(2000);

  BROWSER_POOL.set(taskId, { browser, recorder });

  console.log(new Date().toString(), 'browser launched, navigated to ', url);

  return {
    success: true,
    taskId,
  };
};

export const launchTool = tool(run, {
  name: 'launch',
  description: `Use this tool to launch a web browser and open a new page to navigate to a specific URL.`,
  schema: z.object({
    url: z.string().describe('The url to use browser'),
    taskId: z.string().describe('The task id to identify the browser'),
  }),
});
