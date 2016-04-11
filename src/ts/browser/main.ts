/// <reference path="../../../typings/browser.d.ts" />
'use strict';

require("!style!css!sass!../../sass/style.scss");

// import TextCompressor from './compressor';
// const lzma = require('lzma-purejs');
// const socketio: SocketIOClientStatic = require('socket.io-client');

// document.addEventListener("DOMContentLoaded", () => {
// 	const socket = socketio();
// 	const compressor = new TextCompressor(lzma);
// 	socket.on('hello', (data: string) => {
// 		const compressed = compressor.compress(data);
// 		console.log(data);
// 		console.log(compressed + ' - ' + compressor.decompress(compressed));
// 	});
// });

class MainCtrl {
	
	content: string;
	
	constructor(public $timeout: angular.ITimeoutService) {
		this.content = 'Angular Loaded';
	}
}

angular.module('WebpackExpress', ['ngMaterial'])
	.controller('MainCtrl', ['$mdDialog', '$timeout', MainCtrl]);