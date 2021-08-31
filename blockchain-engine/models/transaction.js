// Modules
const uuid = require('uuid/v1');
const sha256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

/*
 * Class
 */
class Transaction {

    // Constructor
    constructor(sender, recipient, amount) {
        this.transaction_id = uuid().split('-').join('');
        this.sender = sender;
		this.recipient = recipient;
		this.amount = amount;
    }

    // Hash a transactiion
    hashTransaction() {
        return sha256(
            this.transaction_id.toString() +
            this.sender + 
            this.recipient + 
            this.amount
        ).toString();
    }
    
    // Sign a transaction
    signTransaction(signKey) {
        if (signKey.getPublic('hex') !== this.sender) {
          throw new Error('You cannot sign transactions');
        }
        const transaction_hash = this.hashTransaction();
        const sign = signKey.sign(transaction_hash, 'base64');
        this.signature = sign.toDER('hex');
    }
    
    // Verify if a transaction is valid
    isTransactionValid() {
        if (this.sender === null) {
          return true;
        }
        if (!this.signature || this.signature.length === 0) {
          throw new Error('No signature in this transaction');
        }
        const publicKey = ec.keyFromPublic(this.sender, 'hex');
        return publicKey.verify(this.hashTransaction(), this.signature);
    }
}

// Export as module
module.exports = Transaction;