# KINGS OF ART - NFT Minting Platform

```
 _   ________  ___________   ____  ______      _____  ______  _____ 
| | / /_   _ \| ___ \ ___ \ / __ \|  ____|    /\   |  __  \|  ____|/ ____|
| |/ /  | | | | |_/ / |_/ /| |  | | |__      /  \  | |__) | |__  | (___  
|    \  | | | |    /|  __/ | |  | |  __|    / /\ \ |  ___/|  __|  \___ \ 
| |\  \ | |/ /| |\ \| |    | |__| | |      / ____ \| |    | |____ ____) |
\_| \_/ |___/ \_| \_\_|     \____/|_|     /_/    \_\_|    |______|_____/
```

A gas-optimized NFT minting platform focused on creating NFT editions on the Base network.

## Features

- **ERC-1155 Standard**: Create multiple copies of the same NFT in a single transaction
- **Gas Optimized**: Designed for efficient minting of large NFT collections
- **Base Network Support**: Deploy on Base mainnet or Base Sepolia testnet
- **Batch Minting**: Create multiple different NFT editions in one transaction
- **Metadata Storage**: Automatic IPFS storage via Pinata
- **On-chain Metadata**: Optional prompt data stored directly on-chain
- **Contract Verification**: Easy verification on BaseScan

## Technical Overview

This project implements an ERC-1155 smart contract that allows for the creation of NFT editions - collections where multiple copies of the same NFT can exist. The implementation is highly optimized for gas efficiency on the Base network.

### Contract Architecture

The `PromptNFTEditions` contract provides:
- Creation of NFT editions with specified quantities
- Storage of metadata URIs on-chain
- Optional storage of prompt data associated with each edition
- Batch creation functionality for multiple editions

### Gas Optimizations

- Uses smaller data types (uint32) for token IDs
- Implements batch minting capabilities
- Uses calldata instead of memory for string parameters
- Optimized storage patterns

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- A wallet with ETH on Base network
- Pinata API keys for IPFS storage

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/m4rrk0121/prompt-nft-minter.git
   cd prompt-nft-minter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.template .env
   # Edit .env with your private key and API keys
   ```

## Usage

### Deploying the Contract

Deploy to Base mainnet:
```bash
npm run deploy:base
```

Deploy to Base Sepolia testnet:
```bash
npm run deploy:base-sepolia
```

### Minting NFT Editions

To mint a new NFT edition:
```bash
npx hardhat run scripts/mint-editions.js --network base-mainnet
```

You will be prompted for:
- Contract address
- Path to image file
- NFT name and description
- Edition size (number of copies)
- Recipient address

### Batch Minting

For creating multiple editions in one transaction:
```bash
npx hardhat run scripts/mint-editions-batch.js --network base-mainnet
```

### Verifying the Contract

```bash
npx hardhat verify --network base-mainnet CONTRACT_ADDRESS
```

## Example Workflow

1. Deploy the contract to Base
2. Upload your image for the NFT
3. Mint an edition of 100 copies
4. View your NFTs on OpenSea or another marketplace

## Viewing Your NFTs

After minting, your NFTs can be viewed on:
- [OpenSea](https://opensea.io/assets/base/YOUR_CONTRACT_ADDRESS/TOKEN_ID)
- [Zora](https://zora.co/collect/base:YOUR_CONTRACT_ADDRESS/TOKEN_ID)
- Other Base-compatible marketplaces

## Gas Costs

Typical gas costs on Base network:
- Contract deployment: ~$1-2
- Minting a single edition (100 copies): ~$0.25-0.30
- Batch minting multiple editions: ~$0.15-0.20 per edition

## Advanced Configuration

### Contract Settings

The contract is optimized for collections up to 100,000 NFTs. If you need more, adjust the data types in the contract.

### Custom Metadata

To customize the metadata structure, modify the `createAndUploadMetadata` function in the minting scripts.

## Troubleshooting

### Common Issues

- **Insufficient funds**: Ensure your wallet has enough ETH on Base
- **Contract verification fails**: Make sure BaseScan API key is correct
- **Image upload fails**: Check Pinata API keys and image file format

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenZeppelin for secure contract templates
- Base network for low gas fees
- Pinata for IPFS storage
