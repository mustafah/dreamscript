const { execSync } = require('child_process');

function installClipboardImage() {
  try {
    console.log("Installing save-clipboard-image for macOS...");
    execSync("npm install save-clipboard-image");
    console.log("save-clipboard-image installed successfully.");
  } catch (error) {
    console.error("Failed to install save-clipboard-image:", error);
  }
}

if (process.platform === 'darwin') {
  installClipboardImage();
}
