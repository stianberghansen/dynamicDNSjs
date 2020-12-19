const minimist = require("minimist");
const readline = require("readline");
const axios = require("axios");
const config = require("./config.json");
const dotenv = require("dotenv").config();
const mail = require("./mailer");
const domainRecords = require("./domainRecords");
const { debugPort, domain } = require("process");

//readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//minimist for parsing flags and arguments to run script
const args = minimist(process.argv.slice(2));

let attempt = 1;

let domains = new domainRecords();

const parseArguments = () => {
  console.log(
    "##############################################################################\nStarting dynamicDNSjs\n##############################################################################\n"
  );
  if (!args.t || !args.d || !args.n || !args.a) {
    if (args.h) {
      console.log(
        "Flags required to run script: \n-t : time in seconds between checking records. Must be a value between 30 and 1800\n-d : domain name, eg. myserver.com\n-n : name of subdomain\n-a : API token for Digital Ocean"
      );
      console.log(
        "You can also pass the paramters in a config (JSON) file by using the flag -c followed by the filename"
      );
      process.exit(-1);
    } else if (args.c) {
      const config = require("./" + `${args.c}`);

      for (let i = 0; i < config.domains.length; i++) {
        domains.newDomain(
          i,
          config.domains[i].DOMAIN,
          config.domains[i].NAME,
          config.domains[i].API_KEY
        );
      }
      mail.confirmEmailSystem();
      startApplication();
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

    domains.fetchIP();
  }
};

const startApplication = () => {
  let bool = domains
    .startProcess()
    .then((res) => {
      setTimeout(startApplication, config.timeout * 100);
    })
    .catch((err) => {
      console.log(err);
    });
};

parseArguments();
