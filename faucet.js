const Web3 = require('web3');
const fs = require('fs');
const process = require('process');

// Set up Web3 instance connected to Sepolia
const web3 = new Web3('https://sepolia.base.org');

// Faucet router contract address
const faucetRouterAddress = '0xa206dc56f1a56a03aea0fcbb7c7a62b5be1fe419';

// Reading private keys from private_keys.txt
const privateKeys = fs.readFileSync('private_keys.txt', 'utf-8').split('\n').map(key => key.trim()).filter(Boolean);

// Function to claim tokens for a wallet
async function claimTokens(privateKey) {
  try {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    const faucetRouter = new web3.eth.Contract([
      {
        "constant": false,
        "inputs": [],
        "name": "claim",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ], faucetRouterAddress);

    const gasEstimate = await faucetRouter.methods.claim().estimateGas({ from: account.address });
    const gasPrice = await web3.eth.getGasPrice();
    
    console.log(`Wallet: ${account.address}`);

    const tx = {
      from: account.address,
      to: faucetRouterAddress,
      gas: gasEstimate,
      gasPrice: gasPrice,
      data: faucetRouter.methods.claim().encodeABI()
    };

    const receipt = await web3.eth.sendTransaction(tx);
    console.log(`Claim successful for wallet ${account.address}, Transaction hash: ${receipt.transactionHash}`);

    return true; // Successfully claimed
  } catch (error) {
    console.error(`Error claiming for wallet: ${privateKey}`, error);
    return false; // Failed to claim
  }
}

// Function to process all wallets
async function processWallets() {
  const startTime = Date.now();
  let processedCount = 0;

  for (const privateKey of privateKeys) {
    const success = await claimTokens(privateKey);
    if (success) {
      processedCount++;
    }
  }

  const endTime = Date.now();
  const elapsedTime = (endTime - startTime) / 1000; // in seconds
  const nextRunTime = 24 * 60 * 60 - elapsedTime; // subtract elapsed time from 24 hours

  console.log(`Processed ${processedCount} wallets in ${elapsedTime} seconds`);
  console.log(`Next execution will occur in ${nextRunTime} seconds`);

  return nextRunTime;
}

// Execute script
async function execute() {
  const nextRunTime = await processWallets();

  // Set a timer to run the script again after the remaining time
  setTimeout(execute, nextRunTime * 1000);
}

// Start the process
execute();
