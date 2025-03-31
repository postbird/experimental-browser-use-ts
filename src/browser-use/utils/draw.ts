import { Jimp } from 'jimp';

export async function drawRectangleOnImage(
  imagePath: any,
  outputPath: any,
  rectangle: [number, number, number, number],
) {
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
