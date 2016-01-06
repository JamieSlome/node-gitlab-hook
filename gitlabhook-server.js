#!/usr/bin/env node

var util =  require('util');

var PORT = 3420;

var logger = {
  info:  console.log,
  error: console.log
};

var glh = {
  port: PORT,
  host: '0.0.0.0',
  logger: logger
};

// With an additional callback function the "gitlabhook.conf" will be ignored.
var server = require('gitlabhook')(glh);
server.listen();
if (server.server) logger.info('webhook server listen (%d)\n', PORT);

/*
 http://localhost:3420
*/
