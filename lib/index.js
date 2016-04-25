const exec = require('child_process').exec;
const cmd = `ps p ${process.pid} -o pid=,%cpu=,%mem=,lstart=,etime=,user=,comm=,args=`;
const moment = require('moment');

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

function parseDate(str) {
  return moment(str, 'ddd MMM DD H:m:s YYYY').valueOf();
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

    const pattern = /^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+\s+\S+\s+\S+\s+\S+\s+\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/;
    const fields = pattern.exec((stdout || '').trim()) || [];

    const data = {
      pid: fields[1],
      cpu: parseFloat(fields[2]),
      mem: parseFloat(fields[3]),
      stime: parseDate(fields[4]),
      etime: parseElapsedTime(fields[5]),
      user: fields[6],
      command: fields[7],
      args: fields[8]
    };

    cb(null, data);
  });
}

module.exports = status;
