export default class TextCompressor {
	
	constructor(public lzma) {
		
	}
	
	stringToUint8Array(code: string) {
		const data = new Uint8Array(code.length);
		for (let i = 0; i < code.length; i++) {
			data[i] = code.charCodeAt(i);
		}
		return data;
	}
	
	compress(data: string) {
		const array = this.stringToUint8Array(data);
		return this.lzma.compressFile(array).toString('base64').replace(/=/g, '');
	}
	
	decompress(compressed: string) {
		const array = this.stringToUint8Array(atob(compressed));
		return this.lzma.decompressFile(array).toString();
	}
	
}