/**
 * Bot Telegram GetContact (Cloudflare Workers)
 * Bot Telegram serverless untuk lookup profil dan tag GetContact Cloudflare Workers & KV
 * 
 * Fitur:
 * - Lookup profil & tag kontak
 * - Tampilan sisa kuota pencarian otomatis pada hasil lookup
 * - Sistem buka blokir / captcha interaktif (refresh-code & verify-code)
 * - Multi-akun GetContact untuk Admin (/accounts, /addacc, /useacc, /delacc)
 * - Sistem donasi QRIS untuk perpanjangan akun Premium (/setqris, /donasi, & tombol donasi)
 * 
 * Author: mhdhfzz
 * Repository: https://github.com/mhdhfzz/getcontact-bot
 */


// ==========================================
// KONFIGURASI API GETCONTACT
// ==========================================
const GTC_BASE = "https://pbssrv-centralevents.com";
const HMAC_KEY = "31426764382a642f3a6665497235466f3d236d5d785b722b4c657457442a495b494524324866782a2364292478587a78662d7a7b7578593f71703e2b7e365762";
const APP_VERSION = "8.4.0";
const ANDROID_OS = "android 9";
const LANG = "en_US";
const COUNTRY = "id";

// Penyimpanan in-memory fallback jika KV belum dipasang
const MEM_STORE = new Map();

