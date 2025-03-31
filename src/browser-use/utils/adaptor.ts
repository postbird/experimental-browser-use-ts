import { TVLLMOutput } from './schema';

export const defaultBboxSize = 20;

/**
 * fix qwen-vl response json
 * @param json
 */
export const adaptQwenVLResponseJSON = (json: TVLLMOutput | any) => {
  if (json?.action?.locate?.bbox_2d) {
    json.action.locate.bbox = json.action.locate.bbox_2d;
    delete json.action.locate.bbox_2d;
  }

  if (json?.action?.locate?.bbox) {
    json.action.locate.bbox = adaptQwenBbox(json.action.locate.bbox);
  }

  return json;
};

/**
 * fix qwen-vl bbox data
 * @param bbox
 * @param errorMsg
 * @returns
 */
export function adaptQwenBbox(bbox: number[], errorMsg?: string): [number, number, number, number] {
  if (bbox.length < 2) {
    const msg = errorMsg || `invalid bbox data for qwen-vl mode: ${JSON.stringify(bbox)} `;
    throw new Error(msg);
  }

  const result: [number, number, number, number] = [
    Math.round(bbox[0]),
    Math.round(bbox[1]),
    typeof bbox[2] === 'number' ? Math.round(bbox[2]) : Math.round(bbox[0] + defaultBboxSize),
    typeof bbox[3] === 'number' ? Math.round(bbox[3]) : Math.round(bbox[1] + defaultBboxSize),
  ];
  return result;
}
