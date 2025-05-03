const Web3 = require('web3');
const web3 = new Web3('https://sepolia.base.org');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const PRIOR_TOKEN_ADDRESS = '0xefc91c5a51e8533282486fa2601dffe0a0b16edb';
const SWAP_ROUTER_ADDRESS = '0x8957e1988905311ee249e679a29fc9deced4d910';
const API_ENDPOINT = 'https://priortestnet.xyz/api/swap';
const DAILY_POINTS_LIMIT = 2.5;
const POINTS_PER_SWAP = 0.5;

// ERC20 ABI
const PRIOR_TOKEN_ABI = [
  {"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
  {"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},
  {"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}
];

// Initialize contract
const priorToken = new web3.eth.Contract(PRIOR_TOKEN_ABI, PRIOR_TOKEN_ADDRESS);

// API headers configuration
const API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'accept': '*/*',
    'accept-language': 'en-US,en;q=0.5',
    'priority': 'u=1, i',
    'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    'Referer': 'https://priortestnet.xyz/',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Read private keys from file
function readPrivateKeys() {
    const filePath = path.join(__dirname, 'private_keys.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
}

// Get current timestamp
function getTimestamp() {
    const now = new Date();
    return now.toISOString();  // Returns a string like '2025-05-01T00:00:00.000Z'
}

function getRandomDelay() {
    const minDelay = 5 * 60 * 1000; // 5 minutes in milliseconds
    const maxDelay = 10 * 60 * 1000; // 10 minutes in milliseconds
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

// Function to calculate the remaining time for the next run (24 hours - processing time)
function logRemainingTime(startTime) {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = 86400000 - elapsedTime;  // 24 hours in milliseconds
    const remainingHours = Math.floor(remainingTime / 3600000);  // Convert to hours
    const remainingMinutes = Math.floor((remainingTime % 3600000) / 60000);  // Convert to minutes
    const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);  // Convert to seconds

    console.log(chalk.yellow(`[${getTimestamp()}] The script will run in ${remainingHours} hours, ${remainingMinutes} minutes, and ${remainingSeconds} seconds.`));
}

async function checkAndApprove(account) {
    const spender = SWAP_ROUTER_ADDRESS;
    const maxAllowance = web3.utils.toBN(2).pow(web3.utils.toBN(256)).subn(1);

    try {
        const currentAllowance = await priorToken.methods.allowance(account.address, spender).call();
        if (web3.utils.toBN(currentAllowance).lt(maxAllowance)) {
            console.log(chalk.blue(`[${getTimestamp()}] Approving unlimited spending for ${account.address}...`));
            
            const approveTx = priorToken.methods.approve(spender, maxAllowance.toString());
            const gasEstimate = await approveTx.estimateGas({ from: account.address });
            const gasPrice = await web3.eth.getGasPrice();

            const txData = {
                from: account.address,
                to: PRIOR_TOKEN_ADDRESS,
                data: approveTx.encodeABI(),
                gas: gasEstimate,
                gasPrice: gasPrice
            };

            const signedTx = await web3.eth.accounts.signTransaction(txData, account.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(chalk.green(`[${getTimestamp()}] Approval successful. Tx hash: ${receipt.transactionHash}`));
        }
    } catch (error) {
        console.error(chalk.red(`[${getTimestamp()}] Approval failed: ${error.message}`));
        throw error;
    }
}

async function getDailyPoints(account) {
    try {
        const response = await axios.get(
            `https://priortestnet.xyz/api/users/${account.address}`,
            { headers: API_HEADERS }
        );
        return parseFloat(response.data.dailyPoints);
    } catch (error) {
        console.error(chalk.red(`[${getTimestamp()}] Failed to fetch daily points: ${error.response ? error.response.data : error.message}`));
        return null;
    }
}

async function calculateRemainingSwaps(account) {
    const dailyPoints = await getDailyPoints(account);
    if (dailyPoints === null) return 0;

    const remainingPoints = DAILY_POINTS_LIMIT - dailyPoints;
    if (remainingPoints <= 0) {
        console.log(chalk.yellow(`[${getTimestamp()}] Daily limit reached (${dailyPoints}/${DAILY_POINTS_LIMIT})`));
        return 0;
    }

    const remainingSwaps = Math.floor(remainingPoints / POINTS_PER_SWAP);
    console.log(chalk.green(`[${getTimestamp()}] Daily points: ${dailyPoints}/${DAILY_POINTS_LIMIT}`));
    console.log(chalk.green(`[${getTimestamp()}] Remaining swaps: ${remainingSwaps}`));
    return remainingSwaps;
}

async function performSwap(account) {
    const amountWei = '10000000000000000';

    try {
        const functionSignature = '0x8ec7baf1';
        const encodedAmount = web3.eth.abi.encodeParameter('uint256', amountWei);
        const swapData = functionSignature + encodedAmount.slice(2);

        const txObject = {
            from: account.address,
            to: SWAP_ROUTER_ADDRESS,
            data: swapData
        };

        const gasEstimate = await web3.eth.estimateGas(txObject);
        const gasPrice = await web3.eth.getGasPrice();

        const signedTx = await web3.eth.accounts.signTransaction({
            ...txObject,
            gas: gasEstimate,
            gasPrice: gasPrice
        }, account.privateKey);

        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return {
            success: true,
            txHash: receipt.transactionHash,
            amountWei: amountWei
        };
    } catch (error) {
        console.error(chalk.red(`[${getTimestamp()}] Swap failed: ${error.message}`));
        return { success: false, error: error.message };
    }
}

async function submitSwapToAPI(account, txHash, amountWei) {
    try {
        const decimals = await priorToken.methods.decimals().call();
        const amountBN = web3.utils.toBN(amountWei);
        const divisor = web3.utils.toBN(10).pow(web3.utils.toBN(decimals));
        const formattedAmount = amountBN.div(divisor).toString() + 
                             '.' + amountBN.mod(divisor).toString(10).padStart(decimals, '0').replace(/0+$/, '');

        const payload = {
            address: account.address.toLowerCase(),
            amount: formattedAmount.endsWith('.') ? formattedAmount.slice(0, -1) : formattedAmount,
            tokenFrom: "PRIOR",
            tokenTo: "USDC",
            txHash: txHash
        };

        const response = await axios.post(API_ENDPOINT, payload, {
            headers: {
                ...API_HEADERS,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(chalk.red(`[${getTimestamp()}] API Submission failed: ${error.response ? error.response.data : error.message}`));
        return { success: false };
    }
}

async function executeSwapCycle(account) {
    const swapResult = await performSwap(account);
    if (!swapResult.success) return false;

    const apiResult = await submitSwapToAPI(account, swapResult.txHash, swapResult.amountWei);
    if (!apiResult.success) return false;

    console.log(chalk.green(`[${getTimestamp()}] Swap successful: ${swapResult.txHash}`));
    console.log(chalk.green(`[${getTimestamp()}] Points earned: ${apiResult.pointsEarned}`));
    return true;
}

async function processWallet(privateKey) {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    console.log(chalk.blue(`[${getTimestamp()}] Processing wallet: ${account.address}`));

    try {
        const remainingSwaps = await calculateRemainingSwaps(account);
        if (remainingSwaps === 0) {
            console.log(chalk.yellow(`[${getTimestamp()}] Skipping wallet - daily limit reached.`));
            return;
        }

        await checkAndApprove(account);

        let successfulSwaps = 0;
        for (let i = 0; i < remainingSwaps; i++) {
            console.log(chalk.blue(`[${getTimestamp()}] Processing swap ${i + 1}/${remainingSwaps}`));
            const success = await executeSwapCycle(account);
            if (!success) break;
            
            successfulSwaps++;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        console.log(chalk.green(`[${getTimestamp()}] Completed ${successfulSwaps} swaps for ${account.address}`));
        const finalPoints = await getDailyPoints(account);
        console.log(chalk.green(`[${getTimestamp()}] Final points: ${finalPoints}/${DAILY_POINTS_LIMIT}`));
    } catch (error) {
        console.error(chalk.red(`[${getTimestamp()}] Error processing wallet ${account.address}:`, error));
    }
}
function printHeader() {
  const line = "=".repeat(50);
  const title = "Auto Daily Prior";
  const createdBy = "Bot created by: https://t.me/airdropwithmeh";

  const totalWidth = 50;
  const titlePadding = Math.floor((totalWidth - title.length) / 2);
  const createdByPadding = Math.floor((totalWidth - createdBy.length) / 2);

  const centeredTitle = title.padStart(titlePadding + title.length).padEnd(totalWidth);
  const centeredCreatedBy = createdBy.padStart(createdByPadding + createdBy.length).padEnd(totalWidth);

  console.log(line);
  console.log(centeredTitle);
  console.log(centeredCreatedBy);
  console.log(line);
}

async function main() {
	printHeader();
    const privateKeys = readPrivateKeys();
    const startTime = Date.now();
    console.log(chalk.blue(`[${getTimestamp()}] Found ${privateKeys.length} wallets to process.`));

    // Process all wallets
    for (const privateKey of privateKeys) {
		const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        
        // Check the current account's points to determine if we should skip processing or not
        const dailyPoints = await getDailyPoints(account);
        
        if (dailyPoints >= DAILY_POINTS_LIMIT) {
            console.log(chalk.yellow(`[${getTimestamp()}] Skipping wallet ${account.address} - daily limit reached.`));
            continue; // Skip processing this wallet if daily limit is reached
        }
		
        await processWallet(privateKey);
        console.log(chalk.blue(`\n${'='.repeat(50)}\n`)); // Separator between wallets
		
		const randomDelay = getRandomDelay();
        console.log(chalk.blue(`[${getTimestamp()}] Waiting for ${randomDelay / 60000} minutes before processing the next wallet...`));
        
        // Wait for the random delay before processing the next wallet
        await new Promise(resolve => setTimeout(resolve, randomDelay));
    }

    // Log remaining time after processing all wallets
    logRemainingTime(startTime);

    // Calculate the time taken and set the next run time
    const elapsedTime = Date.now() - startTime;
    const remainingTime = 86400000 - elapsedTime;  // 24 hours in milliseconds

    // Schedule the next run after the remaining time
    setTimeout(main, remainingTime);
}

// Initial run
main().catch(console.error);
