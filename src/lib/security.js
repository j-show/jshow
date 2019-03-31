/**
 * ==========================================
 * Name:           Security
 * Author:         jShow
 * CreTime:        2014-11-20
 * Description:    加解密
 * Log
 * 2015-06-09    优化模块结构
 * 2017-02-10    去除函数默认参数,增加适配
 * ==========================================
 */
jShow.define(function (module, exports, require) {
	"use strict";
	let CONVER = jShow.Conver,
		api;

	/**
	 * 安全算法
	 *
	 * @namespace Security
	 */
	api = {
		/**
		 * Base64编解码
		 *
		 * @public
		 * @param {string} value
		 * @param {boolean} [enc=true] 是否编码
		 * @returns {string}
		 */
		Base64: (value, enc) => {
			const encode = value => {
					  let char   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
						  result = "";

					  for (let i = 0, l = value.length, c1, c2, c3; i < l;) {
						  c1 = value.charCodeAt(i++) & 0xFF;
						  if (i == l) {
							  result += char.charAt(c1 >> 2);
							  result += char.charAt((c1 & 0x3) << 4);
							  result += "==";
							  break;
						  }

						  c2 = value.charCodeAt(i++);
						  if (i == l) {
							  result += char.charAt(c1 >> 2);
							  result += char.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
							  result += char.charAt((c2 & 0xF) << 2);
							  result += "=";
							  break;
						  }

						  c3 = value.charCodeAt(i++);
						  result += char.charAt(c1 >> 2);
						  result += char.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
						  result += char.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
						  result += char.charAt(c3 & 0x3F);
					  }

					  return result;
				  },
				  decode = value => {
					  let char   = [
							  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
							  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
							  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
							  52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
							  -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
							  15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
							  -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
							  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
						  ],
						  result = "";

					  for (let i = 0, l = value.length, c1, c2, c3, c4; i < l;) {
						  do c1 = char[value.charCodeAt(i++) & 0xFF];
						  while (i < l && c1 == -1);
						  if (c1 == -1) break;

						  do c2 = char[value.charCodeAt(i++) & 0xFF];
						  while (i < l && c2 == -1);
						  if (c2 == -1) break;
						  result += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

						  do {
							  c3 = value.charCodeAt(i++) & 0xFF;
							  if (c3 == 61) return result;
							  c3 = char[c3];
						  }
						  while (i < l && c3 == -1);
						  if (c3 == -1) break;
						  result += String.fromCharCode(((c2 & 0xF) << 4) | ((c3 & 0x3C) >> 2));

						  do {
							  c4 = value.charCodeAt(i++) & 0xFF;
							  if (c4 == 61) return result;
							  c4 = char[c4];
						  }
						  while (i < l && c4 == -1);
						  if (c4 == -1) break;
						  result += String.fromCharCode(((c3 & 0x03) << 6) | c4);
					  }

					  return result;
				  },
				  arg    = {buf: true, str: true};

			value = String(value);
			return enc !== false ? encode(jShow.Conver.toString(jShow.Conver.toHex(value, "utf8"), arg)) : jShow.Conver.toString(jShow.Conver.toHex(decode(value), "utf16"), arg);
		},
		/**
		 * MD5编码
		 *
		 * @param {string} value
		 * @param {boolean} [simple=false] 是否获取16位MD5
		 * @param {function} [callback]
		 * @returns {string}
		 */
		MD5:    (value, simple, callback) => {
			const RotateLeft   = (v, bit) => (v << bit) | (v >>> (32 - bit)),
				  toUnsigned   = (x, y) => {
					  let x4 = x & 0x40000000,
						  y4 = y & 0x40000000,
						  x8 = x & 0x80000000,
						  y8 = y & 0x80000000,
						  r  = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);

					  if (x4 & y4) return r ^ 0x80000000 ^ x8 ^ y8;
					  else if (x4 | y4) return r ^ (r & 0x40000000 ? 0xC0000000 : 0x40000000) ^ x8 ^ y8;
					  else return r ^ x8 ^ y8;
				  },
				  toWordArray  = value => {
					  let ml    = value.length,
						  lw_t1 = ml + 8,
						  lw_t2 = (lw_t1 - (lw_t1 % 64)) / 64,
						  nw    = (lw_t2 + 1) * 16,
						  bp    = 0,
						  bc    = 0,
						  r     = new Array(nw - 1),
						  wc;

					  while (bc < ml) {
						  wc = (bc - (bc % 4)) / 4;
						  bp = (bc % 4) * 8;
						  r[wc] = (r[wc] | (value.charCodeAt(bc) << bp));
						  bc++;
					  }

					  wc = (bc - (bc % 4)) / 4;
					  bp = (bc % 4) * 8;
					  r[wc] = r[wc] | (0x80 << bp);
					  r[nw - 2] = ml << 3;
					  r[nw - 1] = ml >>> 29;

					  return r;
				  },
				  toHex        = value => {
					  let r = "";

					  for (let i = 0, s = "", b; i <= 3; i++) {
						  b = (value >>> (i * 8)) & 0xFF;
						  s = "0" + b.toString(16);
						  r = r + s.substr(s.length - 2, 2);
					  }

					  return r;
				  },
				  toUTF8Encode = value => {
					  value = value.replace(/\r\n/g, "\n");

					  let r = "";

					  for (let i = 0, c; i < value.length; i++) {
						  c = value.charCodeAt(i);

						  if (c < 0x80) r += String.fromCharCode(c);
						  else if (c < 0x800) {
							  r += String.fromCharCode((c >> 6) | 0xC0);
							  r += String.fromCharCode((c & 0x3F) | 0x80);
						  }
						  else {
							  r += String.fromCharCode((c >> 12) | 0xE0);
							  r += String.fromCharCode(((c >> 6) & 0x3F) | 0x80);
							  r += String.fromCharCode((c & 0x3F) | 0x80);
						  }
					  }

					  return r;
				  },
				  toF          = (x, y, z) => (x & y) | (~x & z),
				  toG          = (x, y, z) => (x & z) | (y & ~z),
				  toH          = (x, y, z) => x ^ y ^ z,
				  toI          = (x, y, z) => y ^ (x | ~z),
				  toFF         = (a, b, c, d, x, s, ac) => toUnsigned(RotateLeft(toUnsigned(a, toUnsigned(toUnsigned(toF(b, c, d), x), ac)), s), b),
				  toGG         = (a, b, c, d, x, s, ac) => toUnsigned(RotateLeft(toUnsigned(a, toUnsigned(toUnsigned(toG(b, c, d), x), ac)), s), b),
				  toHH         = (a, b, c, d, x, s, ac) => toUnsigned(RotateLeft(toUnsigned(a, toUnsigned(toUnsigned(toH(b, c, d), x), ac)), s), b),
				  toII         = (a, b, c, d, x, s, ac) => toUnsigned(RotateLeft(toUnsigned(a, toUnsigned(toUnsigned(toI(b, c, d), x), ac)), s), b);

			value = (value || "").toString();
			simple = simple === true;
			if (callback === void(0)) callback = simple;

			let a      = 0x67452301,
				b      = 0xEFCDAB89,
				c      = 0x98BADCFE,
				d      = 0x10325476,
				S      = [
					[0, 0, 0, 0, 0],
					[0, 7, 12, 17, 22],
					[0, 5, 9, 14, 20],
					[0, 4, 11, 16, 23],
					[0, 6, 10, 15, 21]
				],
				D      = toWordArray(toUTF8Encode(value)),
				result = "";

			for (let i = 0; i < D.length; i += 16) {
				S[0][1] = a;
				S[0][2] = b;
				S[0][3] = c;
				S[0][4] = d;

				a = toFF(a, b, c, d, D[i], S[1][1], 0xD76AA478);
				d = toFF(d, a, b, c, D[i + 1], S[1][2], 0xE8C7B756);
				c = toFF(c, d, a, b, D[i + 2], S[1][3], 0x242070DB);
				b = toFF(b, c, d, a, D[i + 3], S[1][4], 0xC1BDCEEE);
				a = toFF(a, b, c, d, D[i + 4], S[1][1], 0xF57C0FAF);
				d = toFF(d, a, b, c, D[i + 5], S[1][2], 0x4787C62A);
				c = toFF(c, d, a, b, D[i + 6], S[1][3], 0xA8304613);
				b = toFF(b, c, d, a, D[i + 7], S[1][4], 0xFD469501);
				a = toFF(a, b, c, d, D[i + 8], S[1][1], 0x698098D8);
				d = toFF(d, a, b, c, D[i + 9], S[1][2], 0x8B44F7AF);
				c = toFF(c, d, a, b, D[i + 10], S[1][3], 0xFFFF5BB1);
				b = toFF(b, c, d, a, D[i + 11], S[1][4], 0x895CD7BE);
				a = toFF(a, b, c, d, D[i + 12], S[1][1], 0x6B901122);
				d = toFF(d, a, b, c, D[i + 13], S[1][2], 0xFD987193);
				c = toFF(c, d, a, b, D[i + 14], S[1][3], 0xA679438E);
				b = toFF(b, c, d, a, D[i + 15], S[1][4], 0x49B40821);
				a = toGG(a, b, c, d, D[i + 1], S[2][1], 0xF61E2562);
				d = toGG(d, a, b, c, D[i + 6], S[2][2], 0xC040B340);
				c = toGG(c, d, a, b, D[i + 11], S[2][3], 0x265E5A51);
				b = toGG(b, c, d, a, D[i], S[2][4], 0xE9B6C7AA);
				a = toGG(a, b, c, d, D[i + 5], S[2][1], 0xD62F105D);
				d = toGG(d, a, b, c, D[i + 10], S[2][2], 0x2441453);
				c = toGG(c, d, a, b, D[i + 15], S[2][3], 0xD8A1E681);
				b = toGG(b, c, d, a, D[i + 4], S[2][4], 0xE7D3FBC8);
				a = toGG(a, b, c, d, D[i + 9], S[2][1], 0x21E1CDE6);
				d = toGG(d, a, b, c, D[i + 14], S[2][2], 0xC33707D6);
				c = toGG(c, d, a, b, D[i + 3], S[2][3], 0xF4D50D87);
				b = toGG(b, c, d, a, D[i + 8], S[2][4], 0x455A14ED);
				a = toGG(a, b, c, d, D[i + 13], S[2][1], 0xA9E3E905);
				d = toGG(d, a, b, c, D[i + 2], S[2][2], 0xFCEFA3F8);
				c = toGG(c, d, a, b, D[i + 7], S[2][3], 0x676F02D9);
				b = toGG(b, c, d, a, D[i + 12], S[2][4], 0x8D2A4C8A);
				a = toHH(a, b, c, d, D[i + 5], S[3][1], 0xFFFA3942);
				d = toHH(d, a, b, c, D[i + 8], S[3][2], 0x8771F681);
				c = toHH(c, d, a, b, D[i + 11], S[3][3], 0x6D9D6122);
				b = toHH(b, c, d, a, D[i + 14], S[3][4], 0xFDE5380C);
				a = toHH(a, b, c, d, D[i + 1], S[3][1], 0xA4BEEA44);
				d = toHH(d, a, b, c, D[i + 4], S[3][2], 0x4BDECFA9);
				c = toHH(c, d, a, b, D[i + 7], S[3][3], 0xF6BB4B60);
				b = toHH(b, c, d, a, D[i + 10], S[3][4], 0xBEBFBC70);
				a = toHH(a, b, c, d, D[i + 13], S[3][1], 0x289B7EC6);
				d = toHH(d, a, b, c, D[i], S[3][2], 0xEAA127FA);
				c = toHH(c, d, a, b, D[i + 3], S[3][3], 0xD4EF3085);
				b = toHH(b, c, d, a, D[i + 6], S[3][4], 0x4881D05);
				a = toHH(a, b, c, d, D[i + 9], S[3][1], 0xD9D4D039);
				d = toHH(d, a, b, c, D[i + 12], S[3][2], 0xE6DB99E5);
				c = toHH(c, d, a, b, D[i + 15], S[3][3], 0x1FA27CF8);
				b = toHH(b, c, d, a, D[i + 2], S[3][4], 0xC4AC5665);
				a = toII(a, b, c, d, D[i], S[4][1], 0xF4292244);
				d = toII(d, a, b, c, D[i + 7], S[4][2], 0x432AFF97);
				c = toII(c, d, a, b, D[i + 14], S[4][3], 0xAB9423A7);
				b = toII(b, c, d, a, D[i + 5], S[4][4], 0xFC93A039);
				a = toII(a, b, c, d, D[i + 12], S[4][1], 0x655B59C3);
				d = toII(d, a, b, c, D[i + 3], S[4][2], 0x8F0CCC92);
				c = toII(c, d, a, b, D[i + 10], S[4][3], 0xFFEFF47D);
				b = toII(b, c, d, a, D[i + 1], S[4][4], 0x85845DD1);
				a = toII(a, b, c, d, D[i + 8], S[4][1], 0x6FA87E4F);
				d = toII(d, a, b, c, D[i + 15], S[4][2], 0xFE2CE6E0);
				c = toII(c, d, a, b, D[i + 6], S[4][3], 0xA3014314);
				b = toII(b, c, d, a, D[i + 13], S[4][4], 0x4E0811A1);
				a = toII(a, b, c, d, D[i + 4], S[4][1], 0xF7537E82);
				d = toII(d, a, b, c, D[i + 11], S[4][2], 0xBD3AF235);
				c = toII(c, d, a, b, D[i + 2], S[4][3], 0x2AD7D2BB);
				b = toII(b, c, d, a, D[i + 9], S[4][4], 0xEB86D391);

				a = toUnsigned(a, S[0][1]);
				b = toUnsigned(b, S[0][2]);
				c = toUnsigned(c, S[0][3]);
				d = toUnsigned(d, S[0][4]);
			}

			result = (toHex(a) + toHex(b) + toHex(c) + toHex(d));
			result = simple === true ? result.substr(8, 16) : result;

			return jShow.isFunction(callback) ? callback(result, value) : result;
		},
		/**
		 * SHA编解码
		 *
		 * @param {string} value
		 * @param {number|object} [opt] 参数
		 *    @param {string} [opt.format=TEXT] 编码方式
		 *    @param {string} [opt.encoding=UTF8] 文本编码
		 *    @param {number} [opt.level=256] 编码等级
		 *    @param {string} [opt.key] 编码key
		 * @param {function} [callback]
		 * @returns {string}
		 */
		SHA:    (value, opt, callback) => {
			const int_64       = function (msint_32, lsint_32) {
					  this.highOrder = msint_32;
					  this.lowOrder = lsint_32;
				  },
				  str2binb     = (src, buf, len, encoding) => {
					  encoding = encoding || "UTF8";
					  buf = buf || [0];
					  len = len || 0;

					  let byteCnt = 0,
						  l       = len >>> 3,
						  intOffset, byteOffset;

					  if (encoding === "UTF8") {
						  for (let i = 0, b, c, j; i < src.length; i++) {
							  c = src.charCodeAt(i);
							  b = [];

							  if (c < 0x80) b.push(c);
							  else if (c < 0x800) {
								  b.push(0xc0 | (c >>> 6));
								  b.push(0x80 | (c & 0x3f));
							  }
							  else if ((c < 0xd800) || (c >= 0xe000)) {
								  b.push(
									  0xe0 | (c >>> 12),
									  0x80 | ((c >>> 6) & 0x3f),
									  0x80 | (c & 0x3f)
								  );
							  }
							  else {
								  i++;
								  c = 0x10000 + (((c & 0x3ff) << 10) | (src.charCodeAt(i) & 0x3ff));
								  b.push(
									  0xf0 | (c >>> 18),
									  0x80 | ((c >>> 12) & 0x3f),
									  0x80 | ((c >>> 6) & 0x3f),
									  0x80 | (c & 0x3f)
								  );
							  }

							  for (j = 0; j < b.length; j++) {
								  byteOffset = byteCnt + l;
								  intOffset = byteOffset >>> 2;
								  while (buf.length <= intOffset) buf.push(0);
								  buf[intOffset] |= b[j] << (8 * (3 - (byteOffset % 4)));
								  byteCnt++;
							  }
						  }
					  }
					  else {
						  for (let i = 0, c, j; i < src.length; i++) {
							  c = src.charCodeAt(i);

							  if (encoding === "UTF16LE") {
								  j = c & 0xff;
								  c = (j << 8) | (c >>> 8);
							  }

							  byteOffset = byteCnt + l;
							  intOffset = byteOffset >>> 2;
							  while (buf.length <= intOffset) buf.push(0);
							  buf[intOffset] |= c << (8 * (2 - (byteOffset % 4)));
							  byteCnt += 2;
						  }
					  }

					  return {value: buf, length: byteCnt * 8 + len};
				  },
				  hex2binb     = (src, buf, len) => {
					  buf = buf || [0];
					  len = len || 0;

					  let n = src.length,
						  l = len >>> 3,
						  intOffset, byteOffset;

					  if ((n % 2) !== 0) throw new Error("String of HEX type must be in byte increments");

					  for (let i = 0, j; i < n; i += 2) {
						  j = parseInt(src.substr(i, 2), 16);

						  if (isNaN(j)) throw new Error("String of HEX type contains invalid characters");

						  byteOffset = (i >>> 1) + l;
						  intOffset = byteOffset >>> 2;
						  while (buf.length <= intOffset) buf.push(0);
						  buf[intOffset] |= j << (8 * (3 - (byteOffset % 4)));
					  }

					  return {value: buf, length: n * 4 + len};
				  },
				  bytes2binb   = (src, buf, len) => {
					  buf = buf || [0];
					  len = len || 0;

					  let n = src.length,
						  l = len >>> 3,
						  intOffset, byteOffset;

					  for (let i = 0, c; i < n; i++) {
						  c = src.charCodeAt(i);

						  byteOffset = i + l;
						  intOffset = byteOffset >>> 2;
						  if (buf.length <= intOffset) buf.push(0);

						  buf[intOffset] |= c << (8 * (3 - (byteOffset % 4)));
					  }

					  return {value: buf, length: n * 8 + len};
				  },
				  b642binb     = (str, buf, len) => {
					  buf = buf || [0];
					  len = len || 0;

					  if (str.search(/^[a-zA-Z0-9=+\/]+$/)) throw new Error("Invalid character in base-64 string");

					  let l      = len >>> 3,
						  n      = 0,
						  b64Tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
						  firstEqual,
						  intOffset, byteOffset;

					  firstEqual = str.indexOf("=");
					  str = str.replace(/\=/g, "");
					  if ((firstEqual !== -1) && (firstEqual < str.length)) throw new Error("Invalid '=' found in base-64 string");

					  for (let i = 0, c, t; i < str.length; i += 4) {
						  c = str.substr(i, 4);
						  t = 0;

						  for (let j = 0, p; j < c.length; j++) {
							  p = b64Tab.indexOf(c[j]);
							  t |= p << (18 - (6 * j));
						  }

						  for (let j = 0; j < c.length - 1; j++) {
							  byteOffset = n + l;
							  intOffset = byteOffset >>> 2;
							  while (buf.length <= intOffset) buf.push(0);
							  buf[intOffset] |= ((t >>> (16 - (j * 8))) & 0xff) << (8 * (3 - (byteOffset % 4)));
							  n++;
						  }
					  }

					  return {value: buf, length: n * 8 + len};
				  },
				  binb2hex     = data => {
					  let result = "",
						  hex    = "0123456789abcdef",
						  l      = data.length * 4;

					  for (let i = 0, s; i < l; i++) {
						  s = data[i >>> 2] >>> ((3 - (i % 4)) * 8);
						  result += hex.charAt((s >>> 4) & 0xf) + hex.charAt(s & 0xf);
					  }

					  return result;
				  },
				  binb2b64     = data => {
					  let result = "",
						  b64    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
						  n      = data.length,
						  l      = n * 4;

					  for (let i = 0, j, offset, int1, int2, triplet; i < l; i += 3) {
						  offset = (i + 1) >>> 2;
						  int1 = (n > offset) ? data[offset] : 0;
						  offset = (i + 2) >>> 2;
						  int2 = (n > offset) ? data[offset] : 0;

						  triplet = (((data[i >>> 2] >>> 8 * (3 - i % 4)) & 0xff) << 16) |
							  (((int1 >>> 8 * (3 - (i + 1) % 4)) & 0xff) << 8) |
							  ((int2 >>> 8 * (3 - (i + 2) % 4)) & 0xff);

						  for (j = 0; j < 4; j++) {
							  result += (i * 8 + j * 6 <= n * 32) ? b64.charAt((triplet >>> 6 * (3 - j)) & 0x3f) : "=";
						  }
					  }

					  return result;
				  },
				  binb2bytes   = data => {
					  let result = "",
						  l      = data.length * 4;

					  for (let i = 0, c; i < l; i++) {
						  c = (data[i >>> 2] >>> ((3 - (i % 4)) * 8)) & 0xff;
						  result += String.fromCharCode(c);
					  }

					  return result;
				  },
				  rotl_32      = (x, n) => (x << n) | (x >>> (32 - n)),
				  rotr_32      = (x, n) => (x >>> n) | (x << (32 - n)),
				  rotr_64      = (x, n) => {
					  let tmp = new int_64(x.highOrder, x.lowOrder);

					  if (n <= 32) {
						  return new int_64(
							  (tmp.highOrder >>> n) | ((tmp.lowOrder << (32 - n)) & 0xFFFFFFFF),
							  (tmp.lowOrder >>> n) | ((tmp.highOrder << (32 - n)) & 0xFFFFFFFF)
						  );
					  }
					  else {
						  return new int_64(
							  (tmp.lowOrder >>> (n - 32)) | ((tmp.highOrder << (64 - n)) & 0xFFFFFFFF),
							  (tmp.highOrder >>> (n - 32)) | ((tmp.lowOrder << (64 - n)) & 0xFFFFFFFF)
						  );
					  }
				  },
				  shr_32       = (x, n) => x >>> n,
				  shr_64       = (x, n) => {
					  if (n <= 32) {
						  return new int_64(
							  x.highOrder >>> n,
							  x.lowOrder >>> n | ((x.highOrder << (32 - n)) & 0xFFFFFFFF)
						  );
					  }
					  else {
						  return new int_64(
							  0,
							  x.highOrder >>> (n - 32)
						  );
					  }
				  },
				  parity_32    = (x, y, z) => x ^ y ^ z,
				  ch_32        = (x, y, z) => (x & y) ^ (~x & z),
				  ch_64        = (x, y, z) => {
					  return new int_64(
						  (x.highOrder & y.highOrder) ^
						  (~x.highOrder & z.highOrder),
						  (x.lowOrder & y.lowOrder) ^
						  (~x.lowOrder & z.lowOrder)
					  );
				  },
				  maj_32       = (x, y, z) => (x & y) ^ (x & z) ^ (y & z),
				  maj_64       = (x, y, z) => {
					  return new int_64(
						  (x.highOrder & y.highOrder) ^
						  (x.highOrder & z.highOrder) ^
						  (y.highOrder & z.highOrder),
						  (x.lowOrder & y.lowOrder) ^
						  (x.lowOrder & z.lowOrder) ^
						  (y.lowOrder & z.lowOrder)
					  );
				  },
				  sigma0_32    = (x) => rotr_32(x, 2) ^ rotr_32(x, 13) ^ rotr_32(x, 22),
				  sigma0_64    = (x) => {
					  let rotr28 = rotr_64(x, 28),
						  rotr34 = rotr_64(x, 34),
						  rotr39 = rotr_64(x, 39);

					  return new int_64(
						  rotr28.highOrder ^ rotr34.highOrder ^ rotr39.highOrder,
						  rotr28.lowOrder ^ rotr34.lowOrder ^ rotr39.lowOrder);
				  },
				  sigma1_32    = (x) => rotr_32(x, 6) ^ rotr_32(x, 11) ^ rotr_32(x, 25),
				  sigma1_64    = (x) => {
					  let rotr14 = rotr_64(x, 14),
						  rotr18 = rotr_64(x, 18),
						  rotr41 = rotr_64(x, 41);

					  return new int_64(
						  rotr14.highOrder ^ rotr18.highOrder ^ rotr41.highOrder,
						  rotr14.lowOrder ^ rotr18.lowOrder ^ rotr41.lowOrder);
				  },
				  gamma0_32    = (x) => rotr_32(x, 7) ^ rotr_32(x, 18) ^ shr_32(x, 3),
				  gamma0_64    = (x) => {
					  let rotr1 = rotr_64(x, 1),
						  rotr8 = rotr_64(x, 8),
						  shr7  = shr_64(x, 7);

					  return new int_64(
						  rotr1.highOrder ^ rotr8.highOrder ^ shr7.highOrder,
						  rotr1.lowOrder ^ rotr8.lowOrder ^ shr7.lowOrder
					  );
				  },
				  gamma1_32    = (x) => rotr_32(x, 17) ^ rotr_32(x, 19) ^ shr_32(x, 10),
				  gamma1_64    = (x) => {
					  let rotr19 = rotr_64(x, 19),
						  rotr61 = rotr_64(x, 61),
						  shr6   = shr_64(x, 6);

					  return new int_64(
						  rotr19.highOrder ^ rotr61.highOrder ^ shr6.highOrder,
						  rotr19.lowOrder ^ rotr61.lowOrder ^ shr6.lowOrder
					  );
				  },
				  safeAdd_32_2 = (a, b) => {
					  let lsw = (a & 0xFFFF) + (b & 0xFFFF),
						  msw = (a >>> 16) + (b >>> 16) + (lsw >>> 16);

					  return ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
				  },
				  safeAdd_32_4 = (a, b, c, d) => {
					  let lsw = (a & 0xFFFF) + (b & 0xFFFF) + (c & 0xFFFF) + (d & 0xFFFF),
						  msw = (a >>> 16) + (b >>> 16) + (c >>> 16) + (d >>> 16) + (lsw >>> 16);

					  return ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
				  },
				  safeAdd_32_5 = (a, b, c, d, e) => {
					  let lsw = (a & 0xFFFF) + (b & 0xFFFF) + (c & 0xFFFF) + (d & 0xFFFF) + (e & 0xFFFF),
						  msw = (a >>> 16) + (b >>> 16) + (c >>> 16) + (d >>> 16) + (e >>> 16) + (lsw >>> 16);

					  return ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);
				  },
				  safeAdd_64_2 = (x, y) => {
					  let lsw      = (x.lowOrder & 0xFFFF) + (y.lowOrder & 0xFFFF),
						  msw      = (x.lowOrder >>> 16) + (y.lowOrder >>> 16) + (lsw >>> 16),
						  lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF),
						  highOrder;

					  lsw = (x.highOrder & 0xFFFF) + (y.highOrder & 0xFFFF) + (msw >>> 16);
					  msw = (x.highOrder >>> 16) + (y.highOrder >>> 16) + (lsw >>> 16);
					  highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

					  return new int_64(highOrder, lowOrder);
				  },
				  safeAdd_64_4 = (a, b, c, d) => {
					  let lsw      = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF),
						  msw      = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (lsw >>> 16),
						  lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF),
						  highOrder;

					  lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) + (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) + (msw >>> 16);
					  msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) + (c.highOrder >>> 16) + (d.highOrder >>> 16) + (lsw >>> 16);
					  highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

					  return new int_64(highOrder, lowOrder);
				  },
				  safeAdd_64_5 = (a, b, c, d, e) => {
					  let lsw      = (a.lowOrder & 0xFFFF) + (b.lowOrder & 0xFFFF) + (c.lowOrder & 0xFFFF) + (d.lowOrder & 0xFFFF) + (e.lowOrder & 0xFFFF),
						  msw      = (a.lowOrder >>> 16) + (b.lowOrder >>> 16) + (c.lowOrder >>> 16) + (d.lowOrder >>> 16) + (e.lowOrder >>> 16) + (lsw >>> 16),
						  lowOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF),
						  highOrder;

					  lsw = (a.highOrder & 0xFFFF) + (b.highOrder & 0xFFFF) +
						  (c.highOrder & 0xFFFF) + (d.highOrder & 0xFFFF) +
						  (e.highOrder & 0xFFFF) + (msw >>> 16);
					  msw = (a.highOrder >>> 16) + (b.highOrder >>> 16) +
						  (c.highOrder >>> 16) + (d.highOrder >>> 16) +
						  (e.highOrder >>> 16) + (lsw >>> 16);
					  highOrder = ((msw & 0xFFFF) << 16) | (lsw & 0xFFFF);

					  return new int_64(highOrder, lowOrder);
				  },
				  getH         = level => {
					  const H_trunc = [
								0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
								0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
							],
							H_full  = [
								0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
								0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19
							];

					  switch (level) {
						  case 1:
							  return [
								  0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0
							  ];
						  case 224:
							  return H_trunc;
						  default:
						  case 256:
							  return H_full;
						  case 384:
							  return [
								  new int_64(0xcbbb9d5d, H_trunc[0]),
								  new int_64(0x0629a292a, H_trunc[1]),
								  new int_64(0x9159015a, H_trunc[2]),
								  new int_64(0x0152fecd8, H_trunc[3]),
								  new int_64(0x67332667, H_trunc[4]),
								  new int_64(0x98eb44a87, H_trunc[5]),
								  new int_64(0xdb0c2e0d, H_trunc[6]),
								  new int_64(0x047b5481d, H_trunc[7])
							  ];
						  case 512:
							  return [
								  new int_64(H_full[0], 0xf3bcc908),
								  new int_64(H_full[1], 0x84caa73b),
								  new int_64(H_full[2], 0xfe94f82b),
								  new int_64(H_full[3], 0x5f1d36f1),
								  new int_64(H_full[4], 0xade682d1),
								  new int_64(H_full[5], 0x2b3e6c1f),
								  new int_64(H_full[6], 0xfb41bd6b),
								  new int_64(H_full[7], 0x137e2179)
							  ];
					  }
				  },
				  getK         = high => {
					  const result = [
						  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
						  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
						  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
						  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
						  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
						  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
						  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
						  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
						  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
						  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
						  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
						  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
						  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
						  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
						  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
						  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
					  ];

					  if (high !== true) return result;

					  return [
						  new int_64(result[0], 0xd728ae22), new int_64(result[1], 0x23ef65cd),
						  new int_64(result[2], 0xec4d3b2f), new int_64(result[3], 0x8189dbbc),
						  new int_64(result[4], 0xf348b538), new int_64(result[5], 0xb605d019),
						  new int_64(result[6], 0xaf194f9b), new int_64(result[7], 0xda6d8118),
						  new int_64(result[8], 0xa3030242), new int_64(result[9], 0x45706fbe),
						  new int_64(result[10], 0x4ee4b28c), new int_64(result[11], 0xd5ffb4e2),
						  new int_64(result[12], 0xf27b896f), new int_64(result[13], 0x3b1696b1),
						  new int_64(result[14], 0x25c71235), new int_64(result[15], 0xcf692694),
						  new int_64(result[16], 0x9ef14ad2), new int_64(result[17], 0x384f25e3),
						  new int_64(result[18], 0x8b8cd5b5), new int_64(result[19], 0x77ac9c65),
						  new int_64(result[20], 0x592b0275), new int_64(result[21], 0x6ea6e483),
						  new int_64(result[22], 0xbd41fbd4), new int_64(result[23], 0x831153b5),
						  new int_64(result[24], 0xee66dfab), new int_64(result[25], 0x2db43210),
						  new int_64(result[26], 0x98fb213f), new int_64(result[27], 0xbeef0ee4),
						  new int_64(result[28], 0x3da88fc2), new int_64(result[29], 0x930aa725),
						  new int_64(result[30], 0xe003826f), new int_64(result[31], 0x0a0e6e70),
						  new int_64(result[32], 0x46d22ffc), new int_64(result[33], 0x5c26c926),
						  new int_64(result[34], 0x5ac42aed), new int_64(result[35], 0x9d95b3df),
						  new int_64(result[36], 0x8baf63de), new int_64(result[37], 0x3c77b2a8),
						  new int_64(result[38], 0x47edaee6), new int_64(result[39], 0x1482353b),
						  new int_64(result[40], 0x4cf10364), new int_64(result[41], 0xbc423001),
						  new int_64(result[42], 0xd0f89791), new int_64(result[43], 0x0654be30),
						  new int_64(result[44], 0xd6ef5218), new int_64(result[45], 0x5565a910),
						  new int_64(result[46], 0x5771202a), new int_64(result[47], 0x32bbd1b8),
						  new int_64(result[48], 0xb8d2d0c8), new int_64(result[49], 0x5141ab53),
						  new int_64(result[50], 0xdf8eeb99), new int_64(result[51], 0xe19b48a8),
						  new int_64(result[52], 0xc5c95a63), new int_64(result[53], 0xe3418acb),
						  new int_64(result[54], 0x7763e373), new int_64(result[55], 0xd6b2b8a3),
						  new int_64(result[56], 0x5defb2fc), new int_64(result[57], 0x43172f60),
						  new int_64(result[58], 0xa1f0ab72), new int_64(result[59], 0x1a6439ec),
						  new int_64(result[60], 0x23631e28), new int_64(result[61], 0xde82bde9),
						  new int_64(result[62], 0xb2c67915), new int_64(result[63], 0xe372532b),
						  new int_64(0xca273ece, 0xea26619c), new int_64(0xd186b8c7, 0x21c0c207),
						  new int_64(0xeada7dd6, 0xcde0eb1e), new int_64(0xf57d4f7f, 0xee6ed178),
						  new int_64(0x06f067aa, 0x72176fba), new int_64(0x0a637dc5, 0xa2c898a6),
						  new int_64(0x113f9804, 0xbef90dae), new int_64(0x1b710b35, 0x131c471b),
						  new int_64(0x28db77f5, 0x23047d84), new int_64(0x32caab7b, 0x40c72493),
						  new int_64(0x3c9ebe0a, 0x15c9bebc), new int_64(0x431d67c4, 0x9c100d4c),
						  new int_64(0x4cc5d4be, 0xcb3e42b6), new int_64(0x597f299c, 0xfc657e2a),
						  new int_64(0x5fcb6fab, 0x3ad6faec), new int_64(0x6c44198c, 0x4a475817)
					  ];
				  },
				  roundSHA1    = (block, H) => {
					  let a = H[0],
						  b = H[1],
						  c = H[2],
						  d = H[3],
						  e = H[4];

					  for (let i = 0, W = [], T; i < 80; i++) {
						  W[i] = i < 16 ? block[i] : rotl_32(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

						  if (i < 20) T = safeAdd_32_5(rotl_32(a, 5), ch_32(b, c, d), e, 0x5a827999, W[i]);
						  else if (i < 40) T = safeAdd_32_5(rotl_32(a, 5), parity_32(b, c, d), e, 0x6ed9eba1, W[i]);
						  else if (i < 60) T = safeAdd_32_5(rotl_32(a, 5), maj_32(b, c, d), e, 0x8f1bbcdc, W[i]);
						  else T = safeAdd_32_5(rotl_32(a, 5), parity_32(b, c, d), e, 0xca62c1d6, W[i]);

						  e = d;
						  d = c;
						  c = rotl_32(b, 30);
						  b = a;
						  a = T;
					  }

					  H[0] = safeAdd_32_2(a, H[0]);
					  H[1] = safeAdd_32_2(b, H[1]);
					  H[2] = safeAdd_32_2(c, H[2]);
					  H[3] = safeAdd_32_2(d, H[3]);
					  H[4] = safeAdd_32_2(e, H[4]);

					  return H;
				  },
				  finalizeSHA1 = (buf, bLen, pLen, H) => {
					  let offset = (((bLen + 65) >>> 9) << 4) + 15;

					  while (buf.length <= offset) buf.push(0);

					  buf[bLen >>> 5] |= 0x80 << (24 - (bLen % 32));
					  buf[offset] = bLen + pLen;

					  for (let i = 0, l = buf.length; i < l; i += 16) H = roundSHA1(buf.slice(i, i + 16), H);

					  return H;
				  },
				  roundSHA2    = (block, H, level) => {
					  let a = H[0],
						  b = H[1],
						  c = H[2],
						  d = H[3],
						  e = H[4],
						  f = H[5],
						  g = H[6],
						  h = H[7],
						  l,
						  Int, binaryStringMult,
						  safeAdd_2, safeAdd_4, safeAdd_5, gamma0, gamma1, sigma0, sigma1,
						  maj, ch, K;

					  if (level > 256) {
						  l = 80;
						  binaryStringMult = 2;
						  Int = int_64;
						  safeAdd_2 = safeAdd_64_2;
						  safeAdd_4 = safeAdd_64_4;
						  safeAdd_5 = safeAdd_64_5;
						  gamma0 = gamma0_64;
						  gamma1 = gamma1_64;
						  sigma0 = sigma0_64;
						  sigma1 = sigma1_64;
						  maj = maj_64;
						  ch = ch_64;
						  K = getK(true);
					  }
					  else {
						  l = 64;
						  binaryStringMult = 1;
						  Int = Number;
						  safeAdd_2 = safeAdd_32_2;
						  safeAdd_4 = safeAdd_32_4;
						  safeAdd_5 = safeAdd_32_5;
						  gamma0 = gamma0_32;
						  gamma1 = gamma1_32;
						  sigma0 = sigma0_32;
						  sigma1 = sigma1_32;
						  maj = maj_32;
						  ch = ch_32;
						  K = getK();
					  }

					  for (let i = 0, W = [], T1, T2, int1, int2, offset; i < l; i++) {
						  if (i < 16) {
							  offset = i * binaryStringMult;
							  int1 = (block.length <= offset) ? 0 : block[offset];
							  int2 = (block.length <= offset + 1) ? 0 : block[offset + 1];
							  W[i] = new Int(int1, int2);
						  }
						  else {
							  W[i] = safeAdd_4(
								  gamma1(W[i - 2]), W[i - 7],
								  gamma0(W[i - 15]), W[i - 16]
							  );
						  }

						  T1 = safeAdd_5(h, sigma1(e), ch(e, f, g), K[i], W[i]);
						  T2 = safeAdd_2(sigma0(a), maj(a, b, c));
						  h = g;
						  g = f;
						  f = e;
						  e = safeAdd_2(d, T1);
						  d = c;
						  c = b;
						  b = a;
						  a = safeAdd_2(T1, T2);
					  }

					  H[0] = safeAdd_2(a, H[0]);
					  H[1] = safeAdd_2(b, H[1]);
					  H[2] = safeAdd_2(c, H[2]);
					  H[3] = safeAdd_2(d, H[3]);
					  H[4] = safeAdd_2(e, H[4]);
					  H[5] = safeAdd_2(f, H[5]);
					  H[6] = safeAdd_2(g, H[6]);
					  H[7] = safeAdd_2(h, H[7]);

					  return H;
				  },
				  finalizeSHA2 = (buf, bLen, pLen, H, level) => {
					  let offset, binaryStringInc;

					  if (level <= 256) {
						  offset = (((bLen + 65) >>> 9) << 4) + 15;
						  binaryStringInc = 16;
					  }
					  else {
						  offset = (((bLen + 129) >>> 10) << 5) + 31;
						  binaryStringInc = 32;
					  }

					  while (buf.length <= offset) buf.push(0);

					  buf[bLen >>> 5] |= 0x80 << (24 - bLen % 32);
					  buf[offset] = bLen + pLen;

					  for (let i = 0, l = buf.length; i < l; i += binaryStringInc) H = roundSHA2(buf.slice(i, i + binaryStringInc), H, level);

					  switch (level) {
						  case 224:
							  return [
								  H[0], H[1], H[2], H[3],
								  H[4], H[5], H[6]
							  ];
						  case 256:
							  return H;
						  case 384:
							  return [
								  H[0].highOrder, H[0].lowOrder,
								  H[1].highOrder, H[1].lowOrder,
								  H[2].highOrder, H[2].lowOrder,
								  H[3].highOrder, H[3].lowOrder,
								  H[4].highOrder, H[4].lowOrder,
								  H[5].highOrder, H[5].lowOrder
							  ];
						  case 512:
							  return [
								  H[0].highOrder, H[0].lowOrder,
								  H[1].highOrder, H[1].lowOrder,
								  H[2].highOrder, H[2].lowOrder,
								  H[3].highOrder, H[3].lowOrder,
								  H[4].highOrder, H[4].lowOrder,
								  H[5].highOrder, H[5].lowOrder,
								  H[6].highOrder, H[6].lowOrder,
								  H[7].highOrder, H[7].lowOrder
							  ];
					  }
				  },
				  setKey       = (key, level) => {
					  let buf            = str2binb(key),
						  len            = buf.length,
						  blockByteSize  = variantBlockSize >>> 3,
						  lastArrayIndex = (blockByteSize / 4) - 1,
						  i              = len / 8;

					  buf = buf.value;

					  if (blockByteSize < i) {
						  buf = finalizeFunc(buf, len, 0, getH(value), level);
						  while (buf.length < lastArrayIndex) buf.push(0);
						  buf[lastArrayIndex] &= 0xFFFFFF00;
					  }
					  else if (blockByteSize > i) {
						  while (buf.length <= lastArrayIndex) buf.push(0);
						  buf[lastArrayIndex] &= 0xFFFFFF00;
					  }

					  for (i = 0; i <= lastArrayIndex; i++) {
						  keyWithIPad[i] = buf[i] ^ 0x36363636;
						  keyWithOPad[i] = buf[i] ^ 0x5C5C5C5C;
					  }

					  intermediateH = roundFunc(keyWithIPad, intermediateH, level);
					  processedLen = variantBlockSize;
				  },
				  setData      = (src, level) => {
					  let buf                = informatFunc(src, remainder, remainderLen),
						  len                = buf.length,
						  bufInLen           = len >>> 5,
						  updateProcessedLen = 0,
						  variantBlockIntInc = variantBlockSize >>> 5;

					  buf = buf.value;

					  for (let i = 0; i < bufInLen; i += variantBlockIntInc) {
						  if (updateProcessedLen + variantBlockSize <= len) {
							  intermediateH = roundFunc(
								  buf.slice(i, i + variantBlockIntInc),
								  intermediateH,
								  level
							  );

							  updateProcessedLen += variantBlockSize;
						  }
					  }

					  processedLen += updateProcessedLen;
					  remainder = buf.slice(updateProcessedLen >>> 5);
					  remainderLen = len % variantBlockSize;
				  };

			let result,
				level, key, inf, outf, ine, oute;

			switch (jShow.type(opt, true)) {
				case "object":
					level = opt.level;
					key = opt.key;
					inf = outf = opt.format;
					ine = oute = opt.encoding;
					inf = opt.inf || inf;
					outf = opt.outf || outf;
					ine = opt.ine || ine;
					oute = opt.oute || oute;
					break;
				case "string":
					key = opt;
					break;
				case "number":
					level = opt;
					break;
				case "function":
					callback = opt;
					break;
			}
			if (!jShow.has(level, [1, 224, 256, 384, 512])) level = 256;
			if (!jShow.isString(key)) key = "";
			if (!jShow.has(inf, ["TEXT", "B64", "BASE64", "HEX"])) inf = "TEXT";
			if (!jShow.has(outf, ["HEX", "B64", "BASE64"])) outf = "HEX";
			if (!jShow.has(ine, ["ANSI", "UTF8", "UTF16"])) ine = "UTF8";
			if (!jShow.has(oute, ["ANSI", "UTF8", "UTF16"])) oute = "UTF8";

			if (inf === "BASE64") inf = "B64";
			if (outf === "BASE64") outf = "B64";
			if (jShow.isNull(value, true)) {
				value = "";
				inf = "TEXT";
				ine = "UTF8";
			}

			let processedLen = 0,
				remainder    = [],
				remainderLen = 0,
				keyWithIPad  = [],
				keyWithOPad  = [];

			let roundFunc    = roundSHA2,
				finalizeFunc = finalizeSHA2,
				informatFunc, outformatFunc;

			let variantBlockSize = 512,
				outputBinLen     = level,
				intermediateH    = getH(level);

			switch (level) {
				default:
					break;
				case 1:
					outputBinLen = 160;
					roundFunc = roundSHA1;
					finalizeFunc = finalizeSHA1;
					break;
				case 384:
				case 512:
					variantBlockSize = 1024;
					break;
			}

			informatFunc = ((format, encoding) => {
				switch (format) {
					default:
						return (str, buf, len) => str2binb(str, buf, len, encoding);
					case "HEX":
						return hex2binb;
					case "B64":
						return b642binb;
					case "BYTES":
						return bytes2binb;
				}
			})(inf, ine);
			outformatFunc = ((format, encoding) => {
				switch (format) {
					default:
						return binb2hex;
					case "B64":
						return binb2b64;
					case "BYTES":
						return binb2bytes;
				}
			})(outf, oute);

			if (key) setKey(key, level);

			setData(value, level);

			intermediateH = finalizeFunc(remainder, remainderLen, processedLen, intermediateH, level);

			if (key) {
				let tmpH = roundFunc(keyWithOPad, getH(level), level);
				intermediateH = finalizeFunc(intermediateH, outputBinLen, variantBlockSize, tmpH, level);
			}

			result = outformatFunc(intermediateH);

			return jShow.isFunction(callback) ? callback(result, value) : result;
		},
		/**
		 * CRC编解码
		 *
		 * @public
		 * @param {string|Array} value 0xFFFF数组，buf=string时以ANSI进行转换
		 * @param {number} [type=16] 编码类型，4、5、6、7、8、16、32
		 * @param {string} [mode] 编码模式，不同编码类型下，有多种模式
		 *    4：itu
		 *    5：usb、itu、epc
		 *    6：itu
		 *    7：mmc
		 *    8：itu、atm、rohc、maxim、ibutton、dow
		 *    16：modbus、ibm、arc、lha、maxim、usb、ccitt、kermit、ccittf、x25、xmodem、zmodem、acorn、dnp、mbus
		 *    32：winrar、adccp、mpeg2
		 * @returns {number}
		 */
		CRC:    (value, type, mode) => {
			const to4_itu     = buf => {
					  //x4+x+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x0c;
						  }
					  }

					  return r;
				  },
				  to5_epc     = buf => {
					  //x5+x3+1
					  let r = 0x48;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 0x80;
							  r = r << 1;
							  if (d) r ^= 0x48;
						  }
					  }

					  return r >> 3;
				  },
				  to5_itu     = buf => {
					  //x5+x5+x2+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x15;
						  }
					  }

					  return r;
				  },
				  to5_usb     = buf => {
					  //x5+x2+1
					  let r = 0x1f;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x14;
						  }
					  }

					  return r ^ 0x1f;
				  },
				  to6_itu     = buf => {
					  //x6+x+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x30;
						  }
					  }

					  return r;
				  },
				  to7_mmc     = buf => {
					  //x7+x3+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 0x80;
							  r = r << 1;
							  if (d) r ^= 0x12;
						  }
					  }

					  return r >> 1;
				  },
				  to8         = buf => {
					  //x8+x2+x+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 0x80;
							  r = r << 1;
							  if (d) r ^= 0x07;
						  }
					  }

					  return r;
				  },
				  to8_atm     = buf => {
					  //x8+x2+x+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 0x80;
							  r = r << 1;
							  if (d) r ^= 0x07;
						  }
					  }

					  return r ^ 0x55;
				  },
				  to8_rohc    = buf => {
					  //x8+x2+x+1
					  let r = 0xff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xe0;
						  }
					  }

					  return r;
				  },
				  to8_maxim   = buf => {
					  //x8+x5+x4+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x8c;
						  }
					  }

					  return r;
				  },
				  to16_ibm    = buf => {
					  //x16+x15+x2+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xa001;
						  }
					  }

					  return r;
				  },
				  to16_maxim  = buf => {
					  //x16+x15+x2+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xa001;
						  }
					  }

					  return ~r;
				  },
				  to16_usb    = buf => {
					  //x16+x15+x2+1
					  let r = 0xffff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xa001;
						  }
					  }

					  return ~r;
				  },
				  to16_modbus = buf => {
					  //x16+x15+x2+1
					  let r = 0xffff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xa001;
						  }
					  }

					  return r;
				  },
				  to16_ccitt  = buf => {
					  //x16+x12+x5+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x8408;
						  }
					  }

					  return r;
				  },
				  to16_ccittf = buf => {
					  //x16+x12+x5+1
					  let r = 0xffff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i] << 8;
						  for (j = 0; j < 8; j++) {
							  d = r & 0x8000;
							  r = r << 1;
							  if (d) r ^= 0x1021;
						  }
					  }

					  return r;
				  },
				  to16_x25    = buf => {
					  //x16+x12+x5+1
					  let r = 0xffff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0x8408;
						  }
					  }

					  return ~r;
				  },
				  to16_xmodem = buf => {
					  //x16+x12+x5+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i] << 8;
						  for (j = 0; j < 8; j++) {
							  d = r & 0x8000;
							  r = r << 1;
							  if (d) r ^= 0x1021;
						  }
					  }

					  return r;
				  },
				  to16_dnp    = buf => {
					  //x16+x13+x12+x11+x10+x8+x6+x5+x2+1
					  let r = 0x00;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xa6bc;
						  }
					  }

					  return ~r;
				  },
				  to32_adccp  = buf => {
					  //x32+x26+x23+x22+x16+x12+x11+x10+x8+x7+x5+x4+x2+x+1
					  let r = 0xffffffff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i];
						  for (j = 0; j < 8; j++) {
							  d = r & 1;
							  r = r >> 1;
							  if (d) r ^= 0xedb88320;
						  }
					  }

					  return ~r;
				  },
				  to32_mpeg2  = buf => {
					  //x32+x26+x23+x22+x16+x12+x11+x10+x8+x7+x5+x4+x2+x+1
					  let r = 0xffffffff;

					  for (let i = 0, j, d; i < buf.length; i++) {
						  r ^= buf[i] << 24;
						  for (j = 0; j < 8; j++) {
							  d = r & 0x80000000;
							  r = r << 1;
							  if (d) r ^= 0x04c11db7;
						  }
					  }

					  return r;
				  };

			if (!jShow.isArray(value)) {
				if (jShow.isString(value)) value = jShow.Conver.toHex(value, "ansi");
				else value = [];
			}

			let func = ((type, mode) => {
				switch (type) {
					case 4:
						return to4_itu;
					case 5:
						switch (mode) {
							default:
							case "usb":
								return to5_usb;
							case "itu":
								return to5_itu;
							case "epc":
								return to5_epc;
						}
						break;
					case 6:
						return to6_itu;
					case 7:
						return to7_mmc;
					case 8:
						switch (mode) {
							default:
								return to8;
							case "itu":
							case "atm":
								return to8_atm;
							case "rohc":
								return to8_rohc;
							case "maxim":
							case "ibutton":
							case "dow":
								return to8_maxim;
						}
					default:
					case 16:
						switch (mode) {
							default:
							case "modbus":
								return to16_modbus;
							case "ibm":
							case "arc":
							case "lha":
								return to16_ibm;
							case "maxim":
								return to16_maxim;
							case "usb":
								return to16_usb;
							case "ccitt":
							case "kermit":
								return to16_ccitt;
							case "ccittf":
								return to16_ccittf;
							case "x25":
								return to16_x25;
							case "xmodem":
							case "zmodem":
							case "acorn":
								return to16_xmodem;
							case "dnp":
							case "mbus":
								return to16_dnp;
						}
					case 32:
						switch (mode) {
							default:
							case "winrar":
							case "adccp":
								return to32_adccp;
							case "mpeg2":
								return to32_mpeg2;
						}
				}
			})(parseInt(type), String(mode).toLowerCase());

			return func(value);
		}
	};

	return api;
}, {module: module, exports: this}, ["Conver"], "Security");