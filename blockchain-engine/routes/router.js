// File system
'use strict';
const fs = require('fs');

// Express
const express = require('express');
const router = express.Router();
const rp = require('request-promise');

// Modules
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const current_node_url = process.argv[3];

// Models
const Blockchain = require('./../models/blockchain');
const Block = require('./../models/block');
const Transaction = require('./../models/transaction');
const Node = require('./../models/node');
const Wallet = require('./../models/wallet');
const User = require('./../models/user');

// Blockchain instance
let blockchain = new Blockchain();

// Get current blockchain from file storage
const getBlockchain = function () {
    var rawdata = fs.readFileSync('./storage/blockchain.json');
    var data = JSON.parse(rawdata);
    // Populate chain with file data
    var bc = new Blockchain();
    bc.difficulty = data.difficulty;
    bc.chain = data.chain;
    bc.pending_transactions = data.pending_transactions;
    bc.mining_reward = data.mining_reward;
    bc.current_node_url = current_node_url;
    bc.nodes = data.nodes;
    return bc;
};

// Store current blockchain in file storage
const postBlockchain = function (bc) {
    fs.writeFileSync('./storage/blockchain.json', JSON.stringify(bc));
};

// Get users wallet from file storage
const getWallet = function () {
    var rawdata = fs.readFileSync('./storage/wallet.json');
    var data = JSON.parse(rawdata);
    console.log(data);
    // Populate wallet with file data
    var wal = new Wallet();
    wal.users = data.users;
    return wal;
};

// Store users wallet in file storage
const postWallet = function (wal) {
    fs.writeFileSync('./storage/wallet.json', JSON.stringify(wal));
};

// Generate a pair key for a user
const genUserKey = function(user_id) {
    var key = ec.genKeyPair();
    var public_k = key.getPublic('hex');
    var private_k = key.getPrivate('hex');
    var wal = getWallet();
    if (keyNotExists(wal.users, key)) {
        var user = new User(user_id, public_k, private_k);
        wal.users.push(user);
        postWallet(wal);
        return user;
    }
    else {
        genUserKey(user_id);
    }
    return null;
}

// Verify if key already exists
const keyNotExists = function(users, key) {
    var public_k = key.getPublic('hex');
    var private_k = key.getPrivate('hex');
    for (const user of users) {
        if ((public_k === user.public_key) || (private_k === user.private_key)) {
            return false;
        }
    }
    return true;
}

// Get private key from public key
const getPrvFromPub = function(public_k) {
    var wal = getWallet();
    for (const user of wal.users) {
        if ((public_k === user.public_key)) {
            return user.private_key;
        }
    }
    return null
}

/*
 * Routes
 */

// Init blockchain
router.get('/', function (req, res) {
    // Init blockchain instance
    var bc = new Blockchain();
    // Create default genesis block
    bc.createDefaultGenenisBlock();
    // Register current node
    const request_options = {
        uri: current_node_url + '/blockchain-engine/register-current-node',
        method: 'POST',
        json: true
    };
    var promise_message = "";
    new Promise((resolve, reject) => {
        rp(request_options);
        })
        .then(result => {
            // Success
            promise_message = result;
        },
        result => {
            // Failure
            promise_message = error;
        });
    // Response
    res.json({
        "message" : promise_message.toString(),
        "note": `Blockchain created with genesis block.` 
    });
    blockchain = bc;
});

// Get blockchain
router.get('/blockchain', function (req, res) {
    res.send(blockchain);
});

// Create a new transaction
router.post('/add-transaction', function (req, res) {
    const request = req.body;
    const new_transaction = new Transaction(request.sender, request.recipient, request.amount);
    // Signin key
    const private_k = getPrvFromPub(request.sender)
    const myKey = ec.keyFromPrivate(private_k);
    // Sign transaction
    new_transaction.signTransaction(myKey);
    // Add transaction to pending transactions
    const block_index = blockchain.addTransaction(new_transaction);
    // Response
    res.json({ note: `Transaction will be added in block ${block_index}.` });
});

// Broadcast a transaction
router.post('/broadcast-transaction', function(req, res) {
    const request = req.body;
    const new_transaction = new Transaction(request.sender, request.recipient, request.amount);
    const request_promises = [];
    for (const node of blockchain.nodes) {
        const node_url = node.node_url;
            const request_options = {
                uri: node_url + '/blockchain-engine/add-transaction',
                method: 'POST',
                body: new_transaction,
                json: true
            };
            request_promises.push(rp(request_options));
    }
    var promise_message = "";
    Promise.all(request_promises)
           .then(result => {
                // Success
                promise_message = result;
            })
            .catch(error => {
                // Failure
                promise_message = error;
            });
    // Response
    res.json({
        "message" : promise_message.toString(), 
        "note": 'Transaction created and broadcasted.' });                    
});

