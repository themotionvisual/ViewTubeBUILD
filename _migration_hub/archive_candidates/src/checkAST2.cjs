const fs = require('fs');
const babel = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('src/components/ToolboxUISystem.tsx', 'utf8');

try {
  babel.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("Parse OK");
} catch (e) {
  console.log("Babel Parse Error:", e.message);
  console.log("Loc:", e.loc);

  // Since it failed to parse, AST traversal won't work either!
}
// But wait, babel throws on the very first unhandled error. Let's just output the few lines leading up to the error.
const lines = code.split('\n');
console.log("Context around error:");
const errLine = 994; // from Babel output
for(let i = errLine - 5; i <= errLine + 5; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
