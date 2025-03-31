import { BrowserAgentAnnotation } from '../state';
import { dropTool } from '../tools/drop';

export const dropBrowserNode = async (state: typeof BrowserAgentAnnotation.State) => {
  const { taskId } = state;

  const res = await dropTool.invoke({ taskId });

  console.log('🔎 ➡️ browser-drop.ts:9 ➡️ dropBrowserNode ➡️ res:', res);

  return {};
};
