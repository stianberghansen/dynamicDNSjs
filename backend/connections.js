const { rejects } = require("assert");
const dns = require("dns");
const { networkInterfaces } = require("os");

class Connections {
  /*
   ** Checks internet connection by attempting to resolve DNS
   */
  constructor() {
    this.attempt = 0;
  }

  checkInternetConnection = () => {
    return new Promise((resolve, reject) => {
      dns.resolve("www.google.com", (error, success) => {
        if (error) {
          if (this.attempt > 1) {
            Promise.reject(new Error("no internet"))
              .then(() => {
                console.log(error);
                process.exit(-1);
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            console.log(
              "No internet connection detected. Trying again in 1 minute."
            );
            this.attempt++;
            console.log(this.attempt);
            setTimeout(this.checkInternetConnection, 1000);
          }
        } else if (success) {
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
