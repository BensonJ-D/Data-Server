const util = require('util');
const spawn = require('child_process').spawn;
const python = spawn('python', ['random_data.py']);

python.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

python.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

python.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

