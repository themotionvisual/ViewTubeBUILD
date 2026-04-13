const fs = require('fs');
const babel = require('@babel/parser');
const code = fs.readFileSync('src/components/ToolboxUISystem.tsx', 'utf8');

try {
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("Parse OK");
} catch (e) {
  console.log("Babel Parse Error:", e.message);
}
