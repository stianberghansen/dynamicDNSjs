const dns = require("dns");
const { networkInterfaces } = require("os");

class Connections {
  /*
   ** Checks internet connection by attempting to resolve DNS
   */
  checkInternetConnection = () => {
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

  /*
   ** Gets local IP address
   */
  fetchLocalIp = () => {
    return new Promise((localIP) => {
      const nets = networkInterfaces();
      const results = {};
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === "IPv4" && !net.internal) {
            localIP(net.address);
          }
        }
      }
    });
  };
}

module.exports = Connections;
