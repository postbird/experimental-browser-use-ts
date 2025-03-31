import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { readFile } from 'fs/promises';
import { Jimp } from 'jimp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getVLLM } from '../llm';

const __dirname = dirname(fileURLToPath(import.meta.url));

const source = join(__dirname, './twitter.jpeg');

const file = await readFile(source);

const base64 = file.toString('base64');

const dataUrl = `data:image/jpeg;base64,${base64}`;

const vllm = getVLLM();

export const res = await vllm.invoke([
  new HumanMessage({
    content: [
      { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
      {
        type: 'text',
        text: '你的任务是识别图片中的登录按钮，精确计算出左上角和右下角的坐标，返回格式 [leftX, leftY, rightX, rightY]，leftX和leftY是左上角的坐标，rightX和rightY是右下角的坐标',
      },
    ],
  }),
  new AIMessage({
    content:
      '登录按钮的左上角和右下角坐标如下：\n\n- 左上角坐标 (leftX, leftY): [758, 579]\n- 右下角坐标 (rightX, rightY): [1038, 612]\n\n因此，返回格式为：[758, 579, 1038, 612]',
  }),
  new HumanMessage({
    content: [
      {
        type: 'text',
        text: '根据你的识别结果，发现识别的位置不准确，存在偏差，反思识别过程，给出偏差的原因并给出新的结果',
      },
    ],
  }),
]);

async function addImageBorder(inputPath, outputPath, [left, top, right, bottom]) {
  try {
    // 加载图片并验证坐标有效性
    const image = await Jimp.read(inputPath);
    const { width, height } = image.bitmap;
    // 坐标边界检查
    if (left >= right || top >= bottom || left < 0 || right > width || top < 0 || bottom > height) {
      throw new Error('Invalid coordinates');
    }
    // 绘制红色边框（默认3像素宽度）
    const strokeWidth = 3;
    const red = 0xff0000ff; // 格式：0xRRGGBBAA
    // 绘制四条边
    for (let x = left; x <= right; x++) {
      for (let w = 0; w < strokeWidth; w++) {
        image.setPixelColor(red, x, top + w); // 上边
        image.setPixelColor(red, x, bottom - w); // 下边
      }
    }
    for (let y = top; y <= bottom; y++) {
      for (let w = 0; w < strokeWidth; w++) {
        image.setPixelColor(red, left + w, y); // 左边
        image.setPixelColor(red, right - w, y); // 右边
      }
    }
    // 保存图片并保持原格式
    const ext = inputPath.split('.').pop().toLowerCase();
    await image.write(outputPath);
    console.log(`Bordered image saved to: ${outputPath}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

const outputPath = join(__dirname, './twitter-border.jpeg');

addImageBorder(
  source,
  outputPath,
  [758, 579, 1038, 612].map(item => item * 2),
);

console.log('res', res);
