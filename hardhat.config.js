require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Ethereum networks using public RPCs
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [PRIVATE_KEY]
    },
    goerli: {
      url: "https://rpc.goerli.mudit.blog",
      accounts: [PRIVATE_KEY]
    },
    mainnet: {
      url: "https://ethereum.publicnode.com",
      accounts: [PRIVATE_KEY]
    },
    // Base networks
    "base-mainnet": {
      url: "https://mainnet.base.org",
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
      chainId: 8453,
      verify: {
        etherscan: {
          apiKey: BASESCAN_API_KEY,
          apiUrl: "https://api.basescan.org"
        }
      }
    },
    "base-sepolia": {
      url: "https://sepolia.base.org",
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
      chainId: 84532,
      verify: {
        etherscan: {
          apiKey: BASESCAN_API_KEY,
          apiUrl: "https://api-sepolia.basescan.org"
        }
      }
    }
  },
  etherscan: {
    apiKey: {
      // For Ethereum networks
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      goerli: ETHERSCAN_API_KEY,
      // For Base networks
      "base-mainnet": BASESCAN_API_KEY,
      "base-sepolia": BASESCAN_API_KEY
    },
    customChains: [
      {
        network: "base-mainnet",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};