// ==========================================
// FUNGSI KRIPTOGRAFI (Pure Standalone JS AES-256-ECB & Native WebCrypto HMAC)
// ==========================================
var De = Object.create; var se = Object.defineProperty; var We = Object.getOwnPropertyDescriptor; var Fe = Object.getOwnPropertyNames; var Pe = Object.getPrototypeOf, qe = Object.prototype.hasOwnProperty; var fe = (v => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(v, { get: (t, k) => (typeof require < "u" ? require : t)[k] }) : v)(function (v) { if (typeof require < "u") return require.apply(this, arguments); throw new Error('Dynamic require of "' + v + '" is not supported') }); var I = (v, t) => () => (t || v((t = { exports: {} }).exports, t), t.exports); var Ke = (v, t, k, C) => { if (t && typeof t == "object" || typeof t == "function") for (let P of Fe(t)) !qe.call(v, P) && P !== k && se(v, P, { get: () => t[P], enumerable: !(C = We(t, P)) || C.enumerable }); return v }; var O = (v, t, k) => (k = v != null ? De(Pe(v)) : {}, Ke(t || !v || !v.__esModule ? se(k, "default", { value: v, enumerable: !0 }) : k, v)); var ce = I(() => { }); var N = I((T, ve) => { (function (v, t) { typeof T == "object" ? ve.exports = T = t() : typeof define == "function" && define.amd ? define([], t) : v.CryptoJS = t() })(T, function () { var v = v || function (t, k) { var C; if (typeof window < "u" && window.crypto && (C = window.crypto), typeof self < "u" && self.crypto && (C = self.crypto), typeof globalThis < "u" && globalThis.crypto && (C = globalThis.crypto), !C && typeof window < "u" && window.msCrypto && (C = window.msCrypto), !C && typeof global < "u" && global.crypto && (C = global.crypto), !C && typeof fe == "function") try { C = ce() } catch { } var P = function () { if (C) { if (typeof C.getRandomValues == "function") try { return C.getRandomValues(new Uint32Array(1))[0] } catch { } if (typeof C.randomBytes == "function") try { return C.randomBytes(4).readInt32LE() } catch { } } throw new Error("Native crypto module could not be used to get secure random number.") }, A = Object.create || function () { function e() { } return function (r) { var u; return e.prototype = r, u = new e, e.prototype = null, u } }(), K = {}, i = K.lib = {}, b = i.Base = function () { return { extend: function (e) { var r = A(this); return e && r.mixIn(e), (!r.hasOwnProperty("init") || this.init === r.init) && (r.init = function () { r.$super.init.apply(this, arguments) }), r.init.prototype = r, r.$super = this, r }, create: function () { var e = this.extend(); return e.init.apply(e, arguments), e }, init: function () { }, mixIn: function (e) { for (var r in e) e.hasOwnProperty(r) && (this[r] = e[r]); e.hasOwnProperty("toString") && (this.toString = e.toString) }, clone: function () { return this.init.prototype.extend(this) } } }(), y = i.WordArray = b.extend({ init: function (e, r) { e = this.words = e || [], r != k ? this.sigBytes = r : this.sigBytes = e.length * 4 }, toString: function (e) { return (e || g).stringify(this) }, concat: function (e) { var r = this.words, u = e.words, h = this.sigBytes, z = e.sigBytes; if (this.clamp(), h % 4) for (var w = 0; w < z; w++) { var F = u[w >>> 2] >>> 24 - w % 4 * 8 & 255; r[h + w >>> 2] |= F << 24 - (h + w) % 4 * 8 } else for (var B = 0; B < z; B += 4)r[h + B >>> 2] = u[B >>> 2]; return this.sigBytes += z, this }, clamp: function () { var e = this.words, r = this.sigBytes; e[r >>> 2] &= 4294967295 << 32 - r % 4 * 8, e.length = t.ceil(r / 4) }, clone: function () { var e = b.clone.call(this); return e.words = this.words.slice(0), e }, random: function (e) { for (var r = [], u = 0; u < e; u += 4)r.push(P()); return new y.init(r, e) } }), l = K.enc = {}, g = l.Hex = { stringify: function (e) { for (var r = e.words, u = e.sigBytes, h = [], z = 0; z < u; z++) { var w = r[z >>> 2] >>> 24 - z % 4 * 8 & 255; h.push((w >>> 4).toString(16)), h.push((w & 15).toString(16)) } return h.join("") }, parse: function (e) { for (var r = e.length, u = [], h = 0; h < r; h += 2)u[h >>> 3] |= parseInt(e.substr(h, 2), 16) << 24 - h % 8 * 4; return new y.init(u, r / 2) } }, p = l.Latin1 = { stringify: function (e) { for (var r = e.words, u = e.sigBytes, h = [], z = 0; z < u; z++) { var w = r[z >>> 2] >>> 24 - z % 4 * 8 & 255; h.push(String.fromCharCode(w)) } return h.join("") }, parse: function (e) { for (var r = e.length, u = [], h = 0; h < r; h++)u[h >>> 2] |= (e.charCodeAt(h) & 255) << 24 - h % 4 * 8; return new y.init(u, r) } }, _ = l.Utf8 = { stringify: function (e) { try { return decodeURIComponent(escape(p.stringify(e))) } catch { throw new Error("Malformed UTF-8 data") } }, parse: function (e) { return p.parse(unescape(encodeURIComponent(e))) } }, x = i.BufferedBlockAlgorithm = b.extend({ reset: function () { this._data = new y.init, this._nDataBytes = 0 }, _append: function (e) { typeof e == "string" && (e = _.parse(e)), this._data.concat(e), this._nDataBytes += e.sigBytes }, _process: function (e) { var r, u = this._data, h = u.words, z = u.sigBytes, w = this.blockSize, F = w * 4, B = z / F; e ? B = t.ceil(B) : B = t.max((B | 0) - this._minBufferSize, 0); var W = B * w, q = t.min(W * 4, z); if (W) { for (var n = 0; n < W; n += w)this._doProcessBlock(h, n); r = h.splice(0, W), u.sigBytes -= q } return new y.init(r, q) }, clone: function () { var e = b.clone.call(this); return e._data = this._data.clone(), e }, _minBufferSize: 0 }), D = i.Hasher = x.extend({ cfg: b.extend(), init: function (e) { this.cfg = this.cfg.extend(e), this.reset() }, reset: function () { x.reset.call(this), this._doReset() }, update: function (e) { return this._append(e), this._process(), this }, finalize: function (e) { e && this._append(e); var r = this._doFinalize(); return r }, blockSize: 512 / 32, _createHelper: function (e) { return function (r, u) { return new e.init(u).finalize(r) } }, _createHmacHelper: function (e) { return function (r, u) { return new S.HMAC.init(e, u).finalize(r) } } }), S = K.algo = {}; return K }(Math); return v }) }); var ue = I((j, de) => { (function (v, t) { typeof j == "object" ? de.exports = j = t(N()) : typeof define == "function" && define.amd ? define(["./core"], t) : t(v.CryptoJS) })(j, function (v) { return function () { var t = v, k = t.lib, C = k.WordArray, P = t.enc, A = P.Base64 = { stringify: function (i) { var b = i.words, y = i.sigBytes, l = this._map; i.clamp(); for (var g = [], p = 0; p < y; p += 3)for (var _ = b[p >>> 2] >>> 24 - p % 4 * 8 & 255, x = b[p + 1 >>> 2] >>> 24 - (p + 1) % 4 * 8 & 255, D = b[p + 2 >>> 2] >>> 24 - (p + 2) % 4 * 8 & 255, S = _ << 16 | x << 8 | D, e = 0; e < 4 && p + e * .75 < y; e++)g.push(l.charAt(S >>> 6 * (3 - e) & 63)); var r = l.charAt(64); if (r) for (; g.length % 4;)g.push(r); return g.join("") }, parse: function (i) { var b = i.length, y = this._map, l = this._reverseMap; if (!l) { l = this._reverseMap = []; for (var g = 0; g < y.length; g++)l[y.charCodeAt(g)] = g } var p = y.charAt(64); if (p) { var _ = i.indexOf(p); _ !== -1 && (b = _) } return K(i, b, l) }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" }; function K(i, b, y) { for (var l = [], g = 0, p = 0; p < b; p++)if (p % 4) { var _ = y[i.charCodeAt(p - 1)] << p % 4 * 2, x = y[i.charCodeAt(p)] >>> 6 - p % 4 * 2, D = _ | x; l[g >>> 2] |= D << 24 - g % 4 * 8, g++ } return C.create(l, g) } }(), v.enc.Base64 }) }); var le = I((V, he) => { (function (v, t) { typeof V == "object" ? he.exports = V = t(N()) : typeof define == "function" && define.amd ? define(["./core"], t) : t(v.CryptoJS) })(V, function (v) { return function (t) { var k = v, C = k.lib, P = C.WordArray, A = C.Hasher, K = k.algo, i = []; (function () { for (var _ = 0; _ < 64; _++)i[_] = t.abs(t.sin(_ + 1)) * 4294967296 | 0 })(); var b = K.MD5 = A.extend({ _doReset: function () { this._hash = new P.init([1732584193, 4023233417, 2562383102, 271733878]) }, _doProcessBlock: function (_, x) { for (var D = 0; D < 16; D++) { var S = x + D, e = _[S]; _[S] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360 } var r = this._hash.words, u = _[x + 0], h = _[x + 1], z = _[x + 2], w = _[x + 3], F = _[x + 4], B = _[x + 5], W = _[x + 6], q = _[x + 7], n = _[x + 8], d = _[x + 9], m = _[x + 10], o = _[x + 11], E = _[x + 12], H = _[x + 13], L = _[x + 14], R = _[x + 15], a = r[0], s = r[1], f = r[2], c = r[3]; a = y(a, s, f, c, u, 7, i[0]), c = y(c, a, s, f, h, 12, i[1]), f = y(f, c, a, s, z, 17, i[2]), s = y(s, f, c, a, w, 22, i[3]), a = y(a, s, f, c, F, 7, i[4]), c = y(c, a, s, f, B, 12, i[5]), f = y(f, c, a, s, W, 17, i[6]), s = y(s, f, c, a, q, 22, i[7]), a = y(a, s, f, c, n, 7, i[8]), c = y(c, a, s, f, d, 12, i[9]), f = y(f, c, a, s, m, 17, i[10]), s = y(s, f, c, a, o, 22, i[11]), a = y(a, s, f, c, E, 7, i[12]), c = y(c, a, s, f, H, 12, i[13]), f = y(f, c, a, s, L, 17, i[14]), s = y(s, f, c, a, R, 22, i[15]), a = l(a, s, f, c, h, 5, i[16]), c = l(c, a, s, f, W, 9, i[17]), f = l(f, c, a, s, o, 14, i[18]), s = l(s, f, c, a, u, 20, i[19]), a = l(a, s, f, c, B, 5, i[20]), c = l(c, a, s, f, m, 9, i[21]), f = l(f, c, a, s, R, 14, i[22]), s = l(s, f, c, a, F, 20, i[23]), a = l(a, s, f, c, d, 5, i[24]), c = l(c, a, s, f, L, 9, i[25]), f = l(f, c, a, s, w, 14, i[26]), s = l(s, f, c, a, n, 20, i[27]), a = l(a, s, f, c, H, 5, i[28]), c = l(c, a, s, f, z, 9, i[29]), f = l(f, c, a, s, q, 14, i[30]), s = l(s, f, c, a, E, 20, i[31]), a = g(a, s, f, c, B, 4, i[32]), c = g(c, a, s, f, n, 11, i[33]), f = g(f, c, a, s, o, 16, i[34]), s = g(s, f, c, a, L, 23, i[35]), a = g(a, s, f, c, h, 4, i[36]), c = g(c, a, s, f, F, 11, i[37]), f = g(f, c, a, s, q, 16, i[38]), s = g(s, f, c, a, m, 23, i[39]), a = g(a, s, f, c, H, 4, i[40]), c = g(c, a, s, f, u, 11, i[41]), f = g(f, c, a, s, w, 16, i[42]), s = g(s, f, c, a, W, 23, i[43]), a = g(a, s, f, c, d, 4, i[44]), c = g(c, a, s, f, E, 11, i[45]), f = g(f, c, a, s, R, 16, i[46]), s = g(s, f, c, a, z, 23, i[47]), a = p(a, s, f, c, u, 6, i[48]), c = p(c, a, s, f, q, 10, i[49]), f = p(f, c, a, s, L, 15, i[50]), s = p(s, f, c, a, B, 21, i[51]), a = p(a, s, f, c, E, 6, i[52]), c = p(c, a, s, f, w, 10, i[53]), f = p(f, c, a, s, m, 15, i[54]), s = p(s, f, c, a, h, 21, i[55]), a = p(a, s, f, c, n, 6, i[56]), c = p(c, a, s, f, R, 10, i[57]), f = p(f, c, a, s, W, 15, i[58]), s = p(s, f, c, a, H, 21, i[59]), a = p(a, s, f, c, F, 6, i[60]), c = p(c, a, s, f, o, 10, i[61]), f = p(f, c, a, s, z, 15, i[62]), s = p(s, f, c, a, d, 21, i[63]), r[0] = r[0] + a | 0, r[1] = r[1] + s | 0, r[2] = r[2] + f | 0, r[3] = r[3] + c | 0 }, _doFinalize: function () { var _ = this._data, x = _.words, D = this._nDataBytes * 8, S = _.sigBytes * 8; x[S >>> 5] |= 128 << 24 - S % 32; var e = t.floor(D / 4294967296), r = D; x[(S + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360, x[(S + 64 >>> 9 << 4) + 14] = (r << 8 | r >>> 24) & 16711935 | (r << 24 | r >>> 8) & 4278255360, _.sigBytes = (x.length + 1) * 4, this._process(); for (var u = this._hash, h = u.words, z = 0; z < 4; z++) { var w = h[z]; h[z] = (w << 8 | w >>> 24) & 16711935 | (w << 24 | w >>> 8) & 4278255360 } return u }, clone: function () { var _ = A.clone.call(this); return _._hash = this._hash.clone(), _ } }); function y(_, x, D, S, e, r, u) { var h = _ + (x & D | ~x & S) + e + u; return (h << r | h >>> 32 - r) + x } function l(_, x, D, S, e, r, u) { var h = _ + (x & S | D & ~S) + e + u; return (h << r | h >>> 32 - r) + x } function g(_, x, D, S, e, r, u) { var h = _ + (x ^ D ^ S) + e + u; return (h << r | h >>> 32 - r) + x } function p(_, x, D, S, e, r, u) { var h = _ + (D ^ (x | ~S)) + e + u; return (h << r | h >>> 32 - r) + x } k.MD5 = A._createHelper(b), k.HmacMD5 = A._createHmacHelper(b) }(Math), v.MD5 }) }); var _e = I((M, pe) => { (function (v, t) { typeof M == "object" ? pe.exports = M = t(N()) : typeof define == "function" && define.amd ? define(["./core"], t) : t(v.CryptoJS) })(M, function (v) { return function () { var t = v, k = t.lib, C = k.WordArray, P = k.Hasher, A = t.algo, K = [], i = A.SHA1 = P.extend({ _doReset: function () { this._hash = new C.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]) }, _doProcessBlock: function (b, y) { for (var l = this._hash.words, g = l[0], p = l[1], _ = l[2], x = l[3], D = l[4], S = 0; S < 80; S++) { if (S < 16) K[S] = b[y + S] | 0; else { var e = K[S - 3] ^ K[S - 8] ^ K[S - 14] ^ K[S - 16]; K[S] = e << 1 | e >>> 31 } var r = (g << 5 | g >>> 27) + D + K[S]; S < 20 ? r += (p & _ | ~p & x) + 1518500249 : S < 40 ? r += (p ^ _ ^ x) + 1859775393 : S < 60 ? r += (p & _ | p & x | _ & x) - 1894007588 : r += (p ^ _ ^ x) - 899497514, D = x, x = _, _ = p << 30 | p >>> 2, p = g, g = r } l[0] = l[0] + g | 0, l[1] = l[1] + p | 0, l[2] = l[2] + _ | 0, l[3] = l[3] + x | 0, l[4] = l[4] + D | 0 }, _doFinalize: function () { var b = this._data, y = b.words, l = this._nDataBytes * 8, g = b.sigBytes * 8; return y[g >>> 5] |= 128 << 24 - g % 32, y[(g + 64 >>> 9 << 4) + 14] = Math.floor(l / 4294967296), y[(g + 64 >>> 9 << 4) + 15] = l, b.sigBytes = y.length * 4, this._process(), this._hash }, clone: function () { var b = P.clone.call(this); return b._hash = this._hash.clone(), b } }); t.SHA1 = P._createHelper(i), t.HmacSHA1 = P._createHmacHelper(i) }(), v.SHA1 }) }); var xe = I((U, ye) => { (function (v, t) { typeof U == "object" ? ye.exports = U = t(N()) : typeof define == "function" && define.amd ? define(["./core"], t) : t(v.CryptoJS) })(U, function (v) { (function () { var t = v, k = t.lib, C = k.Base, P = t.enc, A = P.Utf8, K = t.algo, i = K.HMAC = C.extend({ init: function (b, y) { b = this._hasher = new b.init, typeof y == "string" && (y = A.parse(y)); var l = b.blockSize, g = l * 4; y.sigBytes > g && (y = b.finalize(y)), y.clamp(); for (var p = this._oKey = y.clone(), _ = this._iKey = y.clone(), x = p.words, D = _.words, S = 0; S < l; S++)x[S] ^= 1549556828, D[S] ^= 909522486; p.sigBytes = _.sigBytes = g, this.reset() }, reset: function () { var b = this._hasher; b.reset(), b.update(this._iKey) }, update: function (b) { return this._hasher.update(b), this }, finalize: function (b) { var y = this._hasher, l = y.finalize(b); y.reset(); var g = y.finalize(this._oKey.clone().concat(l)); return g } }) })() }) }); var re = I((J, ge) => { (function (v, t, k) { typeof J == "object" ? ge.exports = J = t(N(), _e(), xe()) : typeof define == "function" && define.amd ? define(["./core", "./sha1", "./hmac"], t) : t(v.CryptoJS) })(J, function (v) { return function () { var t = v, k = t.lib, C = k.Base, P = k.WordArray, A = t.algo, K = A.MD5, i = A.EvpKDF = C.extend({ cfg: C.extend({ keySize: 128 / 32, hasher: K, iterations: 1 }), init: function (b) { this.cfg = this.cfg.extend(b) }, compute: function (b, y) { for (var l, g = this.cfg, p = g.hasher.create(), _ = P.create(), x = _.words, D = g.keySize, S = g.iterations; x.length < D;) { l && p.update(l), l = p.update(b).finalize(y), p.reset(); for (var e = 1; e < S; e++)l = p.finalize(l), p.reset(); _.concat(l) } return _.sigBytes = D * 4, _ } }); t.EvpKDF = function (b, y, l) { return i.create(l).compute(b, y) } }(), v.EvpKDF }) }); var $ = I((G, me) => { (function (v, t, k) { typeof G == "object" ? me.exports = G = t(N(), re()) : typeof define == "function" && define.amd ? define(["./core", "./evpkdf"], t) : t(v.CryptoJS) })(G, function (v) { v.lib.Cipher || function (t) { var k = v, C = k.lib, P = C.Base, A = C.WordArray, K = C.BufferedBlockAlgorithm, i = k.enc, b = i.Utf8, y = i.Base64, l = k.algo, g = l.EvpKDF, p = C.Cipher = K.extend({ cfg: P.extend(), createEncryptor: function (n, d) { return this.create(this._ENC_XFORM_MODE, n, d) }, createDecryptor: function (n, d) { return this.create(this._DEC_XFORM_MODE, n, d) }, init: function (n, d, m) { this.cfg = this.cfg.extend(m), this._xformMode = n, this._key = d, this.reset() }, reset: function () { K.reset.call(this), this._doReset() }, process: function (n) { return this._append(n), this._process() }, finalize: function (n) { n && this._append(n); var d = this._doFinalize(); return d }, keySize: 128 / 32, ivSize: 128 / 32, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function () { function n(d) { return typeof d == "string" ? q : F } return function (d) { return { encrypt: function (m, o, E) { return n(o).encrypt(d, m, o, E) }, decrypt: function (m, o, E) { return n(o).decrypt(d, m, o, E) } } } }() }), _ = C.StreamCipher = p.extend({ _doFinalize: function () { var n = this._process(!0); return n }, blockSize: 1 }), x = k.mode = {}, D = C.BlockCipherMode = P.extend({ createEncryptor: function (n, d) { return this.Encryptor.create(n, d) }, createDecryptor: function (n, d) { return this.Decryptor.create(n, d) }, init: function (n, d) { this._cipher = n, this._iv = d } }), S = x.CBC = function () { var n = D.extend(); n.Encryptor = n.extend({ processBlock: function (m, o) { var E = this._cipher, H = E.blockSize; d.call(this, m, o, H), E.encryptBlock(m, o), this._prevBlock = m.slice(o, o + H) } }), n.Decryptor = n.extend({ processBlock: function (m, o) { var E = this._cipher, H = E.blockSize, L = m.slice(o, o + H); E.decryptBlock(m, o), d.call(this, m, o, H), this._prevBlock = L } }); function d(m, o, E) { var H, L = this._iv; L ? (H = L, this._iv = t) : H = this._prevBlock; for (var R = 0; R < E; R++)m[o + R] ^= H[R] } return n }(), e = k.pad = {}, r = e.Pkcs7 = { pad: function (n, d) { for (var m = d * 4, o = m - n.sigBytes % m, E = o << 24 | o << 16 | o << 8 | o, H = [], L = 0; L < o; L += 4)H.push(E); var R = A.create(H, o); n.concat(R) }, unpad: function (n) { var d = n.words[n.sigBytes - 1 >>> 2] & 255; n.sigBytes -= d } }, u = C.BlockCipher = p.extend({ cfg: p.cfg.extend({ mode: S, padding: r }), reset: function () { var n; p.reset.call(this); var d = this.cfg, m = d.iv, o = d.mode; this._xformMode == this._ENC_XFORM_MODE ? n = o.createEncryptor : (n = o.createDecryptor, this._minBufferSize = 1), this._mode && this._mode.__creator == n ? this._mode.init(this, m && m.words) : (this._mode = n.call(o, this, m && m.words), this._mode.__creator = n) }, _doProcessBlock: function (n, d) { this._mode.processBlock(n, d) }, _doFinalize: function () { var n, d = this.cfg.padding; return this._xformMode == this._ENC_XFORM_MODE ? (d.pad(this._data, this.blockSize), n = this._process(!0)) : (n = this._process(!0), d.unpad(n)), n }, blockSize: 128 / 32 }), h = C.CipherParams = P.extend({ init: function (n) { this.mixIn(n) }, toString: function (n) { return (n || this.formatter).stringify(this) } }), z = k.format = {}, w = z.OpenSSL = { stringify: function (n) { var d, m = n.ciphertext, o = n.salt; return o ? d = A.create([1398893684, 1701076831]).concat(o).concat(m) : d = m, d.toString(y) }, parse: function (n) { var d, m = y.parse(n), o = m.words; return o[0] == 1398893684 && o[1] == 1701076831 && (d = A.create(o.slice(2, 4)), o.splice(0, 4), m.sigBytes -= 16), h.create({ ciphertext: m, salt: d }) } }, F = C.SerializableCipher = P.extend({ cfg: P.extend({ format: w }), encrypt: function (n, d, m, o) { o = this.cfg.extend(o); var E = n.createEncryptor(m, o), H = E.finalize(d), L = E.cfg; return h.create({ ciphertext: H, key: m, iv: L.iv, algorithm: n, mode: L.mode, padding: L.padding, blockSize: n.blockSize, formatter: o.format }) }, decrypt: function (n, d, m, o) { o = this.cfg.extend(o), d = this._parse(d, o.format); var E = n.createDecryptor(m, o).finalize(d.ciphertext); return E }, _parse: function (n, d) { return typeof n == "string" ? d.parse(n, this) : n } }), B = k.kdf = {}, W = B.OpenSSL = { execute: function (n, d, m, o, E) { if (o || (o = A.random(64 / 8)), E) var H = g.create({ keySize: d + m, hasher: E }).compute(n, o); else var H = g.create({ keySize: d + m }).compute(n, o); var L = A.create(H.words.slice(d), m * 4); return H.sigBytes = d * 4, h.create({ key: H, iv: L, salt: o }) } }, q = C.PasswordBasedCipher = F.extend({ cfg: F.cfg.extend({ kdf: W }), encrypt: function (n, d, m, o) { o = this.cfg.extend(o); var E = o.kdf.execute(m, n.keySize, n.ivSize, o.salt, o.hasher); o.iv = E.iv; var H = F.encrypt.call(this, n, d, E.key, o); return H.mixIn(E), H }, decrypt: function (n, d, m, o) { o = this.cfg.extend(o), d = this._parse(d, o.format); var E = o.kdf.execute(m, n.keySize, n.ivSize, d.salt, o.hasher); o.iv = E.iv; var H = F.decrypt.call(this, n, d, E.key, o); return H } }) }() }) }); var Ce = I((Q, Be) => { (function (v, t, k) { typeof Q == "object" ? Be.exports = Q = t(N(), ue(), le(), re(), $()) : typeof define == "function" && define.amd ? define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], t) : t(v.CryptoJS) })(Q, function (v) { return function () { var t = v, k = t.lib, C = k.BlockCipher, P = t.algo, A = [], K = [], i = [], b = [], y = [], l = [], g = [], p = [], _ = [], x = []; (function () { for (var e = [], r = 0; r < 256; r++)r < 128 ? e[r] = r << 1 : e[r] = r << 1 ^ 283; for (var u = 0, h = 0, r = 0; r < 256; r++) { var z = h ^ h << 1 ^ h << 2 ^ h << 3 ^ h << 4; z = z >>> 8 ^ z & 255 ^ 99, A[u] = z, K[z] = u; var w = e[u], F = e[w], B = e[F], W = e[z] * 257 ^ z * 16843008; i[u] = W << 24 | W >>> 8, b[u] = W << 16 | W >>> 16, y[u] = W << 8 | W >>> 24, l[u] = W; var W = B * 16843009 ^ F * 65537 ^ w * 257 ^ u * 16843008; g[z] = W << 24 | W >>> 8, p[z] = W << 16 | W >>> 16, _[z] = W << 8 | W >>> 24, x[z] = W, u ? (u = w ^ e[e[e[B ^ w]]], h ^= e[e[h]]) : u = h = 1 } })(); var D = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54], S = P.AES = C.extend({ _doReset: function () { var e; if (!(this._nRounds && this._keyPriorReset === this._key)) { for (var r = this._keyPriorReset = this._key, u = r.words, h = r.sigBytes / 4, z = this._nRounds = h + 6, w = (z + 1) * 4, F = this._keySchedule = [], B = 0; B < w; B++)B < h ? F[B] = u[B] : (e = F[B - 1], B % h ? h > 6 && B % h == 4 && (e = A[e >>> 24] << 24 | A[e >>> 16 & 255] << 16 | A[e >>> 8 & 255] << 8 | A[e & 255]) : (e = e << 8 | e >>> 24, e = A[e >>> 24] << 24 | A[e >>> 16 & 255] << 16 | A[e >>> 8 & 255] << 8 | A[e & 255], e ^= D[B / h | 0] << 24), F[B] = F[B - h] ^ e); for (var W = this._invKeySchedule = [], q = 0; q < w; q++) { var B = w - q; if (q % 4) var e = F[B]; else var e = F[B - 4]; q < 4 || B <= 4 ? W[q] = e : W[q] = g[A[e >>> 24]] ^ p[A[e >>> 16 & 255]] ^ _[A[e >>> 8 & 255]] ^ x[A[e & 255]] } } }, encryptBlock: function (e, r) { this._doCryptBlock(e, r, this._keySchedule, i, b, y, l, A) }, decryptBlock: function (e, r) { var u = e[r + 1]; e[r + 1] = e[r + 3], e[r + 3] = u, this._doCryptBlock(e, r, this._invKeySchedule, g, p, _, x, K); var u = e[r + 1]; e[r + 1] = e[r + 3], e[r + 3] = u }, _doCryptBlock: function (e, r, u, h, z, w, F, B) { for (var W = this._nRounds, q = e[r] ^ u[0], n = e[r + 1] ^ u[1], d = e[r + 2] ^ u[2], m = e[r + 3] ^ u[3], o = 4, E = 1; E < W; E++) { var H = h[q >>> 24] ^ z[n >>> 16 & 255] ^ w[d >>> 8 & 255] ^ F[m & 255] ^ u[o++], L = h[n >>> 24] ^ z[d >>> 16 & 255] ^ w[m >>> 8 & 255] ^ F[q & 255] ^ u[o++], R = h[d >>> 24] ^ z[m >>> 16 & 255] ^ w[q >>> 8 & 255] ^ F[n & 255] ^ u[o++], a = h[m >>> 24] ^ z[q >>> 16 & 255] ^ w[n >>> 8 & 255] ^ F[d & 255] ^ u[o++]; q = H, n = L, d = R, m = a } var H = (B[q >>> 24] << 24 | B[n >>> 16 & 255] << 16 | B[d >>> 8 & 255] << 8 | B[m & 255]) ^ u[o++], L = (B[n >>> 24] << 24 | B[d >>> 16 & 255] << 16 | B[m >>> 8 & 255] << 8 | B[q & 255]) ^ u[o++], R = (B[d >>> 24] << 24 | B[m >>> 16 & 255] << 16 | B[q >>> 8 & 255] << 8 | B[n & 255]) ^ u[o++], a = (B[m >>> 24] << 24 | B[q >>> 16 & 255] << 16 | B[n >>> 8 & 255] << 8 | B[d & 255]) ^ u[o++]; e[r] = H, e[r + 1] = L, e[r + 2] = R, e[r + 3] = a }, keySize: 256 / 32 }); t.AES = C._createHelper(S) }(), v.AES }) }); var ke = I((Y, be) => { (function (v, t, k) { typeof Y == "object" ? be.exports = Y = t(N(), $()) : typeof define == "function" && define.amd ? define(["./core", "./cipher-core"], t) : t(v.CryptoJS) })(Y, function (v) { return v.mode.ECB = function () { var t = v.lib.BlockCipherMode.extend(); return t.Encryptor = t.extend({ processBlock: function (k, C) { this._cipher.encryptBlock(k, C) } }), t.Decryptor = t.extend({ processBlock: function (k, C) { this._cipher.decryptBlock(k, C) } }), t }(), v.mode.ECB }) }); var Se = I((Z, ze) => { (function (v, t, k) { typeof Z == "object" ? ze.exports = Z = t(N(), $()) : typeof define == "function" && define.amd ? define(["./core", "./cipher-core"], t) : t(v.CryptoJS) })(Z, function (v) { return v.pad.Pkcs7 }) }); var Ee = I((X, we) => { (function (v, t) { typeof X == "object" ? we.exports = X = t(N()) : typeof define == "function" && define.amd ? define(["./core"], t) : t(v.CryptoJS) })(X, function (v) { return v.enc.Hex }) }); var He = I((ee, Ae) => { (function (v, t) { typeof ee == "object" ? Ae.exports = ee = t(N()) : typeof define == "function" && define.amd ? define(["./core"], t) : t(v.CryptoJS) })(ee, function (v) { return v.enc.Utf8 }) }); var te = O(Ce(), 1), ne = O(ke(), 1), ie = O(Se(), 1), ae = O(Ee(), 1), oe = O(He(), 1); function Oe(v, t) { let k = ae.default.parse(t); return te.default.encrypt(oe.default.parse(v), k, { mode: ne.default, padding: ie.default }).toString() } function Te(v, t) { let k = ae.default.parse(t); return te.default.decrypt(v, k, { mode: ne.default, padding: ie.default }).toString(oe.default) } function encrypt(data, keyHex) { return Oe(data, keyHex); }
function decrypt(base64Data, keyHex) { return Te(base64Data, keyHex); }


async function _sig(ts, raw, keyHex) {
  const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const dataBytes = new TextEncoder().encode(`${ts}-${raw}`);
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, dataBytes);
  let binary = "";
  const bytes = new Uint8Array(sigBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}


function normalizePhone(raw) {
  const p = (raw || "").replace(/[^\d+]/g, "").trim();
  if (p.startsWith("+")) return p;
  if (p.startsWith("0")) return "+62" + p.slice(1);
  if (p.startsWith("62")) return "+" + p;
  if (/^[1-9]\d{7,14}$/.test(p)) return "+" + p;
  return "+" + p;
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ==========================================
// KV STORAGE HELPER (Dengan Memory Fallback)
// ==========================================
async function kvGet(env, key, type = "text") {
  if (env.GTC_KV) {
    return await env.GTC_KV.get(key, type);
  }
  return MEM_STORE.get(key) || null;
}

async function kvPut(env, key, val, options = {}) {
  if (env.GTC_KV) {
    return await env.GTC_KV.put(key, val, options);
  }
  MEM_STORE.set(key, val);
}

async function kvDelete(env, key) {
  if (env.GTC_KV) {
    return await env.GTC_KV.delete(key);
  }
  MEM_STORE.delete(key);
}

// ==========================================
// REQUEST GETCONTACT SERVICE
// ==========================================
async function gtcCall(endpoint, payload, creds, env = null) {
  const raw = JSON.stringify(payload);
  const ts = Date.now().toString();

  const headers = {
    "User-Agent": "okhttp/4.9.2",
    "Content-Type": "application/json",
    "x-os": ANDROID_OS,
    "x-app-version": APP_VERSION,
    "x-client-device-id": creds.clientDeviceId,
    "x-lang": LANG,
    "x-req-timestamp": ts,
    "x-country-code": COUNTRY,
    "x-encrypted": "1",
    "x-req-signature": await _sig(ts, raw, HMAC_KEY),
  };

  if (creds.token) {
    headers["x-token"] = creds.token;
  }

  const baseUrl = (env && env.GTC_BASE) || GTC_BASE;
  const body = JSON.stringify({ data: encrypt(raw, creds.finalKey) });
  const res = await fetch(baseUrl + endpoint, { method: "POST", headers, body });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Respons server non-JSON (HTTP ${res.status})`);
  }

  if (json.data) {
    try {
      json = JSON.parse(decrypt(json.data, creds.finalKey));
    } catch {
      throw new Error("Gagal mendekripsi respons dari GetContact");
    }
  }

  const meta = json?.meta || {};
  const isForbidden = res.status === 403 || meta.httpStatusCode === 403;
  if (isForbidden) {
    const errorCode = String(meta.errorCode || "");
    const errorMsg = String(meta.errorMessage || "");
    const isActualCaptcha = errorCode === "403004" || errorMsg.toLowerCase().includes("captcha");

    if (isActualCaptcha) {
      const err = new Error("Akun GetContact saat ini membutuhkan penyelesaian Captcha.");
      err.isCaptcha = true;
      err.errorCode = errorCode;
      throw err;
    }

    const detail = errorMsg
      ? `${errorMsg} (Code: ${errorCode || "403"})`
      : `Akses ditolak oleh GetContact (HTTP 403 Forbidden / Cloudflare Datacenter IP dibatasi).`;
    const err = new Error(detail);
    err.isCaptcha = false;
    err.errorCode = errorCode;
    throw err;
  }

  if (res.status !== 200 || (meta.httpStatusCode && meta.httpStatusCode !== 200)) {
    throw new Error(meta.errorMessage || `HTTP ${res.status}`);
  }

  return json;
}

// Format informasi kuota dari subscriptionInfo
function formatQuotaInfo(subscriptionInfo) {
  const usage = subscriptionInfo?.usage;
  if (!usage) return null;
  const s = usage.search || {};
  const nd = usage.numberDetail || {};
  return `📊 <b>Sisa Kuota:</b> Cari Profil <code>${s.remainingCount ?? "?"}/${s.limit ?? "?"}</code> | Tag <code>${nd.remainingCount ?? "?"}/${nd.limit ?? "?"}</code>`;
}

// Ambil sisa kuota (non-blocking fallback)
async function getQuotaSummary(creds, env = null) {
  try {
    const res = await gtcCall("/v2.8/subscription", { token: creds.token }, creds, env);
    return formatQuotaInfo(res.result?.subscriptionInfo);
  } catch {
    return null;
  }
}

// ==========================================
// TELEGRAM BOT API HELPER
// ==========================================
async function tgCall(token, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

async function tgSendMessage(token, chatId, text, options = {}) {
  if (options.guest_query_id) {
    try {
      const res = await tgCall(token, "answerGuestQuery", {
        guest_query_id: options.guest_query_id,
        result: {
          type: "article",
          id: "res_" + Math.random().toString(36).substring(2, 10),
          title: "Hasil GetContact",
          input_message_content: {
            message_text: text,
            parse_mode: "HTML",
          },
          ...(options.reply_markup ? { reply_markup: options.reply_markup } : {}),
        },
      });
      if (res && res.ok) return res;
    } catch (e) {
      console.error("Gagal answerGuestQuery:", e);
    }
  }

  if (!chatId || chatId === "guest") return { ok: false };

  return tgCall(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...options,
  });
}

async function tgSendPhoto(token, chatId, photo, caption = "", options = {}) {
  if (typeof photo === "string") {
    // photo berupa file_id atau URL
    return tgCall(token, "sendPhoto", {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: "HTML",
      ...options,
    });
  }

  // photo berupa Buffer / ArrayBuffer / Blob (misal: captcha image)
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("photo", new Blob([photo], { type: "image/jpeg" }), "image.jpg");
  if (caption) form.append("caption", caption);
  form.append("parse_mode", "HTML");
  if (options.reply_markup) {
    form.append("reply_markup", JSON.stringify(options.reply_markup));
  }
  if (options.reply_to_message_id) {
    form.append("reply_to_message_id", String(options.reply_to_message_id));
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  return await res.json();
}

async function tgEditMessage(token, chatId, messageId, text, options = {}) {
  const payload = {
    text,
    parse_mode: "HTML",
    ...options,
  };
  if (options.inline_message_id) {
    payload.inline_message_id = options.inline_message_id;
    delete payload.chat_id;
    delete payload.message_id;
  } else if (!chatId && messageId) {
    payload.inline_message_id = messageId;
    delete payload.chat_id;
    delete payload.message_id;
  } else {
    payload.chat_id = chatId;
    payload.message_id = messageId;
  }
  return tgCall(token, "editMessageText", payload);
}

async function tgAnswerCallback(token, callbackQueryId, text = "", showAlert = false) {
  return tgCall(token, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

async function tgSendTyping(token, chatId) {
  if (!chatId || chatId === "guest") return;
  try {
    await tgCall(token, "sendChatAction", { chat_id: chatId, action: "typing" });
  } catch { }
}

// ==========================================
// SISTEM STATISTIK & GUEST MODE HELPER
// ==========================================
async function getBotInfo(token, env) {
  const cached = await kvGet(env, "bot:info");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch { }
  }
  try {
    const res = await tgCall(token, "getMe", {});
    if (res.ok && res.result) {
      await kvPut(env, "bot:info", JSON.stringify(res.result), { expirationTtl: 86400 * 7 });
      return res.result;
    }
  } catch { }
  return { username: "VexGetContact_bot", id: null };
}

function extractPhoneFromText(text) {
  if (!text) return null;
  // Format internasional (+1...) atau nomor Indonesia (08..., 62..., +62...)
  const match = text.match(/(?:\+[1-9]\d{6,14}|(?:\+?62|08|0)[0-9\s\-()]{7,15})/);
  if (match) {
    const cleaned = match[0].replace(/[^\d+]/g, "").trim();
    if (cleaned.length >= 8 && cleaned.length <= 16) {
      return cleaned;
    }
  }
  return null;
}

// ==========================================
// PEREKAMAN PENERIMA BROADCAST PRIBADI
// ==========================================
async function addBroadcastUser(env, chatId) {
  if (!chatId || chatId === "guest") return;
  const numId = Number(chatId);
  if (isNaN(numId) || numId < 0) return; // Khusus private chat (chat ID positif)
  try {
    const raw = await kvGet(env, "broadcast:users");
    let users = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) users = parsed;
      } catch { }
    }
    const idStr = String(chatId);
    if (!users.includes(idStr)) {
      users.push(idStr);
      await kvPut(env, "broadcast:users", JSON.stringify(users));
    }
  } catch (e) {
    console.error("Gagal menyimpan broadcast user:", e);
  }
}

async function getBroadcastUsers(env) {
  try {
    const raw = await kvGet(env, "broadcast:users");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
}

async function recordStats(env, type, chatId = null, userId = null, chatType = "private") {
  try {
    // 1. Catat user unik & simpan ke daftar broadcast jika private chat
    if (userId) {
      const uKey = `user:${userId}`;
      const exists = await kvGet(env, uKey);
      if (!exists) {
        await kvPut(env, uKey, String(Date.now()));
        const count = parseInt((await kvGet(env, "stats:total_users")) || "0", 10);
        await kvPut(env, "stats:total_users", String(count + 1));
      }
    }
    if (chatId && chatType === "private" && chatId !== "guest") {
      await addBroadcastUser(env, chatId);
    }

    // 2. Catat grup unik (Guest Mode)
    if (chatId && (chatType === "group" || chatType === "supergroup" || chatType === "channel")) {
      const gKey = `group:${chatId}`;
      const exists = await kvGet(env, gKey);
      if (!exists) {
        await kvPut(env, gKey, String(Date.now()));
        const count = parseInt((await kvGet(env, "stats:total_groups")) || "0", 10);
        await kvPut(env, "stats:total_groups", String(count + 1));
      }
    }

    // 3. Catat counter event
    if (type) {
      const sKey = `stats:${type}`;
      const count = parseInt((await kvGet(env, sKey)) || "0", 10);
      await kvPut(env, sKey, String(count + 1));
    }
  } catch (e) {
    console.error("Gagal mencatat statistik:", e);
  }
}

async function handleStats(token, chatId, env, replyId = null, editMsgId = null, inlineMsgId = null) {
  if (chatId && chatId !== "guest") {
    await tgSendTyping(token, chatId);
  }
  try {
    const [
      totalUsers,
      totalGroups,
      totalSearches,
      totalTags,
      totalCaptchas,
      creds,
      store,
      qrisFileId,
      qrisText,
    ] = await Promise.all([
      kvGet(env, "stats:total_users"),
      kvGet(env, "stats:total_groups"),
      kvGet(env, "stats:total_searches"),
      kvGet(env, "stats:total_tags"),
      kvGet(env, "stats:total_captchas"),
      getActiveCreds(env),
      loadAccountStore(env),
      kvGet(env, "assets:qris_file_id"),
      kvGet(env, "assets:qris_text"),
    ]);

    const accCount = Object.keys(store.accounts || {}).length + 1;

    let quotaLine1 = "🔍 <b>Sisa Kuota Profil:</b> <i>Tidak tersedia</i>";
    let quotaLine2 = "🏷️ <b>Sisa Kuota Tag:</b> <i>Tidak tersedia</i>";
    let resetLine = "📅 <b>Reset Kuota:</b> <code>-</code>";

    try {
      const subRes = await gtcCall("/v2.8/subscription", { token: creds.token }, creds, env);
      const usage = subRes.result?.subscriptionInfo?.usage || {};
      const s = usage.search || {};
      const nd = usage.numberDetail || {};
      const renewDate = subRes.result?.subscriptionInfo?.renewDate || "-";

      quotaLine1 = `🔍 <b>Sisa Kuota Profil:</b> <code>${s.remainingCount ?? "?"} / ${s.limit ?? "?"}</code>`;
      quotaLine2 = `🏷️ <b>Sisa Kuota Tag:</b> <code>${nd.remainingCount ?? "?"} / ${nd.limit ?? "?"}</code>`;
      resetLine = `📅 <b>Reset Kuota:</b> <code>${renewDate}</code>`;
    } catch (e) {
      quotaLine1 = `🔍 <b>Sisa Kuota:</b> <i>Gagal dicek (${escapeHtml(e.message)})</i>`;
    }

    const qrisStatus = qrisFileId ? "✅ Terpasang" : "❌ Belum diatur";
    const noteStr = qrisText ? `\n📝 <b>Catatan QRIS:</b> <i>${escapeHtml(qrisText)}</i>` : "";

    const text = [
      `📊 <b>Statistik Bot GetContact (Admin)</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👥 <b>Total Pengguna Unik:</b> <code>${parseInt(totalUsers || "0", 10).toLocaleString()}</code> user`,
      `👥 <b>Total Grup (Guest Mode):</b> <code>${parseInt(totalGroups || "0", 10).toLocaleString()}</code> grup`,
      `🔍 <b>Pencarian Profil:</b> <code>${parseInt(totalSearches || "0", 10).toLocaleString()}</code> kali`,
      `🏷️ <b>Pencarian Tag:</b> <code>${parseInt(totalTags || "0", 10).toLocaleString()}</code> kali`,
      `🔓 <b>Captcha Terpecahkan:</b> <code>${parseInt(totalCaptchas || "0", 10).toLocaleString()}</code> kali`,
      ``,
      `⚡ <b>Akun GetContact Aktif</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Nama Akun:</b> <code>${escapeHtml(creds.name)}</code> (${accCount} akun tersimpan)`,
      quotaLine1,
      quotaLine2,
      resetLine,
      ``,
      `☕ <b>Status Donasi QRIS</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📸 <b>Foto QRIS:</b> ${qrisStatus}${noteStr}`,
    ].join("\n");

    const replyMarkup = {
      inline_keyboard: [
        [{ text: "🔄 Refresh Statistik", callback_data: "refresh_stats" }],
      ],
    };

    if (inlineMsgId) {
      await tgEditMessage(token, null, null, text, { reply_markup: replyMarkup, inline_message_id: inlineMsgId });
    } else if (editMsgId) {
      await tgEditMessage(token, chatId, editMsgId, text, { reply_markup: replyMarkup });
    } else {
      await tgSendMessage(token, chatId, text, {
        reply_to_message_id: replyId,
        reply_markup: replyMarkup,
      });
    }
  } catch (err) {
    const errMsg = `❌ <b>Gagal memuat statistik:</b> ${escapeHtml(err.message)}`;
    if (inlineMsgId) await tgEditMessage(token, null, null, errMsg, { inline_message_id: inlineMsgId });
    else if (editMsgId) await tgEditMessage(token, chatId, editMsgId, errMsg);
    else await tgSendMessage(token, chatId, errMsg, { reply_to_message_id: replyId });
  }
}

// ==========================================
// MANAJEMEN AKUN & OTORISASI ADMIN
// ==========================================
function isAdminUser(userId, env) {
  const adminChatId = String(env.ADMIN_CHAT_ID || "");
  const adminIds = (env.ADMIN_USER_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const strId = String(userId);
  return (adminChatId && adminChatId === strId) || adminIds.includes(strId);
}

async function getActiveCreds(env) {
  // 1. Cek dari KV jika ada multi-account tersimpan
  const storeRaw = await kvGet(env, "config:accounts");
  if (storeRaw) {
    try {
      const store = JSON.parse(storeRaw);
      const activeName = store.active;
      if (activeName && store.accounts?.[activeName]) {
        return { name: activeName, ...store.accounts[activeName] };
      }
    } catch { }
  }

  // 2. Fallback ke Environment Variables default
  return {
    name: "default",
    token: env.GTC_TOKEN,
    finalKey: env.GTC_FINAL_KEY,
    clientDeviceId: env.GTC_DEVICE_ID,
  };
}

async function loadAccountStore(env) {
  const raw = await kvGet(env, "config:accounts");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch { }
  }
  return { active: "default", accounts: {} };
}

async function saveAccountStore(env, store) {
  await kvPut(env, "config:accounts", JSON.stringify(store));
}

// Memeriksa apakah error memicu rotasi akun otomatis:
// 403021 = maximum query limit (kuota habis)
// 403001 = Authentication failed (token invalid / kedaluwarsa)
function isRotatableError(err) {
  if (!err) return false;
  const code = String(err.errorCode || "");
  const msg = String(err.message || "").toLowerCase();
  return (
    code === "403021" ||
    code === "403001" ||
    msg.includes("maximum query limit") ||
    msg.includes("authentication failed")
  );
}

// Rotasi akun otomatis saat terkena limit 403021 atau autentikasi kedaluwarsa 403001
async function rotateToNextAccount(env, failedAccountName, reason = "") {
  const store = await loadAccountStore(env);
  const accountNames = Object.keys(store.accounts || {});

  // Sertakan 'default' jika ada kredensial di env var
  if (env.GTC_TOKEN && !accountNames.includes("default")) {
    accountNames.unshift("default");
  }

  // Jika akun yang tersedia hanya 1 atau tidak ada akun lain, tidak bisa rotasi
  if (accountNames.length <= 1) {
    return null;
  }

  const currentIndex = accountNames.indexOf(failedAccountName);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % accountNames.length : 0;
  const nextName = accountNames[nextIndex];

  if (nextName === failedAccountName) {
    return null;
  }

  store.active = nextName;
  await saveAccountStore(env, store);

  let newCreds;
  if (nextName === "default") {
    newCreds = {
      name: "default",
      token: env.GTC_TOKEN,
      finalKey: env.GTC_FINAL_KEY,
      clientDeviceId: env.GTC_DEVICE_ID,
    };
  } else {
    newCreds = { name: nextName, ...store.accounts[nextName] };
  }

  // Kirim notifikasi alert ke Admin
  const adminChatId = env.ADMIN_CHAT_ID;
  const botToken = env.TELEGRAM_BOT_TOKEN;
  if (adminChatId && botToken) {
    const reasonText = reason || "Limit Kuota (403021) / Autentikasi Gagal (403001)";
    const alertMsg = [
      `⚠️ <b>Notifikasi Rotasi Akun Otomatis</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Akun <code>${escapeHtml(failedAccountName)}</code> bermasalah: <i>${escapeHtml(reasonText)}</i>.`,
      `Sistem otomatis beralih ke akun cadangan: <code>${escapeHtml(nextName)}</code>.`,
    ].join("\n");
    tgSendMessage(botToken, adminChatId, alertMsg).catch(() => {});
  }

  return newCreds;
}

// ==========================================
// EKSTRAKSI EMAIL & HANDLER PENCARIAN PROFIL
// ==========================================
function extractEmail(res) {
  if (!res) return null;
  const p = res.result?.profile || res.profile;
  const candidates = [
    p?.email,
    p?.eMail,
    p?.mail,
    p?.userEmail,
    res.result?.email,
    res.result?.user?.email,
    res.result?.account?.email,
    res.result?.business?.email,
    p?.details?.email,
    p?.contact?.email,
  ];

  for (const c of candidates) {
    if (!c) continue;
    if (typeof c === "string" && c.trim() && c.includes("@")) {
      return c.trim();
    }
    if (typeof c === "object") {
      if (typeof c.email === "string" && c.email.includes("@")) return c.email.trim();
      if (typeof c.address === "string" && c.address.includes("@")) return c.address.trim();
      if (typeof c.value === "string" && c.value.includes("@")) return c.value.trim();
      if (Array.isArray(c)) {
        for (const item of c) {
          if (typeof item === "string" && item.includes("@")) return item.trim();
          if (item && typeof item.email === "string") return item.email.trim();
        }
      }
    }
  }

  if (p && typeof p === "object") {
    for (const [k, v] of Object.entries(p)) {
      if (typeof v === "string" && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v.trim())) {
        return v.trim();
      }
    }
  }

  return null;
}

function extractTrustScore(res) {
  if (!res) return null;
  const p = res.result?.profile || res.profile;
  const t = res.result?.trust || res.trust;

  // 1. Cek di profile.trustScore
  if (p?.trustScore !== null && p?.trustScore !== undefined) {
    if (typeof p.trustScore === "object") {
      const score = p.trustScore.score ?? p.trustScore.value ?? p.trustScore.point;
      if (score !== null && score !== undefined) return String(score);
    } else {
      return String(p.trustScore);
    }
  }

  // 2. Cek di result.trust
  if (t !== null && t !== undefined) {
    if (typeof t === "object") {
      const score = t.score ?? t.value ?? t.point;
      if (score !== null && score !== undefined) return String(score);
    } else {
      return String(t);
    }
  }

  // 3. Cek di result.trustScore
  if (res.result?.trustScore !== null && res.result?.trustScore !== undefined) {
    return String(res.result.trustScore);
  }

  return null;
}

async function handleSearchProfile(token, chatId, rawPhone, env, replyId = null, editMsgId = null, guestQueryId = null, inlineMsgId = null, ownerId = null) {
  const phone = normalizePhone(rawPhone);
  if (!phone || phone.length < 8) {
    const errorText = "⚠️ <b>Nomor telepon tidak valid.</b>\nContoh: <code>081234567890</code>";
    if (inlineMsgId) await tgEditMessage(token, null, null, errorText, { inline_message_id: inlineMsgId });
    else if (editMsgId) await tgEditMessage(token, chatId, editMsgId, errorText);
    else await tgSendMessage(token, chatId, errorText, { reply_to_message_id: replyId, guest_query_id: guestQueryId });
    return;
  }

  if (chatId && chatId !== "guest") {
    await tgSendTyping(token, chatId);
  }
  await recordStats(env, "total_searches");

  try {
    let creds = await getActiveCreds(env);
    let res;

    try {
      res = await gtcCall("/v2.8/search", { countryCode: COUNTRY, phoneNumber: phone, source: "search", token: creds.token }, creds, env);
    } catch (err) {
      if (isRotatableError(err)) {
        const nextCreds = await rotateToNextAccount(env, creds.name, err.message);
        if (nextCreds) {
          creds = nextCreds;
          res = await gtcCall("/v2.8/search", { countryCode: COUNTRY, phoneNumber: phone, source: "search", token: creds.token }, creds, env);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const profile = res.result?.profile;
    const hasName = Boolean(profile && (profile.displayName || profile.name));
    if (!profile || !hasName) {
      const notFound = `🔍 <b>Hasil:</b> <code>${phone}</code>\n\nNomor ini belum terdaftar di database GetContact.`;
      if (inlineMsgId) await tgEditMessage(token, null, null, notFound, { inline_message_id: inlineMsgId });
      else if (editMsgId) await tgEditMessage(token, chatId, editMsgId, notFound);
      else await tgSendMessage(token, chatId, notFound, { reply_to_message_id: replyId, guest_query_id: guestQueryId });
      return;
    }

    const tagCount = profile.tagCount ?? 0;
    const name = profile.displayName || profile.name || "Tidak diketahui";

    // 1. Ekstraksi email dari respons pencarian
    let email = extractEmail(res);

    // 2. Jika akun sendiri yang dicari (atau nomor akun aktif), ambil email via endpoint profil akun (/v2.8/profile)
    const isSelfSearch = Boolean(
      res.result?.searchedHimself ||
      (creds.phoneNumber && normalizePhone(creds.phoneNumber) === phone) ||
      (creds.name && normalizePhone(creds.name) === phone)
    );
    let selfProfile = null;
    if (isSelfSearch && creds.token) {
      try {
        selfProfile = await gtcCall("/v2.8/profile", { token: creds.token }, creds, env);
        if (!email) email = extractEmail(selfProfile);
      } catch { }
    }

    // 3. Fallback periksa seluruh akun cadangan tersimpan jika nomor target cocok
    if (!email) {
      try {
        const store = await loadAccountStore(env);
        for (const [accName, accData] of Object.entries(store.accounts || {})) {
          const accPhone = accData?.phoneNumber || accName;
          if (accPhone && normalizePhone(accPhone) === phone && accData.token) {
            const extraProfile = await gtcCall("/v2.8/profile", { token: accData.token }, accData, env);
            email = extractEmail(extraProfile);
            if (!selfProfile) selfProfile = extraProfile;
            if (email) break;
          }
        }
      } catch { }
    }

    // 4. Ekstraksi Trust Score
    const trustScore = extractTrustScore(res) || (selfProfile ? extractTrustScore(selfProfile) : null);

    const textParts = [
      `👤 <b>Informasi Kontak GetContact</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📱 <b>Nomor:</b> <code>${escapeHtml(profile.displayNumber || phone)}</code>`,
      `📛 <b>Nama:</b> <b>${escapeHtml(name)}</b>`,
    ];

    // Jika ada email, tampilkan. Jika tidak ada email, hilangkan bagian email.
    if (email) {
      textParts.push(`📧 <b>Email:</b> <code>${escapeHtml(email)}</code>`);
    }

    // Tampilkan Trust Score
    if (trustScore !== null && trustScore !== undefined && trustScore !== "") {
      const scoreDisplay = /^\d+$/.test(String(trustScore)) ? `${trustScore}/100` : String(trustScore);
      textParts.push(`🛡️ <b>Trust Score:</b> <code>${escapeHtml(scoreDisplay)}</code>`);
    } else {
      textParts.push(`🛡️ <b>Trust Score:</b> <i>-</i>`);
    }

    textParts.push(`🏷️ <b>Total Tag:</b> ${tagCount} tag`);

    const text = textParts.join("\n");

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: `🏷️ Lihat Tags (${tagCount})`, callback_data: `tags:${phone}${ownerId ? `:${ownerId}` : ""}` },
          { text: `🔄 Refresh`, callback_data: `profile:${phone}${ownerId ? `:${ownerId}` : ""}` },
        ],
        [
          { text: `☕ Donasi / Dukung Bot`, callback_data: `donate` },
        ],
      ],
    };

    if (inlineMsgId) {
      await tgEditMessage(token, null, null, text, { reply_markup: replyMarkup, inline_message_id: inlineMsgId });
    } else if (editMsgId) {
      await tgEditMessage(token, chatId, editMsgId, text, { reply_markup: replyMarkup });
    } else {
      await tgSendMessage(token, chatId, text, {
        reply_to_message_id: replyId,
        reply_markup: replyMarkup,
        guest_query_id: guestQueryId,
      });
    }
  } catch (err) {
    const msgLower = (err.message || "").toLowerCase();
    const isNoResult = msgLower.includes("no result") || msgLower.includes("not found");
    if (isNoResult) {
      const notFound = `🔍 <b>Hasil:</b> <code>${phone}</code>\n\nNomor ini belum terdaftar di database GetContact.`;
      if (inlineMsgId) await tgEditMessage(token, null, null, notFound, { inline_message_id: inlineMsgId });
      else if (editMsgId) await tgEditMessage(token, chatId, editMsgId, notFound);
      else await tgSendMessage(token, chatId, notFound, { reply_to_message_id: replyId, guest_query_id: guestQueryId });
      return;
    }
    if (inlineMsgId) {
      await tgEditMessage(token, null, null, `❌ <b>Gagal:</b> ${escapeHtml(err.message)}`, { inline_message_id: inlineMsgId });
    } else {
      await handleSearchError(token, chatId, err, replyId, editMsgId, guestQueryId);
    }
  }
}

async function handleSearchTags(token, chatId, rawPhone, env, replyId = null, editMsgId = null, inlineMsgId = null, ownerId = null) {
  const phone = normalizePhone(rawPhone);
  if (!phone || phone.length < 8) return;

  if (chatId && chatId !== "guest") {
    await tgSendTyping(token, chatId);
  }
  await recordStats(env, "total_tags");

  try {
    let creds = await getActiveCreds(env);
    let res;

    try {
      res = await gtcCall("/v2.8/number-detail", { countryCode: COUNTRY, phoneNumber: phone, source: "profile", token: creds.token }, creds, env);
    } catch (err) {
      if (isRotatableError(err)) {
        const nextCreds = await rotateToNextAccount(env, creds.name, err.message);
        if (nextCreds) {
          creds = nextCreds;
          res = await gtcCall("/v2.8/number-detail", { countryCode: COUNTRY, phoneNumber: phone, source: "profile", token: creds.token }, creds, env);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    const tags = res.result?.tags || [];
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: `👤 Lihat Profil`, callback_data: `profile:${phone}${ownerId ? `:${ownerId}` : ""}` },
          { text: `🔄 Refresh Tags`, callback_data: `tags:${phone}${ownerId ? `:${ownerId}` : ""}` },
        ],
        [
          { text: `☕ Donasi`, callback_data: `donate` },
        ],
      ],
    };

    if (!tags.length) {
      let msg = `🏷️ <b>Tag Kontak:</b> <code>${phone}</code>\n\n<i>Belum ada tag yang tersimpan untuk nomor ini.</i>`;
      if (inlineMsgId) {
        await tgEditMessage(token, null, null, msg, { reply_markup: replyMarkup, inline_message_id: inlineMsgId });
      } else if (editMsgId) {
        await tgEditMessage(token, chatId, editMsgId, msg, { reply_markup: replyMarkup });
      } else {
        await tgSendMessage(token, chatId, msg, { reply_to_message_id: replyId, reply_markup: replyMarkup });
      }
      return;
    }

    const maxDisplay = 35;
    const tagList = tags
      .slice(0, maxDisplay)
      .map((t, idx) => `${idx + 1}. <b>${escapeHtml(t.tag)}</b>${t.count > 1 ? ` <i>(${t.count}x)</i>` : ""}`)
      .join("\n");

    const extra = tags.length > maxDisplay ? `\n<i>... dan ${tags.length - maxDisplay} tag lainnya.</i>` : "";

    const textParts = [
      `🏷️ <b>Daftar Tag (${tags.length} ditemukan)</b>`,
      `📱 <b>Nomor:</b> <code>${phone}</code>`,
      `━━━━━━━━━━━━━━━━━━`,
      tagList,
      extra,
    ];

    const fullMsg = textParts.filter(Boolean).join("\n");

    if (inlineMsgId) {
      await tgEditMessage(token, null, null, fullMsg, { reply_markup: replyMarkup, inline_message_id: inlineMsgId });
    } else if (editMsgId) {
      await tgEditMessage(token, chatId, editMsgId, fullMsg, { reply_markup: replyMarkup });
    } else {
      await tgSendMessage(token, chatId, fullMsg, { reply_to_message_id: replyId, reply_markup: replyMarkup });
    }
  } catch (err) {
    const msgLower = (err.message || "").toLowerCase();
    const isNoResult = msgLower.includes("no result") || msgLower.includes("not found");
    if (isNoResult) {
      const notFound = `🏷️ <b>Daftar Tag:</b> <code>${phone}</code>\n\nTidak ada tag yang ditemukan untuk nomor ini.`;
      if (inlineMsgId) await tgEditMessage(token, null, null, notFound, { inline_message_id: inlineMsgId });
      else if (editMsgId) await tgEditMessage(token, chatId, editMsgId, notFound);
      else await tgSendMessage(token, chatId, notFound, { reply_to_message_id: replyId });
      return;
    }
    if (inlineMsgId) {
      await tgEditMessage(token, null, null, `❌ <b>Gagal:</b> ${escapeHtml(err.message)}`, { inline_message_id: inlineMsgId });
    } else {
      await handleSearchError(token, chatId, err, replyId, editMsgId);
    }
  }
}

async function handleSearchError(token, chatId, err, replyId, editMsgId, guestQueryId = null) {
  let errText = `❌ <b>Gagal:</b> ${escapeHtml(err.message)}`;
  let replyMarkup = undefined;

  const msgLower = (err.message || "").toLowerCase();
  if (msgLower.includes("no result") || msgLower.includes("not found")) {
    errText = `🔍 <b>Hasil:</b> Nomor ini belum terdaftar di database GetContact.`;
  } else if (err.isCaptcha) {
    errText = `⚠️ <b>Akun Terkena Pembatasan (Captcha)</b>\n\nAkun GetContact saat ini membutuhkan penyelesaian Captcha untuk membuka blokir. Tekan tombol di bawah untuk verifikasi.`;
    replyMarkup = { inline_keyboard: [[{ text: `🔓 Selesaikan Captcha Sekarang`, callback_data: `captcha` }]] };
  } else if (err.errorCode === "403021" || (err.message || "").toLowerCase().includes("maximum query limit")) {
    errText = [
      `⚠️ <b>Batas Kuota Tag Tercapai</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Layanan GetContact saat ini telah mencapai batas kuota untuk melihat detail tag baru (Sisa Kuota Tag: 0).`,
      ``,
      `💡 <i>Pencarian profil nama nomor masih tetap berfungsi normal. Kuota tag akan diperbarui otomatis saat masa aktif paket ter-reset.</i>`,
    ].join("\n");
  } else if (err.errorCode === "403001" || (err.message || "").toLowerCase().includes("authentication failed")) {
    errText = [
      `⚠️ <b>Layanan Sedang Mengalami Gangguan (Code: 403001)</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Koneksi ke akun GetContact sedang bermasalah atau sesi telah kedaluwarsa.`,
      ``,
      `💡 <i>Silakan coba beberapa saat lagi selagi sistem diperbarui oleh Admin.</i>`,
    ].join("\n");
  }

  if (editMsgId) {
    await tgEditMessage(token, chatId, editMsgId, errText, { reply_markup: replyMarkup });
  } else {
    await tgSendMessage(token, chatId, errText, {
      reply_to_message_id: replyId,
      reply_markup: replyMarkup,
      guest_query_id: guestQueryId,
    });
  }
}

// ==========================================
// FITUR CAPTCHA & BUKA BLOKIR
// ==========================================
async function startCaptchaFlow(token, chatId, env) {
  await tgSendTyping(token, chatId);
  try {
    const creds = await getActiveCreds(env);
    const res = await gtcCall("/v2.8/refresh-code", { token: creds.token }, creds, env);
    const b64Image = res.result?.image;

    if (!b64Image) {
      await tgSendMessage(
        token,
        chatId,
        "ℹ️ <b>Tidak ada captcha yang aktif.</b>\nAkun GetContact Anda saat ini tidak dalam kondisi terblokir captcha."
      );
      return;
    }

    // Set state pending captcha untuk user/chat ini (TTL 5 menit)
    await kvPut(env, `pending_captcha:${chatId}`, "1", { expirationTtl: 300 });

    const binaryStr = atob(b64Image);
    const imgBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      imgBytes[i] = binaryStr.charCodeAt(i);
    }
    const caption = [
      `🧩 <b>Verifikasi Captcha GetContact</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `Akun sedang dibatasi sementara oleh GetContact.`,
      `Silakan <b>ketik dan kirim teks kode</b> yang tertera pada gambar di atas untuk membuka blokir akun.`,
    ].join("\n");

    const replyMarkup = {
      inline_keyboard: [[{ text: "🔄 Refresh Gambar Captcha", callback_data: "captcha" }]],
    };

    await tgSendPhoto(token, chatId, imgBytes, caption, { reply_markup: replyMarkup });
  } catch (err) {
    await tgSendMessage(token, chatId, `❌ Gagal mengambil captcha: ${escapeHtml(err.message)}`);
  }
}

async function verifyCaptchaAnswer(token, chatId, answer, env, msgId) {
  await tgSendTyping(token, chatId);
  try {
    const creds = await getActiveCreds(env);
    const res = await gtcCall(
      "/v2.8/verify-code",
      { validationCode: answer.trim(), token: creds.token },
      creds,
      env
    );

    await kvDelete(env, `pending_captcha:${chatId}`);

    if (res.meta?.httpStatusCode === 200) {
      await recordStats(env, "total_captchas");
      await tgSendMessage(
        token,
        chatId,
        `🎉 <b>Berhasil!</b>\nCaptcha valid dan blokir akun GetContact berhasil dibuka. Anda bisa kembali mencari kontak sekarang.`,
        { reply_to_message_id: msgId }
      );
    } else {
      await tgSendMessage(
        token,
        chatId,
        `❌ Kode captcha salah. Silakan coba kirim ulang teks kodenya atau tekan tombol refresh di atas untuk mendapatkan gambar baru.`,
        { reply_to_message_id: msgId }
      );
    }
  } catch (err) {
    await tgSendMessage(token, chatId, `❌ Gagal memverifikasi captcha: ${escapeHtml(err.message)}`, {
      reply_to_message_id: msgId,
    });
  }
}

// ==========================================
// FITUR DONASI QRIS
// ==========================================
async function sendDonationInfo(token, chatId, env, replyId = null) {
  const qrisFileId = await kvGet(env, "assets:qris_file_id");
  const qrisText = (await kvGet(env, "assets:qris_text")) || "";

  const caption = [
    `☕ <b>Dukung & Donasi Operasional Bot</b>`,
    `━━━━━━━━━━━━━━━━━━`,
    `Setiap pencarian kontak membutuhkan kuota akun GetContact. Donasi Anda sangat membantu untuk biaya langganan akun <b>GetContact Premium</b> agar bot ini tetap aktif dan kuota selalu tersedia untuk semua pengguna.`,
    ``,
    qrisText ? `ℹ️ <b>Keterangan:</b>\n${escapeHtml(qrisText)}\n` : null,
    `Terima kasih banyak atas dukungan & kebaikan Anda! 🙏`,
  ]
    .filter(Boolean)
    .join("\n");

  if (qrisFileId) {
    await tgSendPhoto(token, chatId, qrisFileId, caption, { reply_to_message_id: replyId });
  } else {
    await tgSendMessage(token, chatId, caption, { reply_to_message_id: replyId });
  }
}


// ==========================================
// CLOUDFLARE WORKERS FETCH ENTRYPOINT
// ==========================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Tampilan Browser / Setup Webhook
    if (request.method !== "POST") {
      if (url.pathname === "/setup") {
        if (!env.TELEGRAM_BOT_TOKEN) {
          return new Response("❌ Error: TELEGRAM_BOT_TOKEN belum dipasang di Cloudflare Workers.", { status: 500 });
        }
        const webhookUrl = url.origin;
        const [tgRes, meRes] = await Promise.all([
          fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookUrl}`),
          fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getMe`),
        ]);
        const data = await tgRes.json();
        const meData = await meRes.json();
        if (meData.ok && meData.result) {
          await kvPut(env, "bot:info", JSON.stringify(meData.result), { expirationTtl: 86400 * 7 });
        }
        const bName = meData.result?.username ? `@${meData.result.username}` : "Bot";
        return new Response(
          data.ok
            ? `🎉 Berhasil! Webhook Telegram sudah tersambung ke:\n${webhookUrl}\n\nBot: ${bName}\nBot siap digunakan di chat pribadi maupun grup (Guest Mode)!`
            : `❌ Gagal menyambungkan webhook:\n${JSON.stringify(data, null, 2)}`,
          { headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }

      return new Response(
        "⚡ GetContact Telegram Bot (Cloudflare Workers)\n\n" +
        "Buka /setup di browser untuk menyambungkan webhook Telegram secara otomatis.",
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
      );
    }

    // 2. Handler Webhook Telegram (POST)
    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    const token = env.TELEGRAM_BOT_TOKEN;
    if (!token) return new Response("OK");

    // Tangani Tombol Callback (Inline Keyboard)
    if (update.callback_query) {
      const cb = update.callback_query;
      const data = cb.data || "";
      const chatId = cb.message?.chat?.id;
      const msgId = cb.message?.message_id;
      const inlineMsgId = cb.inline_message_id;

      if (data === "refresh_stats") {
        if (!isAdminUser(cb.from?.id, env)) {
          await tgAnswerCallback(token, cb.id, "⚠️ Khusus Admin.", true);
          return new Response("OK");
        }
        await tgAnswerCallback(token, cb.id, "Memperbarui statistik...");
        if (inlineMsgId) {
          await handleStats(token, null, env, null, null, inlineMsgId);
        } else if (chatId && msgId) {
          await handleStats(token, chatId, env, null, msgId);
        }
      } else if (data === "donate") {
        const qrisText = await kvGet(env, "assets:qris_text");
        await tgAnswerCallback(token, cb.id, qrisText ? `☕ Dukung Bot:\n${qrisText}` : "☕ Terima kasih atas dukungan Anda!", true);
        if (chatId) {
          await sendDonationInfo(token, chatId, env);
        }
      } else if (data === "captcha") {
        if (chatId) {
          await tgAnswerCallback(token, cb.id);
          await startCaptchaFlow(token, chatId, env);
        } else {
          const botInfo = await getBotInfo(token, env);
          await tgAnswerCallback(token, cb.id, `Silakan buka chat pribadi dengan @${botInfo.username || "bot"} untuk menyelesaikan captcha.`, true);
        }
      } else if (data.startsWith("bc_confirm:") || data.startsWith("bc_cancel:")) {
        if (!isAdminUser(cb.from?.id, env)) {
          await tgAnswerCallback(token, cb.id, "⚠️ Khusus Admin.", true);
          return new Response("OK");
        }

        const isConfirm = data.startsWith("bc_confirm:");
        const draftId = data.replace(/^bc_(?:confirm|cancel):/, "");
        const draftKey = `bc:draft:${draftId}`;

        const draftRaw = await kvGet(env, draftKey);
        if (!draftRaw) {
          await tgAnswerCallback(token, cb.id, "⚠️ Draf broadcast sudah kedaluwarsa atau telah diproses.", true);
          if (chatId && msgId) {
            await tgEditMessage(
              token,
              chatId,
              msgId,
              "⚠️ <b>Draf broadcast ini sudah kedaluwarsa atau telah diproses sebelumnya.</b>",
              { reply_markup: { inline_keyboard: [] } }
            );
          }
          return new Response("OK");
        }

        // Hapus draf agar tidak dapat ditekan ganda (idempotent)
        await kvDelete(env, draftKey);

        if (!isConfirm) {
          await tgAnswerCallback(token, cb.id, "Broadcast dibatalkan.");
          if (chatId && msgId) {
            await tgEditMessage(
              token,
              chatId,
              msgId,
              "❌ <b>Pengiriman broadcast telah dibatalkan oleh Admin.</b>",
              { reply_markup: { inline_keyboard: [] } }
            );
          }
          return new Response("OK");
        }

        let draft;
        try {
          draft = JSON.parse(draftRaw);
        } catch {
          await tgAnswerCallback(token, cb.id, "⚠️ Gagal membaca draf pesan.", true);
          return new Response("OK");
        }

        await tgAnswerCallback(token, cb.id, "🚀 Mengirim broadcast...");

        const recipients = await getBroadcastUsers(env);
        if (chatId && msgId) {
          await tgEditMessage(
            token,
            chatId,
            msgId,
            `⏳ <b>Sedang mengirim broadcast ke ${recipients.length} pengguna...</b>`,
            { reply_markup: { inline_keyboard: [] } }
          );
        }

        const buildMessage = (txt) => [
          txt,
          `━━━━━━━━━━━━━━━━━━`,
          `<i>Pesan ini dikirim oleh Admin kepada seluruh pengguna GetContact Bot.</i>`,
        ].join("\n");

        let fullContent = buildMessage(draft.text);
        let successCount = 0;
        let failCount = 0;

        for (const targetId of recipients) {
          try {
            let res = await tgCall(token, "sendMessage", {
              chat_id: targetId,
              text: fullContent,
              parse_mode: "HTML",
            });
            if (!res || !res.ok) {
              // Coba fallback plain/escaped jika tag HTML pesan bermasalah
              res = await tgCall(token, "sendMessage", {
                chat_id: targetId,
                text: buildMessage(escapeHtml(draft.text)),
                parse_mode: "HTML",
              });
            }
            if (res && res.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch {
            failCount++;
          }
        }

        const reportText = [
          `📊 <b>Laporan Broadcast Selesai</b>`,
          `━━━━━━━━━━━━━━━━━━`,
          `✅ <b>Berhasil terkirim:</b> <code>${successCount}</code> pengguna`,
          `❌ <b>Gagal / Diblokir:</b> <code>${failCount}</code> pengguna`,
          `👥 <b>Total Target:</b> <code>${recipients.length}</code> pengguna`,
        ].join("\n");

        if (chatId && msgId) {
          await tgEditMessage(token, chatId, msgId, reportText);
        }
        return new Response("OK");
      } else {
        const [action, phone, ownerId] = data.split(":");
        if (action === "tags" || action === "profile") {
          // Batasi tombol hanya untuk pemanggil / pencari nomor ini
          if (ownerId && String(ownerId) !== String(cb.from?.id)) {
            await tgAnswerCallback(
              token,
              cb.id,
              "⚠️ Tombol ini hanya dapat digunakan oleh pengguna yang meminta pencarian ini.",
              true
            );
            return new Response("OK");
          }
          if (action === "tags") {
            await tgAnswerCallback(token, cb.id, "Mengambil daftar tag...");
            await handleSearchTags(token, chatId, phone, env, null, msgId, inlineMsgId, ownerId);
          } else if (action === "profile") {
            await tgAnswerCallback(token, cb.id, "Mengambil profil...");
            await handleSearchProfile(token, chatId, phone, env, null, msgId, null, inlineMsgId, ownerId);
          }
        } else {
          await tgAnswerCallback(token, cb.id);
        }
      }
      return new Response("OK");
    }

    const msg = update.message || update.channel_post || update.guest_message;
    if (!msg) return new Response("OK");

    const guestQueryId = msg.guest_query_id || update.guest_message?.guest_query_id || null;
    const chatId = msg.chat?.id || (guestQueryId ? "guest" : null);
    const chatType = msg.chat?.type || (guestQueryId ? "group" : "private");
    const isPrivate = chatType === "private";
    const userId = msg.from?.id || msg.guest_bot_caller_user?.id;
    const text = (msg.text || msg.caption || "").trim();

    // Catat statistik pengguna & grup (Guest Mode)
    await recordStats(env, null, chatId, userId, chatType);

    // ----------------------------------------------------
    // MENANGANI UPLOAD FOTO QRIS OLEH ADMIN
    // ----------------------------------------------------
    if (msg.photo && msg.photo.length > 0) {
      const isPendingQris = await kvGet(env, `pending_qris:${chatId}`);
      if (isPendingQris && isAdminUser(userId, env)) {
        // Ambil foto kualitas terbaik (elemen terakhir)
        const photo = msg.photo[msg.photo.length - 1];
        await kvPut(env, "assets:qris_file_id", photo.file_id);
        if (msg.caption) {
          await kvPut(env, "assets:qris_text", msg.caption.trim());
        }
        await kvDelete(env, `pending_qris:${chatId}`);

        await tgSendMessage(
          token,
          chatId,
          "✅ <b>Gambar QRIS Donasi Berhasil Disimpan!</b>\nPengguna kini akan melihat foto QRIS ini saat menekan tombol donasi.",
          { reply_to_message_id: msg.message_id }
        );
        return new Response("OK");
      }
    }

    if (!text) return new Response("OK");

    // ----------------------------------------------------
    // MENANGANI JAWABAN CAPTCHA DARI USER / ADMIN
    // ----------------------------------------------------
    const isPendingCaptcha = await kvGet(env, `pending_captcha:${chatId}`);
    if (isPendingCaptcha && !text.startsWith("/")) {
      await verifyCaptchaAnswer(token, chatId, text, env, msg.message_id);
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH: /start & /help
    // ----------------------------------------------------
    if (text === "/start" || text === "/help" || text.startsWith("/start@") || text.startsWith("/help@")) {
      const botInfo = await getBotInfo(token, env);
      const bTag = botInfo?.username ? `@${botInfo.username}` : "@namabot";
      const welcomeParts = [
        `👋 <b>Selamat Datang di GetContact Bot!</b>`,
        ``,
        `Cari identitas dan daftar tag nomor telepon langsung dari GetContact.`,
        ``,
        `📌 <b>Cara Penggunaan:</b>`,
        `1. <b>Chat Pribadi:</b> Langsung kirim nomor HP ke chat ini:`,
        `   Contoh: <code>081234567890</code> atau <code>+6281234567890</code>`,
        ``,
        `2. <b>Guest Mode (Di Grup Mana Pun):</b>`,
        `   • Kirim pesan mention: <code>${bTag} 081234567890</code>`,
        `   • Atau <b>reply</b> pesan mana pun yang berisi nomor HP dengan mention <code>${bTag}</code>`,
        `   • Atau <b>reply</b> pesan bot dengan nomor HP target`,
        ``,
        `💡 <i>Setiap hasil pencarian menyertakan tombol interaktif untuk melihat daftar tag, refresh profil, dan donasi.</i>`,
      ];

      if (isAdminUser(userId, env)) {
        welcomeParts.push(
          ``,
          `👑 <b>Menu Admin:</b>`,
          `Ketik <code>/admin</code> untuk melihat seluruh daftar perintah khusus Admin.`
        );
      }

      await tgSendMessage(token, chatId, welcomeParts.join("\n"));
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /admin atau /adminhelp (Daftar semua perintah admin)
    // ----------------------------------------------------
    if (text === "/admin" || text === "/adminhelp" || text.startsWith("/admin@") || text.startsWith("/adminhelp@")) {
      if (!isAdminUser(userId, env)) {
        await tgSendMessage(token, chatId, "⚠️ Perintah ini khusus untuk Admin.", {
          reply_to_message_id: msg.message_id,
        });
        return new Response("OK");
      }

      const adminHelp = [
        `👑 <b>Panel & Daftar Perintah Khusus Admin</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        `Berikut daftar lengkap perintah untuk mengelola bot:`,
        ``,
        `📊 <b>Statistik & Status:</b>`,
        `• <code>/stats</code>`,
        `  <i>Melihat total user, total grup, kuota sisa akun aktif, dan status QRIS.</i>`,
        ``,
        `👥 <b>Manajemen Akun (Multi-Akun & Rotasi):</b>`,
        `• <code>/accounts</code> atau <code>/listacc</code>`,
        `  <i>Melihat semua akun tersimpan dan akun yang sedang aktif.</i>`,
        `• <code>/useacc &lt;nama_akun&gt;</code>`,
        `  <i>Beralih ke akun tertentu secara manual.</i>`,
        `• <code>/addacc &lt;nama&gt; &lt;token&gt; &lt;finalKey&gt; &lt;deviceId&gt;</code>`,
        `  <i>Mendaftarkan akun GetContact baru ke database KV.</i>`,
        `• <code>/delacc &lt;nama_akun&gt;</code>`,
        `  <i>Menghapus akun cadangan dari daftar.</i>`,
        `  <i>(Catatan: Bot otomatis merotasi akun jika akun aktif terkena limit 403021 atau autentikasi kedaluwarsa 403001).</i>`,
        ``,
        `📢 <b>Pengumuman & Siaran:</b>`,
        `• <code>/bc &lt;pesan&gt;</code> atau <code>/broadcast &lt;pesan&gt;</code>`,
        `  <i>Mengirim pesan ke seluruh pengguna pribadi (ada preview & tombol konfirmasi kirim/batal).</i>`,
        ``,
        `☕ <b>Donasi QRIS:</b>`,
        `• <code>/setqris</code>`,
        `  <i>Mengatur/mengunggah gambar QRIS dan teks catatan donasi.</i>`,
        ``,
        `━━━━━━━━━━━━━━━━━━`,
        `💡 <i>Tip: Anda dapat mengetuk (tap) pada teks kode di atas untuk langsung menyalin perintah!</i>`,
      ].join("\n");

      await tgSendMessage(token, chatId, adminHelp, { reply_to_message_id: msg.message_id });
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /setqris
    // ----------------------------------------------------
    if (text.startsWith("/setqris")) {
      if (!isAdminUser(userId, env)) {
        await tgSendMessage(token, chatId, "⚠️ Perintah ini khusus untuk Admin.", {
          reply_to_message_id: msg.message_id,
        });
        return new Response("OK");
      }

      const customText = text.replace("/setqris", "").trim();
      if (customText) {
        await kvPut(env, "assets:qris_text", customText);
        await tgSendMessage(
          token,
          chatId,
          `✅ <b>Keterangan Donasi Disimpan:</b>\n${escapeHtml(customText)}\n\nKirim gambar QRIS tanpa perintah untuk melengkapi foto QRIS.`,
          { reply_to_message_id: msg.message_id }
        );
        return new Response("OK");
      }

      await kvPut(env, `pending_qris:${chatId}`, "1", { expirationTtl: 300 });
      await tgSendMessage(
        token,
        chatId,
        "📸 <b>Upload QRIS Donasi</b>\n\nSilakan kirimkan <b>foto gambar QRIS</b> Anda sekarang (bisa sertakan caption untuk catatan rekening/e-wallet).",
        { reply_to_message_id: msg.message_id }
      );
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /accounts (Lihat akun tersimpan)
    // ----------------------------------------------------
    if (text === "/accounts" || text === "/listacc") {
      if (!isAdminUser(userId, env)) {
        await tgSendMessage(token, chatId, "⚠️ Perintah ini khusus untuk Admin.", {
          reply_to_message_id: msg.message_id,
        });
        return new Response("OK");
      }

      const store = await loadAccountStore(env);
      const accList = Object.entries(store.accounts || {});

      const items = [
        `* <code>default</code> (Dari Environment Variables)${store.active === "default" ? " <b>[AKTIF]</b>" : ""}`,
      ];

      for (const [name, acc] of accList) {
        const isAct = store.active === name ? " <b>[AKTIF]</b>" : "";
        const desc = acc.description ? ` (${escapeHtml(acc.description)})` : "";
        items.push(`• <code>${escapeHtml(name)}</code>${desc}${isAct}`);
      }

      const reply = [
        `📋 <b>Daftar Akun GetContact</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        ...items,
        ``,
        `💡 <b>Perintah Kelola:</b>`,
        `• <code>/useacc &lt;nama&gt;</code> : Ganti akun aktif`,
        `• <code>/addacc &lt;nama&gt; &lt;token&gt; &lt;finalKey&gt; &lt;deviceId&gt;</code>`,
        `• <code>/delacc &lt;nama&gt;</code> : Hapus akun`,
      ].join("\n");

      await tgSendMessage(token, chatId, reply, { reply_to_message_id: msg.message_id });
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /useacc <nama> (Ganti akun aktif)
    // ----------------------------------------------------
    if (text.startsWith("/useacc")) {
      if (!isAdminUser(userId, env)) return new Response("OK");

      const name = text.replace("/useacc", "").trim();
      const store = await loadAccountStore(env);

      if (name !== "default" && !store.accounts?.[name]) {
        await tgSendMessage(token, chatId, `❌ Akun <code>${escapeHtml(name)}</code> tidak ditemukan.`);
        return new Response("OK");
      }

      store.active = name;
      await saveAccountStore(env, store);

      await tgSendMessage(token, chatId, `✅ Akun aktif berhasil diubah ke: <b>${escapeHtml(name)}</b>`);
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /addacc <nama> <token> <finalKey> <deviceId>
    // ----------------------------------------------------
    if (text.startsWith("/addacc")) {
      if (!isAdminUser(userId, env)) return new Response("OK");

      const parts = text.split(/\s+/).slice(1);
      if (parts.length < 4) {
        await tgSendMessage(
          token,
          chatId,
          "⚠️ Format: <code>/addacc &lt;nama&gt; &lt;token&gt; &lt;finalKey&gt; &lt;deviceId&gt;</code>"
        );
        return new Response("OK");
      }

      const [name, accToken, finalKey, clientDeviceId] = parts;
      const store = await loadAccountStore(env);
      store.accounts = store.accounts || {};
      store.accounts[name] = { token: accToken, finalKey, clientDeviceId };
      store.active = name;
      await saveAccountStore(env, store);

      await tgSendMessage(
        token,
        chatId,
        `✅ Akun <b>${escapeHtml(name)}</b> berhasil disimpan dan dijadikan akun aktif!`
      );
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /delacc <nama>
    // ----------------------------------------------------
    if (text.startsWith("/delacc")) {
      if (!isAdminUser(userId, env)) return new Response("OK");

      const name = text.replace("/delacc", "").trim();
      const store = await loadAccountStore(env);

      if (name === "default" || !store.accounts?.[name]) {
        await tgSendMessage(token, chatId, `❌ Akun <code>${escapeHtml(name)}</code> tidak dapat dihapus.`);
        return new Response("OK");
      }

      delete store.accounts[name];
      if (store.active === name) store.active = "default";
      await saveAccountStore(env, store);

      await tgSendMessage(token, chatId, `🗑️ Akun <b>${escapeHtml(name)}</b> berhasil dihapus.`);
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /stats (Statistik Penggunaan & Kuota)
    // ----------------------------------------------------
    if (text === "/stats" || text.startsWith("/stats@")) {
      if (!isAdminUser(userId, env)) {
        await tgSendMessage(token, chatId, "⚠️ Perintah ini khusus untuk Admin.", {
          reply_to_message_id: msg.message_id,
        });
        return new Response("OK");
      }
      await handleStats(token, chatId, env, msg.message_id);
      return new Response("OK");
    }

    // ----------------------------------------------------
    // PERINTAH ADMIN: /broadcast atau /bc (Kirim pesan ke seluruh pengguna pribadi)
    // ----------------------------------------------------
    if (text.startsWith("/broadcast") || text.startsWith("/bc")) {
      if (!isAdminUser(userId, env)) {
        await tgSendMessage(token, chatId, "⚠️ Perintah ini khusus untuk Admin.", {
          reply_to_message_id: msg.message_id,
        });
        return new Response("OK");
      }

      const match = text.match(/^\/(?:broadcast|bc)(?:@\w+)?(?:\s+([\s\S]+))?$/i);
      const broadcastMsg = (match && match[1]) ? match[1].trim() : "";

      if (!broadcastMsg) {
        await tgSendMessage(
          token,
          chatId,
          "⚠️ <b>Format Penggunaan:</b>\n<code>/bc &lt;pesan pengumuman&gt;</code>\n\nContoh:\n<code>/bc Halo semua, status bot saat ini aktif dan kuota akun telah diperbarui.</code>",
          { reply_to_message_id: msg.message_id }
        );
        return new Response("OK");
      }

      const recipients = await getBroadcastUsers(env);
      if (!recipients.length) {
        await tgSendMessage(
          token,
          chatId,
          "ℹ️ <b>Belum ada pengguna pribadi yang tercatat di database untuk menerima broadcast.</b>",
          { reply_to_message_id: msg.message_id }
        );
        return new Response("OK");
      }

      // Simpan draf broadcast ke KV dengan masa berlaku 1 jam (3600s)
      const draftId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await kvPut(env, `bc:draft:${draftId}`, JSON.stringify({
        text: broadcastMsg,
        adminId: userId,
        createdAt: Date.now(),
      }), { expirationTtl: 3600 });

      const previewButtons = {
        inline_keyboard: [
          [
            { text: "🚀 Konfirmasi Kirim", callback_data: `bc_confirm:${draftId}` },
            { text: "❌ Batal", callback_data: `bc_cancel:${draftId}` },
          ],
        ],
      };

      const previewText = [
        `👁️ <b>PREVIEW PESAN BROADCAST</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        broadcastMsg,
        `━━━━━━━━━━━━━━━━━━`,
        `<i>Pesan ini dikirim oleh Admin kepada seluruh pengguna GetContact Bot.</i>`,
        `━━━━━━━━━━━━━━━━━━`,
        `👥 <b>Target Penerima:</b> <code>${recipients.length}</code> pengguna pribadi`,
        `❓ <i>Silakan periksa tampilan pesan di atas. Tekan <b>Konfirmasi Kirim</b> untuk menyebarkan sekarang atau <b>Batal</b>.</i>`,
      ].join("\n");

      let sent = await tgSendMessage(token, chatId, previewText, {
        reply_to_message_id: msg.message_id,
        reply_markup: previewButtons,
      });

      if (!sent || !sent.ok) {
        // Fallback jika pesan mengandung karakter HTML yang tidak valid
        const safePreview = [
          `👁️ <b>PREVIEW PESAN BROADCAST</b>`,
          `━━━━━━━━━━━━━━━━━━`,
          escapeHtml(broadcastMsg),
          `━━━━━━━━━━━━━━━━━━`,
          `<i>Pesan ini dikirim oleh Admin kepada seluruh pengguna GetContact Bot.</i>`,
          `━━━━━━━━━━━━━━━━━━`,
          `👥 <b>Target Penerima:</b> <code>${recipients.length}</code> pengguna pribadi`,
          `❓ <i>Silakan periksa tampilan pesan di atas. Tekan <b>Konfirmasi Kirim</b> untuk menyebarkan sekarang atau <b>Batal</b>.</i>`,
        ].join("\n");

        await tgSendMessage(token, chatId, safePreview, {
          reply_to_message_id: msg.message_id,
          reply_markup: previewButtons,
        });
      }

      return new Response("OK");
    }

    // ----------------------------------------------------
    // PENCARIAN NOMOR: Private Chat & Guest Mode (Grup / Channel)
    // ----------------------------------------------------
    const botInfo = await getBotInfo(token, env);
    const botUsername = (botInfo?.username || "").toLowerCase();
    const isMentioned = Boolean(
      botUsername &&
      (text.toLowerCase().includes("@" + botUsername) ||
        (msg.entities || []).some(
          (e) => e.type === "mention" && text.substring(e.offset, e.offset + e.length).toLowerCase() === "@" + botUsername
        ))
    );
    const isReplyToBot = Boolean(
      msg.reply_to_message &&
      (msg.reply_to_message.from?.id === botInfo?.id || msg.reply_to_message.from?.is_bot)
    );
    const isSearchCmd = text.startsWith("/search") || text.startsWith("/lookup");

    // Jika di grup dan bukan ditujukan ke bot (bukan mention, bukan reply bot, bukan command, bukan guest message), abaikan
    if (!isPrivate && !isMentioned && !isReplyToBot && !isSearchCmd && !guestQueryId) {
      return new Response("OK");
    }

    // Ekstraksi nomor telepon dari teks saat ini (hapus mention bot & perintah /search)
    let cleanText = text;
    if (botUsername) {
      cleanText = cleanText.replace(new RegExp(`@${botUsername}`, "gi"), "");
    }
    cleanText = cleanText.replace(/^\/(?:search|lookup)(?:@\w+)?/i, "").trim();

    let targetPhone = extractPhoneFromText(cleanText);

    // Jika nomor tidak ada di teks pesan saat ini, tetapi me-reply pesan lain, cari nomor di pesan yang di-reply
    if (!targetPhone && msg.reply_to_message) {
      const replyContent = msg.reply_to_message.text || msg.reply_to_message.caption || "";
      targetPhone = extractPhoneFromText(replyContent);
    }

    if (targetPhone) {
      await handleSearchProfile(token, chatId, targetPhone, env, msg.message_id, null, guestQueryId, null, userId);
      return new Response("OK");
    }

    // Jika nomor tidak ditemukan:
    if (isPrivate) {
      if (text.startsWith("/")) {
        await tgSendMessage(
          token,
          chatId,
          "⚠️ Perintah tidak dikenal.\nSilakan langsung kirim nomor HP untuk mencari profil & tag (contoh: <code>081234567890</code>).",
          { reply_to_message_id: msg.message_id }
        );
      } else {
        await tgSendMessage(
          token,
          chatId,
          "⚠️ Format nomor telepon tidak valid.\nSilakan kirim nomor HP yang valid (contoh: <code>081234567890</code> atau <code>+6281234567890</code>).",
          { reply_to_message_id: msg.message_id }
        );
      }
    }
    // Jika di grup / Guest Mode dan tidak ada nomor valid, abaikan (silent) agar bot tidak dapat dijadikan sarana spam

    return new Response("OK");
  },
};
