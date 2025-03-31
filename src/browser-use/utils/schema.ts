import { z } from 'zod';

const supportedActions = ['Launch', 'Tap', 'Hover', 'Input', 'KeyboardPress', 'Scroll'] as const;

const LocateSchema = z.object({
  bbox: z.array(z.number()).length(4).describe('The bounding box of the element'),
  prompt: z.string(),
});

const ActionParamSchema = z.object({
  value: z.string().optional().describe('The value to input or press'),
  direction: z.enum(['down', 'up', 'right', 'left']).optional().default('down').describe('The direction to scroll'),
  scrollType: z
    .enum(['once', 'untilBottom', 'untilTop', 'untilRight', 'untilLeft'])
    .optional()
    .default('once')
    .describe('The scroll type'),
  distance: z.number().nullable().optional().describe('The distance to scroll'),
});

export const ActionSchema = z.object({
  type: z.enum(supportedActions).optional().describe('action type'),
  locate: LocateSchema.optional(),
  param: ActionParamSchema.optional(),
});

/**
 * vl model output schema
 */
export const VLLMOutputSchema = z
  .object({
    what_the_user_wants_to_do_next_by_instruction: z
      .string()
      .optional()
      .describe('What the user wants to do according to the instruction and previous logs'),
    log: z
      .string()
      .optional()
      .describe(
        `Log what the next one action (ONLY ONE!) you can do according to the screenshot and the instruction. The typical log looks like "I will use action {{ action-type }} to do .. first". If no action should be done, log the reason. ". Use the same language as the user's instruction`,
      ),
    error: z
      .string()
      .optional()
      .describe(
        `Error messages about unexpected situations, if any. Only think it is an error when the situation is not expected according to the instruction. Use the same language as the user's instruction.`,
      ),
    more_actions_needed_by_instruction: z
      .boolean()
      .optional()
      .describe(
        ` Consider if there is still more action(s) to do after the action in "Log" is done, according to the instruction. If so, set this field to true. Otherwise, set it to false.`,
      ),
    action: z.union([ActionSchema, z.null()]).optional().describe('action or null if no need more actions'),
    sleep: z.number().positive().optional().optional().describe('The sleep time after the action, in milliseconds'),
    result: z.number().optional().describe('The result of the task'),
  })
  .strict();

export type TVLLMOutput = z.infer<typeof VLLMOutputSchema>;
