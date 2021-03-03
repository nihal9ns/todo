const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const SECRET_KEY = "this-is-our-secret-key";

const encode = (payload) => {
  const token = jwt.sign(payload, SECRET_KEY);
  console.info("token : ", token);
  return token;
};

const decode = (token) => {
  const decoded = jwt.verify(token, SECRET_KEY);
  console.info("decoded : ", decoded);
  return decoded;
};

const createSalt = () => crypto.randomBytes(128).toString("hex");

const hashPassword = (input, salt) => {
  const hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, "sha512");
  return [salt, hashed.toString("hex")].join("$");
};

// abc123 - salt -> salt$4218hfs -> abc123

// split -> ["salt", "4218hfs"]

module.exports = { encode, decode, hashPassword, createSalt };
