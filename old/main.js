'use strict';

// The following code is written as if var is let in order to allow for easy es6 conversion

angular.module('WMJS', ['ngMaterial'])
.controller('WMJSCtrl', [
	'$timeout',
	function ($timeout) {
		var self = this;
		
		self.original = document.getElementById('wm-original');
		self.watermark = document.getElementById('wm-watermark');
		self.processed = document.getElementById('wm-processed');
		self.analyzed = document.getElementById('wm-analyzed');
		self.analyzedQr = document.getElementById('wm-analyzed-qr');
		
		self.file = document.getElementById('wm-file');
		self.download = document.getElementById('wm-download');
		
		self.qrSize = 25;
		
		self.canvases = [self.original, self.watermark, self.processed, self.analyzed, self.analyzedQr];
		
		self.clear = function () {
			self.text = '';
			self.lighten = 1;
			self.decoded = null;
			
			self.file.value = null;
			
			self.canvases.forEach(function (canvas) {
				canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
			});
		};
		
		self.clear();
		
		self.file.onchange = function (e) {
			$timeout(function () {
				var path = self.file.value.split(/\/|\\/);
				var name = path[path.length - 1];
				name = name.substring(0, name.indexOf('.'));
				self.name = name + 'wm.png';
			});
			
			var reader = new FileReader();
			reader.onload = function (event) {
				var img = new Image();
				img.onload = function () {
					var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
					var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
					var canvas = self.original;
					var context = canvas.getContext('2d');
					var width = 0;
					var height = 0;
					if (img.width > img.height) {
						width = viewportWidth * 0.3;
						height = width * img.height / img.width;
					} else {
						height = viewportHeight * 0.35;
						width = height * img.width / img.height;
					}
					self.canvases.forEach(function (c) {
						c.width = img.width;
						c.height = img.height;
						c.style.width = width + 'px';
						c.style.height = height + 'px';
					});
					context.drawImage(img, 0, 0);
					self.update();
				};
				img.src = event.target.result;
			};
			reader.readAsDataURL(e.target.files[0]);
		};
		
		self.imprint = function () {
			// Imprint watermark
			
			var canvas = self.watermark;
			var context = canvas.getContext('2d');
			
			var watermark = context.getImageData(0, 0, canvas.width, canvas.height).data;
			
			var original = self.original;
			
			canvas = self.processed;
			context = canvas.getContext('2d');
			
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			context.drawImage(original, 0, 0);
			
			var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = imageData.data;
			
			var increment = self.lighten;
			
			for (var i = 0; i < data.length; i += 4) {
				if (!data[i + 3]) {
					data[i] = 255;
					data[i + 1] = 255;
					data[i + 2] = 255;
					data[i + 3] = 255;
				}
				
				var marked = watermark[i + 3] && !watermark[i];
				var pixel = i / 4;
				var x = pixel % canvas.width;
				var y = (pixel - x) / canvas.width;
				var diamond = x % 2 == y % 2;
				if (marked && diamond) {
					var red = data[i];
					var green = data[i + 1];
					var blue = data[i + 2];
					if (red + increment > 255 || green + increment > 255 || blue + increment > 255) {
						data[i] = red - increment;
						data[i + 1] = green - increment;
						data[i + 2] = blue - increment;
					} else {
						data[i] = red + increment;
						data[i + 1] = green + increment;
						data[i + 2] = blue + increment;
					}
				}
			}
			
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.putImageData(imageData, 0, 0);
			
			var contents = canvas.toDataURL('image/png');
			self.download.setAttribute('href', contents);
			
			self.analyze();
		};
		
		self.update = function () {
			if (!self.file.value) {
				return;
			}
			
			var text = self.text;
			
			var canvas = self.watermark;
			var context = canvas.getContext('2d');
			
			if (text != '') {
				
				// Draw watermark
				
				var img = new Image();
				
				img.onload = function () {
					var scale = Math.floor(Math.min(canvas.width, canvas.height) / Math.max(img.width, img.height));
					
					context.clearRect(0, 0, canvas.width, canvas.height);
					
					context.imageSmoothingEnabled = false;
					context.mozImageSmoothingEnabled = false;
					
					context.drawImage(img, 0, 0, img.width * scale, img.height * scale);
					
					self.imprint();
				};
				
				qr.image({
					image: img,
					value: text,
					level: 'H',
					size: 2
				});
				
				// var size = Math.min(canvas.height, canvas.width) / 4;
				
				// function getRandom() {
				// 	return self.randomness / 2 - Math.random() * self.randomness;
				// }
				
				// size *= 1 + getRandom() / 100;
				
				// context.font = 'bold ' + size + 'px sans-serif';
				
				// var measure = context.measureText(text);
				// var width = measure.width;
				
				// var x = canvas.width / 2 - width / 2;
				// var y = canvas.height / 2
				
				// x += getRandom() / 100 * size;
				// y += getRandom() / 100 * size;
				
				// context.fillText(text, x, y);
			} else {
				context.clearRect(0, 0, canvas.width, canvas.height);
				
				canvas = self.analyzedQr;
				context = canvas.getContext('2d');
				context.clearRect(0, 0, canvas.width, canvas.height);
				self.decoded = null;
				
				self.imprint();
			}
		};
		
		self.analyze = function () {
			var canvas = self.processed;
			var context = canvas.getContext('2d');
			
			var original = context.getImageData(0, 0, canvas.width, canvas.height).data;
			
			canvas = self.analyzed;
			context = canvas.getContext('2d');
			
			context.clearRect(0, 0, canvas.width, canvas.height);
			
			var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			var data = imageData.data;
			
			function getPixel(x, y) {
				var pixel = y * canvas.width + x;
				if (pixel < 0 || pixel > data.length) {
					return null;
				}
				return pixel;
			}
			
			for (var x = 0; x < canvas.width; x++) {
				for (var y = 0; y < canvas.height; y++) {
					var pixel = getPixel(x, y);
					var i = pixel * 4;
					
					var red = original[i];
					var green = original[i + 1];
					var blue = original[i + 2];
					
					var up = getPixel(x, y - 1);
					var down = getPixel(x, y + 1);
					var left = getPixel(x - 1, y);
					var right = getPixel(x + 1, y);
					
					var surround = [up, down, left, right];
					
					var diffs = surround.map(function (pos) {
						if (pos !== null) {
							var index = pos * 4;
							var redDiff = original[index] - red;
							var greenDiff = original[index + 1] - green;
							var blueDiff = original[index + 2] - blue;
							if (redDiff == greenDiff && greenDiff == blueDiff && Math.abs(redDiff) == 1) {
								return redDiff;
							}
							return null;
						}
						return null;
					});
					
					var reduced = diffs.reduce(function (a, b) {
						return a === b ? a : false;
					});
					
					if (reduced) {
						data[i + 3] = 255;
					}
				}
			}
			
			// Loop again to remove outliers
			
			for (var x = 0; x < canvas.width; x++) {
				for (var y = 0; y < canvas.height; y++) {
					var pixel = getPixel(x, y);
					var i = pixel * 4;
					if (data[i + 3]) {
						var up = getPixel(x, y - 1);
						var down = getPixel(x, y + 1);
						var left = getPixel(x - 1, y);
						var right = getPixel(x + 1, y);
						
						var surround = [up, down, left, right];
						var diffs = surround.map(function (pos) {
							if (pos !== null) {
								var index = pos * 4;
								return data[index + 3];
							}
							return false;
						});
						if (!diffs.reduce(function (a, b) {
							return a || b;
						})) {
							data[i + 3] = 0;
						}
					}
				}
			}
			
			context.putImageData(imageData, 0, 0);
			
			// Attempt to generate qr code
			
			// First, figure out dimension of qr code
			
			var left = [];
			var right = [];
			var top = [];
			var bot = [];
			
			for (var x = 0; x < canvas.width; x++) {
				for (var y = 0; y < canvas.height; y++) {
					var pixel = getPixel(x, y);
					var i = pixel * 4;
					if (data[i + 3]) {
						if (left[y] === undefined) {
							left[y] = x;
						}
						if (top[x] === undefined) {
							top[x] = y;
						}
						right[y] = x;
						bot[x] = y;
					}
				}
			}
			
			var widths = [];
			for (var i = 0; i < left.length; i++) {
				if (right[i] !== undefined && left[i] !== undefined) {
					widths.push(right[i] - left[i]);
				}
			}
			var heights = [];
			for (var i = 0; i < top.length; i++) {
				if (bot[i] !== undefined && top[i] !== undefined) {
					heights.push(bot[i] - top[i]);
				}
			}
			
			function freqSort(array) {
				var freqs = {};
				array.forEach(function (val) {
					freqs[val] = freqs[val] ? freqs[val] + 1 : 1;
				});
				var list = [];
				for (var i in freqs) {
					list.push(parseInt(i));
				}
				list.sort(function (a, b) {
					return freqs[b] - freqs[a];
				});
				return list;
			}
			
			var sortedWidths = freqSort(widths);
			var sortedHeights = freqSort(heights);
			var sortedLeft = freqSort(left);
			var sortedTop = freqSort(top);
			
			var width = Math.max(sortedWidths[0], sortedWidths[1]);
			var height = Math.max(sortedHeights[0], sortedHeights[1]);
			
			var startLeft = Math.min(sortedLeft[0], sortedLeft[1]);
			var startTop = Math.min(sortedTop[0], sortedTop[1]);
			
			if (width !== undefined && width === height) {
				var dim = width;
				var blockSize = Math.ceil(dim / self.qrSize);
				
				console.log('Block size: ' + blockSize);
				
				var expectedBlacks = blockSize * blockSize;
				
				var qr = [];
				for (var i = 0; i < self.qrSize; i++) {
					qr.push([]);
				}
				
				for (var x = 0; x < self.qrSize; x++) {
					for (var y = 0; y < self.qrSize; y++) {
						qr[x][y] = 0;
					}
				}
				
				for (var x = 0; x < dim; x++) {
					for (var y = 0; y < dim; y++) {
						var pixel = getPixel(x + startLeft, y + startTop);
						var i = pixel * 4;
						if (data[i + 3]) {
							qr[Math.floor(x / blockSize)][Math.floor(y / blockSize)]++;
						}
					}
				}
				
				// Fill in areas that have to be filled in
				
				// Horizontals
				for (var i = 0; i < 7; i++) {
					qr[i][0] = expectedBlacks;
				}
				for (var i = 0; i < 7; i++) {
					qr[i][6] = expectedBlacks;
				}
				for (var i = self.qrSize - 7; i < self.qrSize; i++) {
					qr[i][0] = expectedBlacks;
				}
				for (var i = self.qrSize - 7; i < self.qrSize; i++) {
					qr[i][6] = expectedBlacks;
				}
				for (var i = 0; i < 7; i++) {
					qr[i][self.qrSize - 7] = expectedBlacks;
				}
				for (var i = 0; i < 7; i++) {
					qr[i][self.qrSize - 1] = expectedBlacks;
				}
				// Verticals
				for (var i = 0; i < 7; i++) {
					qr[0][i] = expectedBlacks;
				}
				for (var i = 0; i < 7; i++) {
					qr[6][i] = expectedBlacks;
				}
				for (var i = self.qrSize - 7; i < self.qrSize; i++) {
					qr[0][i] = expectedBlacks;
				}
				for (var i = self.qrSize - 7; i < self.qrSize; i++) {
					qr[6][i] = expectedBlacks;
				}
				for (var i = 0; i < 7; i++) {
					qr[self.qrSize - 7][i] = expectedBlacks;
				}
				for (var i = 0; i < 7; i++) {
					qr[self.qrSize - 1][i] = expectedBlacks;
				}
				// Blocks
				for (var x = 0; x < 3; x++) {
					for (var y = 0; y < 3; y++) {
						qr[x + 2][y + 2] = expectedBlacks;
					}
				}
				for (var x = 0; x < 3; x++) {
					for (var y = 0; y < 3; y++) {
						qr[x + self.qrSize - 7 + 2][y + 2] = expectedBlacks;
					}
				}
				for (var x = 0; x < 3; x++) {
					for (var y = 0; y < 3; y++) {
						qr[x + 2][y + self.qrSize - 7 + 2] = expectedBlacks;
					}
				}
				
				canvas = self.analyzedQr;
				context = canvas.getContext('2d');
				
				context.clearRect(0, 0, canvas.width, canvas.height);
				
				$timeout(function () {
					self.decoded = null;
				});
				
				imageData = context.getImageData(0, 0, canvas.width, canvas.height);
				data = imageData.data;
				
				for (var i = 0; i < data.length; i++) {
					data[i] = 255;
				}
				
				for (var x = 0; x < dim; x++) {
					for (var y = 0; y < dim; y++) {
						var pixel = getPixel(x + startLeft, y + startTop);
						var i = pixel * 4;
						if (qr[Math.floor(x / blockSize)][Math.floor(y / blockSize)] > expectedBlacks / 20) {
							data[i] = 0;
							data[i + 1] = 0;
							data[i + 2] = 0;
						}
					}
				}
				
				context.putImageData(imageData, 0, 0);
				
				var img = new Image();
				img.onload = function () {
					QCodeDecoder().decodeFromImage(img, function (error, res) {
						if (error) {
							console.log(error);
						} else {
							$timeout(function () {
								self.decoded = res;
							});
						}
					});
				};
				img.src = canvas.toDataURL('image/png');
			} else {
				console.log('Unable to determine qr code dimensions: width=' + width + ' height=' + height);
				
				context.putImageData(imageData, 0, 0);
			}
			
		};
	}
]);