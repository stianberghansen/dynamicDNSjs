const axios = require("axios");
const dns = require("dns");

const checkInternetConnection = () => {
  return new Promise((resolve) => {
    let attempt = 0;
    dns.resolve("www.google.com", (error, success) => {
      if (error) {
        if (attempt > 4) {
          Promise.reject(new Error("no internet")).then(() => {
            console.log(error);
            process.exit(-1);
          });
        } else {
          setTimeout(checkInternetConnection, 60000);
        }
      } else {
        console.log("Internet connection detected.");
        resolve("true");
      }
    });
  });
};

module.exports = checkInternetConnection;
