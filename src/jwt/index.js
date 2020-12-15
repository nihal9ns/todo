const jwt = require("jsonwebtoken");

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

module.exports = { encode, decode };
