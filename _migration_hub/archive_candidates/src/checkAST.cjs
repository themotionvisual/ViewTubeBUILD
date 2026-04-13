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

  // Manual stack to find unclosed div
  let stack = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let re = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
    let match;
    while ((match = re.exec(line)) !== null) {
      if (match[0].endsWith('/>')) continue;
      
      const tag = match[1];
      if (match[0].startsWith('</')) {
        if (stack.length > 0 && stack[stack.length - 1].tag === tag) {
           stack.pop();
        }
      } else {
        stack.push({ tag, line: i + 1, col: match.index });
      }
    }
  }
  
  if (stack.length > 0) {
    console.log("Unclosed tags remaining in stack:", stack.map(s => `<${s.tag}> at line ${s.line}`).join(', '));
  }
}
