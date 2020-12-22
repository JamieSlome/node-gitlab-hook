#!/usr/bin/env node

var util = require('util');
var port = 3420;

var logger = {
  info:  console.log,
  error: console.log
};

var glh = {
  port: port,
  host: '0.0.0.0',
  logger: logger
};

function myCallback(data) {
  logger.info('*** "myCallback" gets data ***');
  logger.info(util.inspect(data));
}

// With an optional callback function the "gitlabhook.conf" will be ignored.
var server = require('gitlabhook')(glh); // (glh, myCallback);

server.listen();

if (server.server) {
  logger.info('webhook server listen (%d)\n', port);
}

/*
 http://localhost:3420
*/
