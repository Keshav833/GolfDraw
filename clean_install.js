const { execSync } = require('child_process');

console.log('--- Cleaning lockfiles and cache ---');
try {
  execSync('rmdir /s /q node_modules .next', { stdio: 'inherit' });
  execSync('del package-lock.json', { stdio: 'inherit' });
} catch {
  console.log('Cache wipe error (safe to ignore if files were already gone)');
}

console.log('--- Running fresh npm install ---');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('--- Install Successful ---');
} catch (e) {
  console.error('Npm install failed:', e.message);
}
