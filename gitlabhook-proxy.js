#!/usr/bin/env node

var util =  require('util');

var PORT = 3420;
var Socket_IO_PORT = 3421;

var logger = {
  info:  console.log,
  error: console.log
};

// note, io(<port>) will create a http server for you
var io = require('socket.io')(Socket_IO_PORT);
var realServer = null;
io.on('connection', function (socket) {
  realServer = socket;
  logger.info('realServer connect proxy ok!'+realServer);
  socket.on('disconnect', function () {
    realServer = null;
  });
});
function forward2RealProcessor(data) {
  logger.info('json data:'+JSON.stringify(data));
  if(realServer != null)
  {
    logger.info('proxy data to realServer');
    realServer.emit('webhook',data);
  }else
  {
    logger.warn('realServer not ok!');
  }
};


var glh = {
  configPathes:'.',
  port: PORT,
  host: '0.0.0.0',
  logger: logger
};

// With an optional callback function the "gitlabhook.conf" will be ignored.
var server = require('./gitlabhook')(glh,forward2RealProcessor);
server.listen();
if (server.server) logger.info('webhook server listen (%d)\n', PORT);

/*
 http://localhost:3420
*/
