# STX/sBTC Fundraising App

This is a simple crypto fundraising web page built on Stacks. It lets people run a ~1-month-long campaign to raise funds in STX and sBTC.

## Development

To run this app with a Stacks Devnet (private development blockchain environment), follow these steps:

1. **Start Devnet in Hiro Platform**

   - Log into the [Hiro Platform](https://platform.hiro.so)
   - Navigate to your project and start Devnet
   - Copy your API key from either:
     - The Devnet Stacks API URL: `https://api.platform.hiro.so/v1/ext/<YOUR-API-KEY>/stacks-blockchain-api`
     - Or from https://platform.hiro.so/settings/api-keys

2. **Configure Local Environment**

Install dependencies:

```bash
npm install
```

Create an `.env` file using the existing `.env.example` file:

```bash
cp front-end/.env.example front-end/.env
```

Add your Hiro Platform API key to the renamed `front-end/.env` file:

```bash
NEXT_PUBLIC_PLATFORM_HIRO_API_KEY=your-api-key-here
```

3. **Start the Frontend Application**

Start the Next.js application from the front-end directory.

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view and interact with the marketplace. If Devnet is running, your test wallets will already be funded and connected for testing.

## Customization

To customize this app for your fundraiser, edit the files `front-end/src/constants/campaign.ts` and `front-end/public/campaign-details.md`. Add images for the carousel to the `front-end/public/campaign` folder.

## About the Smart Contracts

This app is built with two Clarity contracts that work together:

### `fundraising.clar`

Handles the core campaign logic.

- Allows the contract owner to initialize the campaign with a fundraising goal in USD
- Accepts donations in STX or sBTC
- Tracks individual contributions
- Allows refunds to donors if the goal isn't hit after 30 days
- Lets the beneficiary (contract owner) withdraw the raised funds if the goal is hit

### `price-feed.clar`

A basic price oracle.

- Stores current prices for STX and sBTC in USD
- Lets an authorized address update prices
- Errors if prices get too stale (>24h old)

The fundraising contract uses the price feed to convert crypto donations into USD value to check if campaigns hit their goals. A script calling `price-feed.clar` needs to be called regularly to keep the prices updated.

## Testing with Devnet

The Hiro Platform's Devnet is a sandboxed, personal blockchain environment for testing your dApps before deploying them to the testnet or mainnet. Each time you start a new Devnet, it will reset the blockchain state and deploy your project contracts from scratch.

This is useful because deployments to the blockchain are permanent and cannot be undone. Ensure you have tested your contracts thoroughly in your Devnet before promoting them to Testnet or Mainnet!

### 1. Start Devnet and Deploy Contracts

1. Open your project in the Hiro Platform
2. Click "Start Devnet" to initialize your testing environment (the contracts will be automatically deployed per your deployment plan)
3. You should see your contracts deployed and the initial NFT mints occur no later than block 45 in the Devnet dashboard

### 2. Testing Smart Contract Functions

Smart contract functions can be tested directly from your Platform dashboard.

1. Select the Devnet tab to confirm that your contracts are deployed and Devnet is running
2. Click "Interact with Devnet" and then "Call functions"
3. Select your contract and the function you want to test from the dropdown menus
4. Use one of the pre-funded devnet wallets as the caller and another as the recipient (if needed)
5. Click "Call function" to execute the function, which will either succeed or fail based on the function's logic and the caller's permissions
6. Once the function has been submitted, you can watch for the transaction to resolve on-chain in the Devnet dashboard and confirm that the function executed as expected

Remember that any changes to the contracts will require restarting Devnet and redeploying the contracts!

### 3. NFT Marketplace Integration Testing

With Devnet running, you can test your front-end functionality and validate that it's working in the same way you just tested the NFT contract functions.

1. Confirm that your Devnet is running in the Platform dashboard and `npm run dev` is running in the front-end directory
2. Navigate to [http://localhost:3000](http://localhost:3000) to view and interact with the marketplace
3. View your NFTs in the marketplace and test the minting, listing, and purchasing functionality using the pre-funded wallets.
4. Navigate to the Devnet dashboard in the Platform to view the transactions as they are submitted and resolved on-chain.

You do not need to restart Devnet to test changes to your front-end.

## Next Steps

Once you've thoroughly tested your dApp in Devnet and are confident in its functionality, you can proceed to testing on the Stacks Testnet before launching on Mainnet.

### Moving to Testnet

1. Use the [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet) to get test STX tokens
2. Update the environment variables in your `.env` file to add values for `NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS` and `NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS`. Add the STX wallet address you plan to deploy the contract with.
3. Deploy your contracts to the Testnet using the Platform dashboard and your same deployment plan
4. Test your application with real network conditions and transaction times
5. Verify your contract interactions in the [Testnet Explorer](https://explorer.hiro.so/?chain=testnet)

### Launching on Mainnet

When you're ready to launch your NFT marketplace officially:

1. Ensure you have real STX tokens for deployment and transaction costs
2. Update your deployment configuration to target Mainnet
3. Deploy your contracts through the Platform dashboard
4. Update your frontend environment variables to point to Mainnet
5. Launch your application and begin processing real transactions!

Remember: Mainnet deployments are permanent and involve real cryptocurrency transactions. Double-check all contract code and frontend integrations before deploying to Mainnet.
