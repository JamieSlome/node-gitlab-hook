
/*
  Inspired by https://github.com/nlf/node-github-hook

  Rolf Niepraschk (Rolf.Niepraschk@gmx.de)
*/

var Http = require('http');
var Url = require('url');
var Fs = require('fs');
var execFile = require('child_process').execFile;
var Path = require('path');
var Tmp = require('tmp');
var Util = require('util');
var inspect = Util.inspect;
var isArray = Util.isArray;

var GitLabHook = function(options) {
  if (!(this instanceof GitLabHook)) return new GitLabHook(options);
  options = options || {};
  this.config = options.config || 'gitlabhook.conf';
  this.port = options.port || 3420;
  this.host = options.host || '0.0.0.0';
  this.cmdshell = options.cmdshell || '/bin/sh';
  this.keep = (typeof options.keep === 'undefined') ? false : options.keep;
  this.logger = options.logger || { log: function(){}, error: function(){} };
  var cfg = readConfigFile(this.config);
  if (cfg) {
    this.logger.log('loading config file: ', this.config);
    this.logger.log('config file:\n', Util.inspect(cfg));
    for (var i in cfg) options[i] = cfg[i];
  } else {
    this.logger.error('[GitLabHook] error reading config file: ',
      this.config);
  }

  var active = false, tasks = options.tasks;
  if (typeof tasks === 'object' && Object.keys(tasks).length && !isArray(tasks)) {
    this.tasks = tasks;
    active = true;
  }

  var self = this;
  self.logger.log('self: ' + inspect(self) + '\n');


  if (active) this.server = Http.createServer(serverHandler.bind(this));
};

GitLabHook.prototype.listen = function(callback) {
  var self = this;
  if (typeof self.server !== 'undefined') {
    self.server.listen(self.port, self.host, function () {
      self.logger.log(Util.format(
        'listening for github events on %s:%d', self.host, self.port));
      if (typeof callback === 'function') callback();
    });
  } else {
    self.logger.log('server disabled');
  }
};

function readConfigFile(file) {
  try {
    var data = Fs.readFileSync(file, 'utf-8');
    return parse(data);
  } catch(err) {
    return false;
  }
}

function parse(data) {
    var result;
    try {
        result = JSON.parse(data);
    } catch (e) {
        result = false;
    }
    return result;
}

function reply(statusCode, res) {
  var headers = {
    'Content-Length': 0
  };
  res.writeHead(statusCode, headers);
  res.end();
}

function serverHandler(req, res) {
  var self = this;
  var url = Url.parse(req.url, true);
  var buffer = [];
  var bufferLength = 0;
  var failed = false;
  var remoteAddress = req.ip || req.socket.remoteAddress || req.socket.socket.remoteAddress;

  req.on('data', function (chunk) {
    if (failed) return;
    buffer.push(chunk);
    bufferLength += chunk.length;
  });

  req.on('end', function (chunk) {
    if (failed) return;
    var data;

    if (chunk) {
      buffer.push(chunk);
      bufferLength += chunk.length;
    }

    self.logger.log(Util.format('received %d bytes from %s\n\n', bufferLength, remoteAddress));

    data = Buffer.concat(buffer, bufferLength).toString();
    data = parse(data);

    // invalid json
    if (!data || !data.repository || !data.repository.name) {
       self.logger.error(Util.format('received invalid data from %s, returning 400\n\n', remoteAddress));
      return reply(400, res);
    }

    reply(200, res);

    var repo = data.repository.name;
    var lastCommit = data.commits[data.commits.length-1];
    var map = {
      '%r': repo,
      '%g': data.repository.url,
      '%u': data.user_name,
      '%b': data.ref,
      '%i': lastCommit.id,
      '%t': lastCommit.timestamp,
      '%m': lastCommit.message,
      '%s': remoteAddress
    }

    self.logger.log(Util.format('got event on %s:%s from %s\n\n', repo, data.ref, remoteAddress));
    self.logger.log(Util.inspect(data, { showHidden: true, depth: 10 }) + '\n\n');

    var cmds = getCmds(self.tasks, map, repo);

    if (cmds.length > 0) {

      self.logger.log('cmds: ' + inspect(cmds) + '\n');

      function execute(path, idx) {
        if (idx == cmds.length) return;
        var fname = Path.join(path, 'task-' + pad(idx, 3));
        Fs.writeFile(fname, cmds[idx], function (err) {
          if (err) {
            self.logger.error('File creation error: ' + err);
            return;
          }
          self.logger.log('File created: ' + fname);
          execFile(self.cmdshell, [ fname ], { cwd:path, env:process.env },
            function (err, stdout, stderr) {
            if (err) {
              self.logger.error('Exec error: ' + err);
            } else {
              self.logger.log('Executed: ' + self.cmdshell + ' ' + fname);
              process.stdout.write(stdout);
            }
            process.stderr.write(stderr);
            execute(path, ++idx);
          });
        });
      }

      Tmp.dir({ prefix:'gitlabhook-', keep:self.keep, unsafeCleanup:true },
        function (err, path) {
        if (err) {
          self.logger.error(err);
          return;
        }
        self.logger.log('Tempdir: ' + path);
        var i = 0;
        execute(path, i);
      });

    } else {
      self.logger.log('No related commands for repository "' + repo + '"');
    }

  });

  // 405 if the method is wrong
  if (req.method !== 'POST') {
      self.logger.error(Util.format('got invalid method from %s, returning 405', remoteAddress));
      failed = true;
      return reply(405, res);
  }

}

function getCmds(tasks, map, repo) {
  var ret = [], x = [];
  if (tasks.hasOwnProperty('*')) x.push(tasks['*']);
  if (tasks.hasOwnProperty(repo)) x.push(tasks[repo]);
  for (var i=0; i<x.length; i++) {
    var cmdStr = (isArray(x[i])) ? x[i].join('\n') : x[i];
    for (var j in map) cmdStr = cmdStr.replace(new RegExp(j, 'g'), map[j]);
    ret.push(cmdStr + '\n');
  }
  return ret;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports = GitLabHook;

