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

interface Canvas {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
}

class MainCtrl {
	
	original: Canvas;
	imprint: Canvas;
	processed: Canvas;
	retrieved: Canvas;
	
	constructor(public $mdDialog: angular.material.IDialogService, 
				public $timeout: angular.ITimeoutService) {
		
		this.original = this.getCanvas('wm-original');
		this.imprint = this.getCanvas('wm-imprint');
		this.processed = this.getCanvas('wm-proessed');
		this.retrieved = this.getCanvas('wm-retrieved');
	}
	
	getCanvas(id: string): Canvas {
		const canvas = <HTMLCanvasElement>document.getElementById(id);
		return {
			canvas: canvas,
			context: canvas.getContext('2d')
		};
	}
}

angular.module('WMJS', ['ngMaterial'])
	.controller('MainCtrl', ['$mdDialog', '$timeout', MainCtrl]);