#!/usr/bin/env node

//socket.io as client connnect to the proxy
var client =  require('socket.io-client');
var socket = client.connect('http://localhost:3421');
socket.on('connect', function () {
  console.log('connect to proxy successfully!');
});
socket.on('disconnect', function () {
    console.log('disconnect to proxy successfully!');
});

var logger = {
    info:  console.log,
    error: console.log
};


//gitlabhook as a processor, to process the real action
var gitlabhook = require('./gitlabhook');
var processer = gitlabhook({configPathes:'.',logger: logger});

socket.on('webhook', function (data) {
    console.log('real server receive data :'+ data);
    gitlabhook.executeShellCmds(processer,'' ,data);
});
