// run-migration.js - apply schema changes then regenerate prisma client
const { execSync } = require('child_process');

try {
  console.log('Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('Generating prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: __dirname
  });
  console.log('\nAll done! Restart your backend server to apply the changes.');
} catch (err) {
  console.error('Failed:', err.message);
  process.exit(1);
}
