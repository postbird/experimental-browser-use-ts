import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { BROWSER_POOL } from '../state';

interface DropInput {
  taskId: string;
}

const run = async (params: DropInput) => {
  const { taskId } = params;

  const browserTask = BROWSER_POOL.get(taskId);

  if (!browserTask?.browser) {
    return {
      success: false,
      taskId,
      message: 'browser not found',
    };
  }

  await browserTask.recorder?.stop();

  browserTask.recorder = null; // release memory

  await browserTask.browser.close();

  BROWSER_POOL.delete(taskId);

  return {
    success: true,
    taskId,
  };
};

export const dropTool = tool(run, {
  name: 'drop',
  description: `Use this tool to drop a web browser and close the page.`,
  schema: z.object({
    taskId: z.string().describe('The task id to identify the browser'),
  }),
});
