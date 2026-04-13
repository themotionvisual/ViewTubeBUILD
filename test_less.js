const less = require('less');
const fs = require('fs');
const path = '/Users/cwb/.local/state/crossnote/style.less';
const code = fs.readFileSync(path, 'utf8');

less.render(code)
  .then((output) => {
    console.log('COMPILATION SUCCESSFUL');
  })
  .catch((e) => {
    console.error('COMPILATION ERROR:', e.message);
    console.error('Line:', e.line, 'Column:', e.column);
    process.exit(1);
  });
