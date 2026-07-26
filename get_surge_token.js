const { spawn } = require('child_process');
const surge = spawn('npx', ['surge', 'token'], { stdio: ['pipe', 'pipe', 'pipe'] });

surge.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('stdout:', output);
  if (output.includes('email:')) {
    surge.stdin.write('slaekhoa@gmail.com\n');
  }
  if (output.includes('password:')) {
    surge.stdin.write('khoadz123\n');
  }
});

surge.stderr.on('data', (data) => {
  console.error('stderr:', data.toString());
});
