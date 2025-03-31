import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const safeWriteFile = async (filePath, ...args: any[]) => {
  const targetDir = dirname(filePath);

  try {
    await mkdir(targetDir, {
      recursive: true,
      mode: 0o755,
    });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  await writeFile(filePath, args);
};

export const getLogFilePath = (filename: string) => {
  return join(__dirname, `../../../${process.env.LOG_STORAGE_DIR}/${filename}`);
};

export const safeWriteLogFile = async (filename: string, ...args: any[]) => {
  const path = getLogFilePath(filename);
  await safeWriteFile(path, args);
};
