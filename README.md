# dynamicDNSjs

DynamicDNSjs aims to provide an easy to use self-hosted Dynamic DNS service.

## pm2

DynamicDNSjs can easily be run by using the pm2 process manager. Edit the config.example and paste your API key, domain, and subdomain configuration. You can install pm2 on your server with
`npm install pm2 -g`

Basic ecosystem.config.js for pm2

    ```
    module.exports = {
        apps : [{
            name: "Dynamic DNS",
            script: 'app.js',
            time: true,
            args: "-c config.json"
        }]
    };
    ```

If you set "EMAIL" to true a .env file is required with

- EMAIL_HOST = "smtp.youremailhost.com"
- EMAIL_PASSWORD = "youremailpasswordhere"
- EMAIL_USERNAME = "email@myemail.com"
- SEND_TO = "email@youremail.com"
