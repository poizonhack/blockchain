// Modules
const sha256 = require('crypto-js/sha256');
const Transaction = require('./transaction');

/*
 * Class
 */
class Block {

    // Constructor
    constructor(previous_hash, transactions) {
        this.timestamp = Date.now();
        this.previous_hash = previous_hash;
        this.transactions = transactions;
        this.nonce = 0;
        this.hash = this.hashBlock();
    }

    // Hash a block
    hashBlock() {
        return sha256(
            this.timestamp + 
            this.previous_hash +
            JSON.stringify(this.transactions) +
            this.nonce
        ).toString();
    }

    // Mine a block
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce ++;
            this.hash = this.hashBlock();
        }

    }

    // Verify if a block has valid transactions
    hasValidTransactions() {
        for (const transaction of this.transactions) {
          if (!transaction.isTransactionValid()) {
            return false;
          }
        }
        return true;
      }
}

// Export as module
module.exports = Block;