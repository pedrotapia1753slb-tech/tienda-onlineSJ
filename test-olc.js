const { OpenLocationCode } = require('open-location-code');
const olc = new OpenLocationCode();

// Let's test Santa Cruz de la Sierra: -17.7833, -63.1821
const scz_lat = -17.783333;
const scz_lng = -63.182126;
console.log("Encoding Santa Cruz:", olc.encode(scz_lat, scz_lng, 10));

// Let's test San Julian, Santa Cruz, Bolivia: ~ -16.8943, -62.6186
const sj_lat = -16.8943;
const sj_lng = -62.6186;
console.log("Encoding San Julian:", olc.encode(sj_lat, sj_lng, 10));
