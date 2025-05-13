const fs = require('fs');
const path = require('path');

const effectHandlers = {};

const files = fs.readdirSync(__dirname);
for (const file of files) {
  if (file === 'index.js') continue;
  const effectName = path.basename(file, '.js');
  effectHandlers[effectName] = require(path.join(__dirname, file));
}

module.exports = effectHandlers;
