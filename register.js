const Web3 = require('web3');
const fs = require('fs');
const axios = require('axios');

const web3 = new Web3(); // No provider needed for address derivation

// Read private keys from file
const privateKeys = fs.readFileSync('private_keys.txt', 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

// Headers as specified
const headers = {
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
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Type': 'application/json'
};

privateKeys.forEach((privateKey) => {
    try {
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        const address = account.address.toLowerCase();
        console.log(`Processing address: ${address}`);

        const payload = { address };

        axios.post('https://priortestnet.xyz/api/auth', payload, { headers })
            .then(response => {
                console.log(`Success for ${address}`);
            })
            .catch(error => {
                if (error.response) {
                    console.error(`Error for ${address}:`, error.response.status, error.response.data);
                } else {
                    console.error(`Error for ${address}:`, error.message);
                }
            });
    } catch (error) {
        console.error(`Invalid private key: ${privateKey}`, error.message);
    }
});