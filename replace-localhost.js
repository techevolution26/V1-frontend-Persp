// replace-localhost.js

const fs = require('fs');
const path = require('path');

const BASE_DIR = './';
const targetURL = 'http://localhost:8000';
const replacement = '${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      walk(full, callback);
    } else if (/\.(js|ts|jsx|tsx)$/.test(full)) {
      callback(full);
    }
  });
}

function replaceInFile(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`(['"\`])${targetURL}`, 'g');

  if (regex.test(content)) {
    const newContent = content.replace(regex, '`' + replacement);
    console.log(`${dryRun ? '[DRY-RUN]' : '[UPDATED]'} ${filePath}`);
    if (!dryRun) fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

// Running script
const dryRun = process.argv.includes('--apply') === false;

console.log(dryRun ? '🔍 Running in DRY-RUN mode...' : ' Applying changes...');
walk(BASE_DIR, (file) => replaceInFile(file, dryRun));
