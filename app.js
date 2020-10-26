//Import dependencies
const minimist = require("minimist");
const readline = require("readline");
const axios = require("axios");

var TIMEOUT_INTERVAL;
var DOMAIN;
var NAME;
var API_KEY;
var SERVER_IP;
var DOMAIN_IP;
var attempt = 1;

//readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//minimist for parsing flags and arguments to run script
const args = minimist(process.argv.slice(2));

const parseArguments = () => {
  if (!args.t || !args.d || !args.n || !args.a) {
    if (args.h) {
      console.log(
        "Flags required to run script: \n-t : time in seconds between checking records. Must be a value between 30 and 1800\n-d : domain name, eg. myserver.com\n-n : name of subdomain\n-a : API token for Digital Ocean"
      );
      process.exit(-1);
    } else {
      console.log(
        "Missing argument(s) to run program. Try -h for more information."
      );
      process.exit(-1);
    }
  } else {
    TIMEOUT_INTERVAL = args.t * 1000;
    DOMAIN = args.d;
    NAME = args.n;
    API_KEY = args.a;

    fetchIP();
  }
};

const fetchIP = () => {
  axios
    .get("https://api.ipify.org?format=json")
    .then((res) => {
      if (res.status === 200) {
        SERVER_IP = res.data.ip;
        console.log("Your public IP address is: " + SERVER_IP);
        fetchRecords();
      } else {
        console.log("Error finding public IP address.");
        process.exit(-1);
      }
    })
    .catch((error) => {
      console.log(error);
      setTimeout(fetchIP, TIMEOUT_INTERVAL + TIMEOUT_INTERVAL);
    });
};

const fetchRecords = () => {
  axios
    .get("https://api.digitalocean.com/v2/domains/" + DOMAIN + "/records", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    .then((res) => {
      if (res.status === 200) {
        console.log("Found domain records. Parsing data...");
        parseDomainRecords(res.data.domain_records);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const parseDomainRecords = (domainInfo) => {
  const nameMatch = domainInfo.find(({ name }) => name === NAME);
  if (nameMatch != undefined && nameMatch.name === NAME) {
    console.log(
      "Found a matching record. Name: " +
        nameMatch.name +
        "- Currently pointed at IP:" +
        nameMatch.data
    );
    updateDomainRecords(nameMatch.id, nameMatch.data);
  } else {
    console.log("No matching domain records.");
    userPromptNewDomain();
  }
};

const updateDomainRecords = (recordID, recordIP) => {
  if (recordIP === SERVER_IP) {
    console.log(
      "Domain record IP and server IP match. Checking again in: " +
        TIMEOUT_INTERVAL / 1000 +
        "s"
    );
    setTimeout(fetchIP, TIMEOUT_INTERVAL);
  } else {
    console.log("New IP detected. Updating domain records...");
    const url =
      "https://api.digitalocean.com/v2/domains/" +
      DOMAIN +
      "/records/" +
      recordID;
    axios({
      method: "put",
      url:
        "https://api.digitalocean.com/v2/domains/" +
        DOMAIN +
        "/records/" +
        recordID,
      headers: { Authorization: `Bearer ${API_KEY}` },
      data: { data: SERVER_IP },
    })
      .then((res) => {
        if (res.status === 200) {
          console.log("Domain records updated.");
          setTimeout(fetchIP, TIMEOUT_INTERVAL);
        } else {
          console.log("Error updating domain records... Retrying" + attempt);
          attempt++;
          if (attempt < 5) {
            setTimeout(updateDomainRecords, 5000);
          } else {
            console.log("Unable to update domain records.");
            process.exit(-1);
          }
        }
      })
      .catch((error) => {
        console.log(
          "Error updating domain records... See error response below:"
        );
        console.log(error);
      });
  }
};

const createNewDomainRecord = () => {
  const newDomainRecord = {
    type: "A",
    name: NAME,
    data: SERVER_IP,
    priority: null,
    port: null,
    ttl: 600,
    weight: null,
    flags: null,
    tag: null,
  };
  console.log("Sending domain info to DigitalOcean");
  axios({
    method: "post",
    url: "https://api.digitalocean.com/v2/domains/" + DOMAIN + "/records",
    data: newDomainRecord,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  })
    .then((res) => {
      if (res.status === 201) {
        console.log(
          "New domain record created.\nWaiting specified timeout interval before checking server IP."
        );
        setTimeout(fetchIP, TIMEOUT_INTERVAL);
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

const userPromptNewDomain = () => {
  rl.question(
    "Would you like to create a new domain record: yes / no (y/n)\n",
    (answer) => {
      if (answer === "yes" || answer === "y") {
        console.log("creating new record...");
        createNewDomainRecord();
      } else if (answer === "no" || answer === "n") {
        console.log("Exiting program...");
        rl.close();
      } else {
        userPromptNewDomain();
      }
    }
  );
};

parseArguments();
