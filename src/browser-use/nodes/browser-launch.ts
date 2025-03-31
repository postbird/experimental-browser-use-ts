import { BrowserAgentAnnotation } from '../state';
import { launchTool } from '../tools/launch';

export const launchBrowserNode = async (state: typeof BrowserAgentAnnotation.State) => {
  const { url, taskId } = state;

  await launchTool.invoke({ url, taskId });

  console.log('browser launch successfully');

  return {};
};
