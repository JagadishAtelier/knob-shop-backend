const CryptoJS = require("crypto-js");

function encrypt(text, workingKey) {
  const key = CryptoJS.enc.Utf8.parse(workingKey);
  const iv = CryptoJS.enc.Utf8.parse(workingKey);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex); // 🔁 Use .ciphertext + Hex
}

module.exports = encrypt;
