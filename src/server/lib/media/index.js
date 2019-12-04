const { execFileSync } = require('child_process');

exports.play = function play(file) {
  execFileSync('play', [file], {
    cwd: '/home/pi/Music/Sounds/Comical Effects',
  });
};
