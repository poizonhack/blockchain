// File system
'use strict';
const fs = require('fs');

// Express modules
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Listening port
const port = process.argv[2];

// Express uses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Router module
var router = require('./routes/router');
// Router use
app.use('/blockchain-engine/', router);

// Models
const Blockchain = require('./models/blockchain');
const Blockc = require('./models/block');
const Transaction = require('./models/transaction');
const Node = require('./models/node');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/*
// Private key
const myKey = ec.keyFromPrivate('2f55d5ed08e79bd88768449cc563ee0ee7c643263cdd76d14602c7764cf1e366');
// Public key
const walletAdress = myKey.getPublic('hex');
console.log('Public : ' + walletAdress);
*/
/*
var key1 = ec.genKeyPair();
console.log('Public key 1 : ' + key1.getPublic('hex'));
console.log('Private key 1 : ' + key1.getPrivate('hex'));
var key2 = ec.genKeyPair();
console.log('Public key 2 : ' + key2.getPublic('hex'));
console.log('Private key 2 : ' + key2.getPrivate('hex'));
*/
/*
const tx1 = new Transaction(walletAdress, 'to public key', 5);
tx1.signTransaction(myKey);
blockchain.addTransaction(tx1);

blockchain.minePendingTransactions(walletAdress);
console.log('Balance of walletAdress : ' + JSON.stringify(blockchain.getAddressInfos(walletAdress), null, 4));

console.log(JSON.stringify(blockchain, null, 4));
console.log('Is chain valid? ' + blockchain.isChainValid());
*/

// Run 
app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
});

// Export as module
module.exports = app;