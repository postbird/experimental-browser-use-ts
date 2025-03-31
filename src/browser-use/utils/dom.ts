import { Page } from 'puppeteer';
import { z } from 'zod';
import { sleep } from '.';
import { ActionSchema } from './schema';

/**
 * calculate clientX and clientY from bbox data
 * @param _bbox - [left, top, right, bottom]
 * @returns
 */
export const calculateClientCoordinates = (_bbox: number[]) => {
  const [topLeftX, topLeftY, bottomRightX, bottomRightY] = _bbox;

  const centerX = topLeftX + (bottomRightX - topLeftX) / 2;
  const centerY = topLeftY + (bottomRightY - topLeftY) / 2;

  return { centerX, centerY };
};

/**
 * scroll page
 * @param page - puppeteer.Page
 * @param params - ActionSchema
 */
export const scrollPage = async (page: Page, params: z.infer<typeof ActionSchema>) => {
  const { direction, scrollType, distance } = params.param || {};

  const scrollAmount = distance ?? 100; // 默认滚动距离

  const scrollOnce = async () => {
    switch (direction) {
      case 'down':
        await page.evaluate(scrollAmount => window.scrollBy(0, scrollAmount), scrollAmount);
        break;
      case 'up':
        await page.evaluate(scrollAmount => window.scrollBy(0, -scrollAmount), scrollAmount);
        break;
      case 'right':
        await page.evaluate(scrollAmount => window.scrollBy(scrollAmount, 0), scrollAmount);
        break;
      case 'left':
        await page.evaluate(scrollAmount => window.scrollBy(-scrollAmount, 0), scrollAmount);
        break;
    }
  };

  const scrollUntil = async (condition: () => Promise<boolean>) => {
    while (!(await condition())) {
      await scrollOnce();
      await sleep(100);
    }
  };

  switch (scrollType) {
    case 'once':
      await scrollOnce();
      break;
    case 'untilBottom':
      await scrollUntil(async () => {
        return await page.evaluate(() => window.innerHeight + window.scrollY >= document.body.scrollHeight);
      });
      break;
    case 'untilTop':
      await scrollUntil(async () => {
        return await page.evaluate(() => window.scrollY === 0);
      });
      break;
    case 'untilRight':
      await scrollUntil(async () => {
        return await page.evaluate(() => window.innerWidth + window.scrollX >= document.body.scrollWidth);
      });
      break;
    case 'untilLeft':
      await scrollUntil(async () => {
        return await page.evaluate(() => window.scrollX === 0);
      });
      break;
  }
};
