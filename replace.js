const fs = require('fs');
const contents = fs.readFileSync('src/App.tsx', 'utf8');
const newContents = contents.replace(/<button className="w-full bg-/g, '<button type="submit" className="w-full bg-');
fs.writeFileSync('src/App.tsx', newContents);
console.log('done');
