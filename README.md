
# Auto Daily Prior

This repository provides a script to automatically handle token swaps and earn daily points based on wallet activities on the Sepolia testnet. The process involves approving token spending, performing swaps, and reporting results to an external API.

## Prerequisites

- Node.js (v14.x or higher)
- NPM (Node Package Manager)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/ganjsmoke/prior-testnet.git
cd prior-testnet
```

### Step 2: Install Dependencies

In the project directory, run the following command to install the required dependencies:

```bash
npm install web3@1.8.0 axios chalk@2
```

### Step 3: Setup Configuration Files

1. **Private Keys File**:
   - Create a file named `private_keys.txt` in the root directory.
   - Add the private keys of the wallets you want to process, each on a new line.
   
   Example of `private_keys.txt`:
   ```
   0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

2. **Ensure Your API Endpoint and Contract Addresses Are Correct**:
   - The script already has configured contract addresses, API endpoints, and other parameters in the code. You may adjust these configurations in the script files if necessary.

## Running the Scripts

There are three main scripts you need to run in order:

### Step 1: Run `faucet.js`

The `faucet.js` script will provide the initial faucet tokens to the wallet addresses for the testnet.

To run the script:

```bash
node faucet.js
```

Ensure that you have enough tokens in your wallet to initiate the next steps.

### Step 2: Run `register.js`

The `register.js` script registers the wallets with the external API. This step is necessary for tracking daily points and swaps.

To run the script:

```bash
node register.js
```

### Step 3: Run `index.js`

After the wallets are registered, run the `index.js` script to process each wallet. This script will:
- Approve token spending.
- Check and perform swaps if the wallet has remaining daily points.
- Submit swap information to the external API.

To run the script:

```bash
node index.js
```

The script will process all wallets in `private_keys.txt` and log relevant information to the console. The swaps will be performed, and points will be accumulated.

## Script Flow

1. **faucet.js**: Distribute testnet tokens to wallet addresses.
2. **register.js**: Register wallets with the external API.
3. **index.js**: Perform the swaps and log the results. It will check if the daily points limit has been reached before making any swaps.

## Logs and Output

The script logs various information to the console, including:
- Successful transactions.
- Errors encountered.
- Time remaining for the next script run.
  
### Sample Log Output:

```
[2025-05-02T00:00:00.000Z] Found 5 wallets to process.
[2025-05-02T00:05:00.000Z] Processing wallet: 0xABC123...
[2025-05-02T00:05:05.000Z] Approving unlimited spending for 0xABC123...
[2025-05-02T00:10:00.000Z] Swap successful: 0xTransactionHash
[2025-05-02T00:10:05.000Z] Points earned: 0.5
```

## Configuration Details

- **`private_keys.txt`**: This file should contain the private keys of the wallets you wish to process.
- **API Endpoint**: The script interacts with the `https://priortestnet.xyz/api/swap` endpoint to report the swap results.
- **Token Contract Address**: The script interacts with the PRIOR token contract (`0xefc91c5a51e8533282486fa2601dffe0a0b16edb`).

## Notes

- The script runs in a loop, processing wallets and waiting for a random delay between each cycle.
- Be mindful of the API rate limits and daily points limits to avoid errors.
- The script uses the Sepolia testnet, so make sure your wallet is funded with Sepolia tokens before running.

## Troubleshooting

If you encounter any issues, here are a few steps to resolve common problems:

1. **Out of Gas**:
   - Ensure that your wallet has sufficient testnet ETH for gas fees.
   
2. **Incorrect Private Key**:
   - Double-check that the private keys in `private_keys.txt` are correct and properly formatted.

3. **API Errors**:
   - Check the API response to ensure you have correct API headers and endpoint configurations.

If you encounter any issues not covered here, feel free to open an issue on the repository.
