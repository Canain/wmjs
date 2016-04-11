/// <reference path="../../../typings/main.d.ts" />
'use strict';

import express = require('express');
import http = require('http');
import io = require('socket.io');

const port = 8080;

const app = express();

app
.use(require('connect-livereload')({
	port: 5000
}))
.use(express.static('pub'));

const httpServer = (<any>http).Server(app);

// const server = io(httpServer);

// server.on('connection', socket => {
// 	const log = 'Hello ' + socket.id;
// 	console.log(log);
// 	socket.emit('hello', log);
// });

httpServer.listen(port, () => {
	console.log(`Listening on port ${port}`);
});