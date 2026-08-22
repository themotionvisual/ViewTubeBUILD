const fs = require('fs');

const filePath = '/Users/cwb/Downloads/viewtube/docs/TOOLS + Widgets/ULTIMATE_PROJECT_INDEX copy.md';
console.log('Reading file:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

console.log('Original size:', content.length);

// We want to turn:
// ### [Link Text](link url)
// 
// - **Description**: ...
// - **Iterations Merged**: ...
//
// Into:
// :::sub [Link Text](link url)
// - **Description**: ...
// - **Iterations Merged**: ...
// :::

// Regex to capture:
// 1. Title/Link
// 2. The entire body of bullet points up to the next double newline or EOF
const blockRegex = /^###\s+([^\n]+)\s*\n+([\s\S]*?)(?=\n###|\n##|\n#|$)/gm;

let matchCount = 0;
content = content.replace(blockRegex, (match, title, body) => {
    matchCount++;
    // Trim the body so there are no trailing new lines inside the subtoolbox
    const cleanBody = body.trim();
    return `:::sub ${title}\n${cleanBody}\n:::\n`;
});

console.log(`Replaced ${matchCount} module blocks with SubToolbox syntax.`);

fs.writeFileSync(filePath, content);
console.log('Update complete.');
