const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '../dist');
console.log('Dist path:', distPath);

console.log('Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Ensure 404.html exists for GitHub Pages routing
fs.copyFileSync(path.join(distPath, 'index.html'), path.join(distPath, '404.html'));

// Remove old .git in dist if exists
const distGit = path.join(distPath, '.git');
if (fs.existsSync(distGit)) {
  fs.rmSync(distGit, { recursive: true, force: true });
}

execSync('git init', { cwd: distPath, stdio: 'inherit' });
execSync('git checkout -b gh-pages', { cwd: distPath, stdio: 'inherit' });
execSync('git add -A', { cwd: distPath, stdio: 'inherit' });
execSync('git commit -m "Deploy Rocket League 2D with Online Multiplayer & AI Bots"', { cwd: distPath, stdio: 'inherit' });

console.log('Pushing to origin (orbit-good/rocket)...');
try {
  execSync('git remote add origin https://github.com/orbit-good/rocket.git', { cwd: distPath, stdio: 'inherit' });
  execSync('git push -f origin gh-pages', { cwd: distPath, stdio: 'inherit' });
  console.log('Successfully pushed to orbit-good/rocket!');
} catch (e) {
  console.error('Failed to push to origin:', e.message);
}

console.log('Pushing to public-deploy (Jebrik12/rocket-league-2d)...');
try {
  execSync('git remote add public https://github.com/Jebrik12/rocket-league-2d.git', { cwd: distPath, stdio: 'inherit' });
  execSync('git push -f public gh-pages', { cwd: distPath, stdio: 'inherit' });
  console.log('Successfully pushed to Jebrik12/rocket-league-2d!');
} catch (e) {
  console.error('Failed to push to public:', e.message);
}

// Clean up .git in dist
fs.rmSync(distGit, { recursive: true, force: true });
