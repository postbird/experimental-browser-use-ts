import { Jimp } from 'jimp';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const source = join(__dirname, './twitter.jpeg');

async function drawRectangleOnImage(imagePath, outputPath, rectangle) {
  const [leftX, leftY, rightX, rightY] = rectangle;
  try {
    const image = await Jimp.read(imagePath);
    const red = 0xff0000ff;
    // 绘制顶部边框
    for (let x = leftX; x <= rightX; x++) {
      image.setPixelColor(red, x, leftY);
    }
    // 绘制底部边框
    for (let x = leftX; x <= rightX; x++) {
      image.setPixelColor(red, x, rightY);
    }
    // 绘制左侧边框
    for (let y = leftY; y <= rightY; y++) {
      image.setPixelColor(red, leftX, y);
    }
    // 绘制右侧边框
    for (let y = leftY; y <= rightY; y++) {
      image.setPixelColor(red, rightX, y);
    }
    await image.write(outputPath);
    console.log('Image with rectangle saved to:', outputPath);
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

const outputPath = join(__dirname, `./twitter-border-${Date.now()}.jpeg`);

drawRectangleOnImage(
  source,
  outputPath,
  [758, 579, 1038, 612].map(item => item * 2),
);
