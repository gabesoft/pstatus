const exec = require('child_process').exec;
const cmd = `ps p ${process.pid} -o pid=,%cpu=,%mem=,lstart=,etime=,user=,comm=,args=`;

/**
 * Convert an elapse time string into a number of milliseconds
 */
function parseElapsedTime(str) {
  const pattern = /^(?:(\d?\d)-)?(?:(\d?\d):)?(\d\d)[:.](\d\d)$/;
  const duration = pattern.exec(str) || [];

  return {
    days: duration[1],
    hours: duration[2],
    minutes: duration[3],
    seconds: duration[4]
  };
}

/**
 * Gets the status of the currently running process.
 * @param {Function} cb The callback that will be called with the results
 */
function status(cb) {
  exec(cmd, (err, stdout) => {
    if (err) {
      return cb(err);
    }

    const fields = stdout.split(/\s+/);
    const data = {
      pid: fields[0],
      cpu: parseFloat(fields[1]),
      mem: parseFloat(fields[2]),
      stime: new Date(`${fields[3]} ${fields[4]} ${fields[5]} ${fields[6]} ${fields[7]}`),
      etime: parseElapsedTime(fields[8]),
      user: fields[9],
      command: fields[10],
      args: fields[11]
    };

    cb(null, data);
  });
}

module.exports = status;
