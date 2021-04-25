const minimist = require("minimist");
const readline = require("readline");
const axios = require("axios");
const config = require("./config.json");
const dotenv = require("dotenv").config();
const mail = require("./mailer");
const Connection = require("./connections.js");
const DomainRecords = require("./domainRecords");
const { debugPort, domain } = require("process");
const express = require("express");
const router = require("./router");

//instantiate backend routes
const app = express();
app.use("/domains", router);

//readline for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//minimist for parsing flags and arguments to run script
const args = minimist(process.argv.slice(2));

let attempt = 1;

let domains = new DomainRecords();
let connections = new Connection();

const parseArguments = () => {
  console.log(
    "##############################################################################\nStarting dynamicDNSjs\n##############################################################################\n"
  );
  if (!args.t || !args.d || !args.n || !args.a) {
    /*
     ** help flag instructions
     */
    if (args.h) {
      console.log(
        "Flags required to run script: \n-t : time in seconds between checking records. Must be a value between 30 and 1800\n-d : domain name, eg. myserver.com\n-n : name of subdomain\n-a : API token for Digital Ocean"
      );
      console.log(
        "You can also pass the paramters in a config (JSON) file by using the flag -c followed by the filename"
      );
      process.exit(-1);

      /*
       ** if app is run with config file
       */
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
      if (process.env.NODE_ENV === "production") {
        mail.confirmEmailSystem();
      }

      startApplication();
    } else {
      console.log(
        "Missing argument(s) to run program. Try -h for more information."
      );
      process.exit(-1);
    }
  }
};

const startApplication = async () => {
  let localIP = await connections.fetchLocalIp();
  if (localIP) {
    domains.localIP = localIP;
  }
  let internet = await connections.checkInternetConnection().catch((err) => {
    console.log(err);
  });
  // let internet = true;
  if (internet) {
    domains
      .startProcess()
      .then((res) => {
        setTimeout(startApplication, config.timeout * 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    console.error("No internet connection. Can't resolve DNS.");
  }
};

parseArguments();
app.listen(config.port, () => {
  console.log("Web interface listening on PORT: " + config.port);
});
