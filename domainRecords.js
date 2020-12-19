const axios = require("axios");
const fetchPublicIP = require("./publicIPFetcher");
const restartApplication = require("./app");
const config = require("./config.json");

let SERVER_IP;
let attempt = 0;

console.log(axios.defaults);

class domainRecords {
  constructor() {
    this.domains = [];
    this.serverIP = String;
    this.rawRecords = new Array();
  }

  newDomain(id, domain, name, apiKey) {
    let d = new DomainRecord(id, domain, name, apiKey);
    this.domains.push(d);
    return d;
  }

  getAllDomains() {
    return this.domains;
  }

  async fetchServerIP() {
    const ip = await fetchPublicIP();
    this.serverIP = ip;
  }

  setServerIP(ip) {
    this.serverIP = ip;
    SERVER_IP = ip;
  }

  fetchDomainRecords() {
    return new Promise((resolve) => {
      const domains = this.getAllDomains();
      let promises = [];
      let records = [];
      console.log("Fetching DNS host records... .... ....");
      for (let i = 0; i < domains.length; i++) {
        promises.push(
          axios
            .get(
              "https://api.digitalocean.com/v2/domains/" +
                domains[i].domain +
                "/records?cb=" +
                `${new Date().getTime()}`,
              {
                headers: {
                  "Cache-Control": "no-cache",
                  Authorization: `Bearer ${domains[i].apiKey}`,
                },
              }
            )
            .then((response) => {
              this.rawRecords.push(response.data);
              records.push(response.data);
            })
            .catch((error) => {
              console.error(error);
            })
        );
      }
      Promise.all(promises).then(() => {
        console.log("Fetched domain records");
        let parse = this.parseRecords().then(() => {
          this.matchPublicandDomainRecordIP().then(() => {
            resolve("true");
          });
        });
      });
    });
  }

  async parseRecords() {
    const domains = this.getAllDomains();
    for (let i = 0; i < this.domains.length; i++) {
      domains[i].parseDomainRecord(this.rawRecords[i]);
    }
  }

  matchPublicandDomainRecordIP() {
    return new Promise((resolve) => {
      this.fetchServerIP().then(() => {
        const domains = this.getAllDomains();
        for (let i = 0; i < domains.length; i++) {
          if (this.serverIP === domains[i].currentIP) {
            console.log(domains[i].name + " IP matches server's public IP");
            resolve("true");
          } else {
            let update = domains[i]
              .updateDomainRecords(this.serverIP)
              .then(() => {
                resolve("true");
              });
          }
        }
      });
    });
  }

  startProcess() {
    return new Promise((resolve) => {
      let res = this.fetchDomainRecords()
        .then(() => {
          resolve("true");
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  restartProcess() {
    console.log("Restarting in " + config.timeout / 1000 + "s");
    setTimeout(this.fetchDomainRecords, config.timeout);
  }
}

class DomainRecord {
  constructor(id, domain, name, apiKey, currentIP, recordID) {
    this.id = id;
    this.domain = domain;
    this.name = name;
    this.apiKey = apiKey;
    this.currentIP = currentIP;
    this.recordID = recordID;
  }

  parseDomainRecord(rawRecords) {
    console.log("Parsing domain: ", this.name);
    const nameMatch = rawRecords.domain_records.find(
      ({ name }) => name === this.name
    );
    if (nameMatch != undefined && nameMatch.name === this.name) {
      console.log(
        "Found a matching record. Name: '" +
          nameMatch.name +
          "'. Currently pointed at IP:" +
          nameMatch.data
      );
      this.currentIP = nameMatch.data;
      this.recordID = nameMatch.id;
    } else {
      console.log("No matching domain records.");
      this.userPromptNewDomain();
    }
  }

  updateDomainRecords(serverIP) {
    return new Promise((resolve) => {
      console.log("Updating domain records for '" + this.name + "'");
      const url =
        "https://api.digitalocean.com/v2/domains/" +
        this.domain +
        "/records/" +
        this.recordID;
      axios({
        method: "put",
        url:
          "https://api.digitalocean.com/v2/domains/" +
          this.domain +
          "/records/" +
          this.recordID,
        headers: { Authorization: `Bearer ${this.apiKey}` },
        data: { data: serverIP },
      })
        .then((res) => {
          if (res.status === 200) {
            console.log("Domain records updated.");
            attempt = 0;
            resolve("true");
          } else {
            console.log("Error updating domain records... Retrying" + attempt);
            attempt++;
            if (attempt < 5) {
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
          setTimeout(fetchIP, config.timeout);
        });
    });
  }

  createNewDomainRecord() {
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
          setTimeout(fetchIP, config.timeout);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

module.exports = domainRecords;
