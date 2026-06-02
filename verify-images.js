const fs = require('fs');
const path = require('path');

const dirs = [
  'public/images/football',
  'public/images/celebrities',
  'public/images/cartoons'
];

dirs.forEach(dir => {
  const fullDir = path.join(__dirname, dir);
  if (!fs.existsSync(fullDir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }

  console.log(`\nChecking directory: ${dir}`);
  const files = fs.readdirSync(fullDir);
  files.forEach(file => {
    const filePath = path.join(fullDir, file);
    const stats = fs.statSync(filePath);
    
    // Read the first 20 bytes to check the file signature
    const buffer = Buffer.alloc(20);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 20, 0);
    fs.closeSync(fd);

    const isHtml = buffer.toString('utf8').includes('<!DOCTYPE') || buffer.toString('utf8').includes('<html');
    const signature = buffer.toString('hex');
    
    console.log(`- ${file}: Size = ${stats.size} bytes | Is HTML? = ${isHtml} | Hex Sig = ${signature.slice(0, 16)}`);
  });
});