// Receive new block
/*
router.post('/receive-new-block', function(req, res) {
	const new_bbock = req.body.new_block;
	const last_block = blockchain.getLastBlock();
    const correct_hash = last_block.hash === new_block.previous_hash;
    // 
	const correct_index = last_block['index'] + 1 === new_block['index'];
	if (correct_hash && correct_index) {
		blockchain.chain.push(new_block);
		blockchain.pending_transactions = [];
		res.json({
			"note": 'New block received and accepted.',
			"new_block": new_block
		});
    } 
    else {
		res.json({
			"note": 'New block rejected.',
			"new_block": new_block
		});
	}
});
*/

// Mine a block
router.post('/mine', function(req, res) {
    const mining_reward_address = req.body.mining_reward_address;
    blockchain.minePendingTransactions(mining_reward_address);
    const new_block = blockchain.getLatestBlock();
    res.json({
        //"message" : promise_message.toString(),
        "note": 'New block mined successfully.' 
    });        
});

// Register current node
router.post('/register-current-node', function (req, res) {
    const node = new Node(current_node_url);
    if (!blockchain.node_already_present(node)) {
        blockchain.nodes.push(node);
        res.json({ note: 'Current node registered successfully.' });
    }
    else {
        res.json({ note: 'Current node is already registered.' });
    }
});

// Register a node
router.post('/register-node', function (req, res) {
    const node_url = req.body.node_url;
    const node = new Node(node_url);
    const not_current_node_url = current_node_url !== node_url;
    if ((!blockchain.node_already_present(node)) && not_current_node_url) {
        blockchain.nodes.push(node);
        res.json({ note: 'New node registered successfully.' });
    }
    else {
        res.json({ note: 'Node is already registered or is current node.' });
    }
});

// register multiple nodes at once
router.post('/register-nodes-bulk', function (req, res) {
    const nodes_urls = req.body.nodes;
    for (const node_url of nodes_urls) {
        const node = new Node(node_url);
        const not_current_node_url = current_node_url !== node_url;
        if ((!blockchain.node_already_present(node)) && not_current_node_url) {
            blockchain.nodes.push(node);
        }    
    }
    res.json({ note: 'Bulk registration finished.' });
});
 
// Register a node and broadcast it the network
router.post('/broadcast-node', function (req, res) {
    const url = req.body.node_url;
    const node = new Node(url);
    const not_current_node_url = current_node_url !== url;
    if ((!blockchain.node_already_present(node)) && not_current_node_url) {
        blockchain.nodes.push(node);
        const nodes_promises = [];
        for (const node of blockchain.nodes) {
            const node_url = node.node_url;
                const request_options = {
                    uri: node_url + '/blockchain-engine/register-node',
                    method: 'POST',
                    body: { "node_url": url },
                    json: true
                };
                nodes_promises.push(rp(request_options));
        }
        var promise_message = "";
        Promise.all(nodes_promises)
               .then(result => {
                    promise_message = result;
                    const nodes_urls = [];
                    for (const node of blockchain.nodes) {
                            nodes_urls.push(node.node_url);
                    }
                    const bulk_options = {
                        uri: url + '/blockchain-engine/register-nodes-bulk',
                        method: 'POST',
                        body: { "nodes": nodes_urls },
                        json: true
                    };
                    return rp(bulk_options);
                    
                })
                .catch(error => {
                    // Failure
                    promise_message = error;
                });
        // Response
        res.json({
            "message" : promise_message.toString(), 
            "note": 'Node registered and broadcasted.' 
        }); 
    }
    else {
        res.json({ "note": 'Node is already registered or is current node.' });
    }
});

// Consensus : resolve conflict
router.get('/consensus', function(req, res) {
    const request_promises = [];
    for (const node of blockchain.nodes) {
        const node_url = node.node_url;
        if (current_node_url !== node_url) {
            const request_options = {
                uri: node_url + '/blockchain-engine/blockchain',
                method: 'GET',
                json: true
            };
            request_promises.push(rp(request_options));
        }
    }
    Promise.all(request_promises)
           .then(blockchains => {
                const current_chain_length = blockchain.chain.length;
                let max_chain_length = current_chain_length;
                let new_longest_chain = null;
                let new_pending_transactions = null;
                for (const bc of blockchains) {
                    if (bc.chain.length > max_chain_length) {
                        max_chain_length = bc.chain.length;
                        new_longest_chain = bc.chain;
                        new_pending_transactions = bc.pending_transactions;
                    }
                }
                if (!new_longest_chain) {
                    res.json({
                        "note": 'Current chain has not been replaced.',
                        "chain": blockchain.chain
                    });
                }
                else {
                    blockchain.chain = new_longest_chain;
                    blockchain.pending_transactions = new_pending_transactions;
                    res.json({
                        "note": 'This chain has been replaced.',
                        "chain": blockchain.chain
                    });
                }
            })
            .catch(error => {
                // Failure
            });
});

// Add user for wallet
router.post('/add-user', function (req, res) {
    const user_id = req.body.user_id;
    var user = genUserKey(user_id);
    res.json({
        "note": 'User added succesfully.',
        "user": user
    });
});

// Export as module
module.exports = router;