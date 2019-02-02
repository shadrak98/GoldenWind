const Web3 = require('web3')
const {abiArray} = require('./abi')
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var contractAddress = '0xc312387632a91f19a3b2956950abe89c916d698e'
const contract = web3.eth.contract(abiArray).at(contractAddress);

 console.log(contract.balanceOf('0xe5bd19b749a85ecf635d35e10c2836bae225beba'))