const seleniumAssistant = require('selenium-assistant');

const browserDownloads = [
  seleniumAssistant.downloadFirefoxDriver(),
  seleniumAssistant.downloadBrowser('chrome', 'stable'),
  seleniumAssistant.downloadBrowser('chrome', 'beta'),
  seleniumAssistant.downloadBrowser('chrome', 'unstable'),
  seleniumAssistant.downloadBrowser('firefox', 'stable'),
  seleniumAssistant.downloadBrowser('firefox', 'beta'),
  seleniumAssistant.downloadBrowser('firefox', 'unstable')
];

// Download Opera on OS X results in a pop-up with questions - no automation
if (process.platform !== 'darwin') {
  browserDownloads.push(
    seleniumAssistant.downloadBrowser('opera', 'stable')
  );
  browserDownloads.push(
    seleniumAssistant.downloadBrowser('opera', 'beta')
  );
  browserDownloads.push(
    seleniumAssistant.downloadBrowser('opera', 'unstable')
  );
}

Promise.all(browserDownloads)
.then(() => {
  console.log('Browser download complete.');
});
