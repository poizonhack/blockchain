// Modules
const current_node_url = process.argv[3];
const Transaction = require('./transaction');
const Block = require('./block');
const Node = require('./node');

/*
 * Class
 */
class Blockchain {

    // Constructor
    constructor() {
        this.difficulty = 2;
        this.chain = [];
        this.pending_transactions = [];
        this.mining_reward = 10;
        this.nodes = [];
    }

    // Create a default genesis block
    createDefaultGenenisBlock() {
        let genesis_block = new Block('0', []);
        //genesis_block.timestamp = 0000000000000;
        genesis_block.hash = "00710f37159bb47b139cbc302d0c574d812ddbc11d73bfe8224d08f5477318b3";
        this.chain.push(genesis_block);
    }

    // Create the genesis block
    createGenenisBlock() {
        let genesis_block = new Block('0', []);
        genesis_block.mineBlock(this.difficulty);
        this.chain.push(genesis_block);
    }
    
    // Get the latest block
    getLatestBlock() {
       return this.chain[this.chain.length - 1];
    }

    // Add a new transaction to pending transctions
    addTransaction(transaction) {
        if (!transaction.sender || !transaction.recipient) {
          throw new Error('Transaction must include sender and recipient addresses');
        }
        if (!transaction.isTransactionValid()) {
          throw new Error('Cannot add invalid transaction to the block');
        }
        this.pending_transactions.push(transaction);
        return (this.chain.length) + 1;
    }
    
    // Mine pending transactions block
    minePendingTransactions(mining_reward_address) {
        const mining_reward_transaction = new Transaction(null, mining_reward_address, this.mining_reward);
        this.pending_transactions.push(mining_reward_transaction);
        let block = new Block(this.getLatestBlock().hash, this.pending_transactions);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pending_transactions = [];
    }

    // Verify if the current blockchain is valid
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current_block = this.chain[i];
            const previous_block = this.chain[i - 1];
            if (!current_block.hasValidTransactions()) {
                return false;
            }
            if (current_block.hash !== current_block.hashBlock()) {
                return false;
            }
            if (current_block.previous_hash !== previous_block.hashBlock()) {
                return false;
            }
        }
        return true;
    }

    // Get an address informations : balance and transactions
    getAddressInfos(address) {
        let address_balance = 0;
        let address_transactions = [];
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.sender === address) {
                    address_balance -= transaction.amount;
                    address_transactions.push(transaction);
                }
                if (transaction.recipient === address) {
                    address_balance += transaction.amount;
                    address_transactions.push(transaction);
                }
            }
        }
        return {
            address_transactions: address_transactions,
            address_balance: address_balance
        };
    }

    // Add a new node to nodes network
    addNode(node) {
        this.nodes.push(node);
    }

    // Verify if a node is already present in network
    node_already_present(nd) {
        for (const node of this.nodes) {
            if (node.node_url === nd.node_url) {
                return true;
            }
        }
        return false;
    }

}

// Export as module
module.exports = Blockchain;