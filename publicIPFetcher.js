const axios = require("axios");
const APIs = require("./publicApiList.json");

const fetchPublicIP = () => {
  return new Promise((resolve) => {
    let attempt = 0;
    axios
      .get(`${APIs.urls[attempt].url}`)
      .then((res) => {
        if (res.status === 200) {
          console.log(
            "Your public IP address is: " + eval(APIs.urls[attempt].api_res)
          );
          let publicIP = eval(APIs.urls[attempt].api_res);
          attempt = 0;
          resolve(publicIP);
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
        } else {
          process.exit(-1);
        }
      });
  });
};

module.exports = fetchPublicIP;
