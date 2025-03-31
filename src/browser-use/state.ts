import { Annotation, MessagesAnnotation } from '@langchain/langgraph/web';
import { randomUUID } from 'crypto';
import { Browser } from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

export const BROWSER_POOL = new Map<string, { browser: Browser; recorder: PuppeteerScreenRecorder | null }>();

export interface IRuntimeConfiguration {}

const BrowserUseAnnotation = Annotation.Root({
  error: Annotation<string>({
    default: () => '',
    reducer: (_prev, next) => next,
  }),
  taskId: Annotation<string>({
    default: () => `${Date.now()}-${randomUUID()}`,
    reducer: prev => prev,
  }),
  url: Annotation<string>({
    default: () => '',
    reducer: (_prev, next) => next,
  }),
  instruction: Annotation<string>({
    default: () => '',
    reducer: (_prev, next) => next,
  }),
  previousLogs: Annotation<string[]>({
    default: () => [],
    reducer: (_prev, next) => [..._prev, ...next],
  }),
});

export const BrowserAgentAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  ...BrowserUseAnnotation.spec,
});

export const ConfigurableAnnotation = Annotation.Root({});
