const fs = require('fs');
const path = require('path');

const scale = 2; // Increase font sizes by 2px

function processFile(filePath, regexes) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacer } of regexes) {
    content = content.replace(regex, replacer);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`No changes in ${filePath}`);
  }
}

// 1. CSS font-size
const cssRegex = {
  regex: /(font-size:\s*)(\d+)(px)/g,
  replacer: (match, prefix, size, suffix) => {
    return `${prefix}${parseInt(size, 10) + scale}${suffix}`;
  }
};

// 2. React inline fontSize (number)
const reactNumRegex = {
  regex: /(fontSize:\s*)(\d+)(?!\s*px)(?=[,}])/g,
  replacer: (match, prefix, size) => {
    return `${prefix}${parseInt(size, 10) + scale}`;
  }
};

// 3. React inline fontSize (string with px)
const reactStrRegex = {
  regex: /(fontSize:\s*["'])(\d+)(px["'])/g,
  replacer: (match, prefix, size, suffix) => {
    return `${prefix}${parseInt(size, 10) + scale}${suffix}`;
  }
};

const files = [
  path.join(__dirname, 'app', 'globals.css'),
  path.join(__dirname, 'app', 'page.tsx')
];

for (const file of files) {
  processFile(file, [cssRegex, reactNumRegex, reactStrRegex]);
}
