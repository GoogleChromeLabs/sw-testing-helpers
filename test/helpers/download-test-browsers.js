const seleniumAssistant = require('selenium-assistant');

const promises = [
  seleniumAssistant.downloadFirefoxDriver(),
  seleniumAssistant.downloadBrowser('chrome', 'stable', true),
  seleniumAssistant.downloadBrowser('chrome', 'beta', true),
  seleniumAssistant.downloadBrowser('chrome', 'unstable', true),
  seleniumAssistant.downloadBrowser('firefox', 'stable', true),
  seleniumAssistant.downloadBrowser('firefox', 'beta', true),
  seleniumAssistant.downloadBrowser('firefox', 'unstable', true)
];

if (process.platform === 'linux') {
  promises.push(seleniumAssistant.downloadBrowser('opera', 'stable', true));
  promises.push(seleniumAssistant.downloadBrowser('opera', 'beta', true));
  promises.push(seleniumAssistant.downloadBrowser('opera', 'unstable', true));
}

Promise.all(promises)
.then(() => {
  console.log('Browser download complete.');
});
