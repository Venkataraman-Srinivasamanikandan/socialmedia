var environ = process.env.NODE_ENV ? process.env.NODE_ENV : "local";

module.exports = require("./"+environ+".js");