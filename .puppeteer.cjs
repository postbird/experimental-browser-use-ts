import findChrome from 'carlo/lib/find_chrome';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const { executablePath } = await findChrome({});

console.log('chrome executable path is: ', executablePath);

if(!executablePath) {
  console.error('Can not found local chrome, you can download it auto by `pnpm run puppeteer-install`');
}


/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Download Chrome (default `skipDownload: false`).
  chrome: {
    skipDownload: false,
  },
  // Download Firefox (default `skipDownload: true`).
  firefox: {
    skipDownload: true,
  },


  executablePath,

  cacheDirectory:join(__dirname, '.cache/puppeteer'),
};
