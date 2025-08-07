const CryptoJS = require("crypto-js");

function encrypt(text, workingKey) {
  const key = CryptoJS.enc.Utf8.parse(workingKey);
  const iv = CryptoJS.enc.Utf8.parse(workingKey); // Ensure 16 characters
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString(); // ✅ This returns full base64
}

module.exports = encrypt;
