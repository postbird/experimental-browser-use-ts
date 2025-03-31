import { StateGraph } from '@langchain/langgraph/web';
import { browserAgent } from './nodes/browser-agent';
import { dropBrowserNode } from './nodes/browser-drop';
import { browserExecutor, ExecuteBrowserNodeAnnotation } from './nodes/browser-executor';
import { launchBrowserNode } from './nodes/browser-launch';
import { coordinatorAgent } from './nodes/coordinator-agent';
import { BrowserAgentAnnotation, ConfigurableAnnotation } from './state';

export const graphBuilder = new StateGraph(BrowserAgentAnnotation, ConfigurableAnnotation)
  .addNode('coordinatorAgent', coordinatorAgent, { ends: ['dropBrowser', 'launchBrowser'] })
  .addNode('launchBrowser', launchBrowserNode)
  .addNode('dropBrowser', dropBrowserNode)
  .addNode('browserAgent', browserAgent, { ends: ['coordinatorAgent', 'browserExecutor'] })
  .addNode('browserExecutor', browserExecutor, { ends: ['browserAgent'], input: ExecuteBrowserNodeAnnotation })
  .addEdge('__start__', 'coordinatorAgent')
  .addEdge('launchBrowser', 'browserAgent')
  .addEdge('dropBrowser', '__end__');

const graph = graphBuilder.compile();

graph.getGraphAsync().then(graph => {
  console.log('graph mermaid is \n', graph.drawMermaid());
});

export { graph };
