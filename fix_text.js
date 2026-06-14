const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync('client/src').filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace the messy text classes with empty string
  content = content.replace(/text-slate-700/g, '');
  content = content.replace(/dark:text-slate-200/g, '');
  content = content.replace(/dark:text-slate-700/g, '');
  content = content.replace(/text-red-\d+/g, '');
  content = content.replace(/text-slate-\d+/g, '');
  content = content.replace(/text-gray-\d+/g, '');
  
  // For elements with a dark/vibrant background, inject text-white for legibility
  // We'll search for className="..." and if it contains certain bgs, ensure text-white is there
  content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    if (classes.includes('bg-primary') || classes.includes('bg-secondary') || classes.includes('bg-red-500') || classes.includes('bg-red-600') || classes.includes('bg-red-900') || classes.includes('bg-slate-800') || classes.includes('bg-slate-900')) {
      if (!classes.includes('text-white')) {
        return `className="${classes.trim()} text-white"`;
      }
    }
    // Clean up multiple spaces that might have been left by regex
    let cleaned = classes.replace(/\s+/g, ' ').trim();
    return `className="${cleaned}"`;
  });

  fs.writeFileSync(file, content);
});
console.log('Done fixing text legibility.');
