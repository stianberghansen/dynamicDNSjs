const axios = require("axios");
const APIs = require("./publicApiList.json");

const fetchPublicIP = () => {
  return new Promise((resolve) => {
    let attempt = 0;
    axios
      .get(`${APIs.urls[attempt]}`)
      .then((res) => {
        if (res.status === 200) {
          console.log("Your public IP address is: " + res.data.ip);
          attempt = 0;
          resolve(res.data.ip);
        } else {
          console.log(
            "Server response error. Can't find public IP address. Retrying..."
          );
        }
      })
      .catch((error) => {
        console.error(error);
        if (attempt < 9) {
          attempt++;
          setTimeout(fetchPublicIP, 10000);
        }
      });
  });
};

module.exports = fetchPublicIP;
