'use strict';

let crypto = require('crypto');
let CONFIG = require('./crypto.config').CONFIG;
let cypher = CONFIG.cypher;
let formatEncrypt = CONFIG.formatEncrypt;
let hash = CONFIG.hash;
let codePublic = CONFIG.codePublic;

function getCodePublic() {
    let publicHellMan = crypto.createDiffieHellman(512);
    let codePublic = publicHellMan.getPrime();
    return codePublic;
}

let fs = require('fs');

//client request for server to getData
//body {clientPubKey, codePublic}

function getServerHellMan() {
    let serverHellMan = crypto.createDiffieHellman(codePublic);
    serverHellMan.generateKeys();
    let server = {
        serverHellMan: serverHellMan,
        serverPubKey: serverHellMan.getPublicKey()
    };
    return server;
}

//server use clientKeyPub to create common key. Then encrypto data use commonkey
function getServerSecret(clientPubKey, server) {
    let serverSecret = server.serverHellMan.computeSecret(clientPubKey);
    return serverSecret;
}

//server response for client
//body {serverKeyPub, cypher, formatEncrypto, data}

function getClientHellMan() {
    let clientHellMan = crypto.createDiffieHellman(codePublic);
    clientHellMan.generateKeys();
    let client = {
        clientHellMan: clientHellMan,
        clientPubKey: clientHellMan.getPublicKey()
    };
    return client;
}

//client use serverKeyPub to create common key. Then use common key to unlock data and decrypto data
function getClientSecret(serverPubKey, client) {
    let clientSecret = client.clientHellMan.computeSecret(serverPubKey);
    return clientSecret;
}

function encrypt(input, clientPubKey, server) {
    let serverPubKey = server.serverPubKey;
    let serverSecret = getServerSecret(clientPubKey, server);
    let serverHashedSecret = crypto.createHash(hash).update(serverSecret).digest(formatEncrypt);
    console.log('chia khoa server', serverHashedSecret);
    const cipher = crypto.createCipher(cypher, serverHashedSecret);
    let encrypted = cipher.update(input, 'utf8', formatEncrypt);
    encrypted += cipher.final(formatEncrypt);
    let response = {
        cypher: cypher,
        formatEncrypt: formatEncrypt,
        hash: hash,
        serverPubKey: serverPubKey,
        dataEncrypted: encrypted
    };
    return response;
}

function decrypt(cypher, formatEncrypt, hash, input, serverPubKey, client) {
    let clientSecret = getClientSecret(serverPubKey, client);
    let clientHashedSecret = crypto.createHash(hash).update(clientSecret).digest(formatEncrypt);
    console.log('chia khoa client ', clientHashedSecret);
    const cipher = crypto.createDecipher(cypher, clientHashedSecret);
    let decrypted = cipher.update(input, formatEncrypt, 'utf8');
    decrypted += cipher.final('utf8');
    return decrypted;
}

function encryptFile(inFile, outFile, clientPubKey, server) {
    let serverSecret = getServerSecret(clientPubKey, server);
    let serverHashedSecret = crypto.createHash(hash).update(serverSecret).digest(formatEncrypt);
    console.log('chia khoa server*****', serverHashedSecret);
    const cipher = crypto.createCipher(cypher, serverHashedSecret);
    const input = fs.createReadStream(inFile);
    const output = fs.createWriteStream(outFile);
    input.pipe(cipher).pipe(output);
}

function decryptFile(inFile, outFile, serverPubKey, client) {
    let clientSecret = getClientSecret(serverPubKey, client);
    let clientHashedSecret = crypto.createHash(hash).update(clientSecret).digest(formatEncrypt);
    console.log('chia khoa client**** ', clientHashedSecret);
    const decipher = crypto.createDecipher(cypher, clientHashedSecret);
    const input = fs.createReadStream(inFile);
    const output = fs.createWriteStream(outFile);

    input.pipe(decipher).pipe(output);
}

/*
let data = "Hello world";
let data2 = "I'm Thanh Hoang";


//server encrypto data
// let cypher = 'aes-256-ctr';
// let hash = 'sha256';
// let format = 'binary';

// Client create codePublic, clientPubKey and send request getData to Server
let server = getServerHellMan();
let client = getClientHellMan();
let clientPubKey = client.clientPubKey;
//

// // Server receive from Client. Include: {clientPubKey, codePublic}
// // Then Response Data encrypted for Client

let response = encrypt(data, clientPubKey, server);
//response += encrypt(data2, clientPubKey, server);
//
// // Client receive response from Server. Then Data decrypted
let getData = decrypt(response.cypher,response.formatEncrypt,response.hash,response.dataEncrypted, response.serverPubKey, client);
//
console.log('Response From Server encrypted ', response);
console.log('getData in Client ', getData);
*/
module.exports = {
    getServerHellMan: getServerHellMan,
    getClientHellMan: getClientHellMan,
    getServerSecret: getServerSecret,
    getClientSecret: getClientSecret,
    encrypt: encrypt,
    decrypt: decrypt,
    encryptFile: encryptFile,
    decryptFile: decryptFile
};