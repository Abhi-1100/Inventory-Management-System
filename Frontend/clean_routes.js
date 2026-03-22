const fs = require('fs');
const path = require('path');

const targets = [
  'c:/odooXindus/frontend/src/app/login',
  'c:/odooXindus/frontend/src/app/signup',
  'c:/odooXindus/frontend/src/app/profile'
];

targets.forEach(dir => {
  const restDir = path.join(dir, '[[...rest]]');
  const srcFile = path.join(restDir, 'page.js');
  const destFile = path.join(dir, 'page.js');

  if (fs.existsSync(restDir)) {
    if (fs.existsSync(srcFile)) {
      // Copy content from restDir/page.js to dir/page.js
      fs.copyFileSync(srcFile, destFile);
      fs.unlinkSync(srcFile);
    }
    fs.rmdirSync(restDir, { recursive: true });
    console.log(`Cleaned up ${dir}`);
  }
});
