const axios = require("axios");

axios.defaults.timeout = 5000;
axios.defaults.headers = {
    'Cache-Control': ['no-cache', 'no-store', 'must-revalidate'],
    'Expires': 0,
    'Access-Control-Max-Age': 1
}
axios.defaults.params = {
    t: new Date().getTime()
}

module.exports = axios;