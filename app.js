var vaultOptions = {
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
  token: process.env.VAULT_TOKEN || ''
};

var vault = require("node-vault")(vaultOptions);
var express = require("express"); 
var app = express();
var cfenv = require("cfenv")
var appEnv = cfenv.getAppEnv();

process.env.DEBUG = 'node-vault';

if (appEnv) {
  var ns = 'cf/' + appEnv.app.application_id + '/secret/' + appEnv.app.application_name;
} else {
  var ns = 'secret/nodejs-vault-demo';
}

// Init vault server, but only if not already initialized
vault.initialized()
.then((result) => {
  console.log(result);
  return vault.init({ secret_shares: 1, secret_threshold: 1 });
})
.then((result) => {
  console.log(result);
  vault.token = result.root_token;
  const key = result.keys[0];
  return vault.unseal({ secret_shares: 1, key });
})
.then((result) => {
  console.log(result);
  return vault.write(ns, { message: 'Hello World' });
})
.catch((err) => console.error(err.message));

app.get('/', function (req, res) {
  vault.read(ns)
    .then((result) => res.send(result.data.message))
    .catch((err) => console.error(err.message)); 
});
port = process.env.PORT || 3000;
app.listen(port);

console.log('I am ready and listening on %d', port);

