const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");

// Pinata API configuration
const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const pinataJSONEndpoint = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

// Create readline interface for prompting user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompts the user for input
 * @param {string} question The question to ask
 * @returns {Promise<string>} The user's answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Uploads an image file to Pinata
 * @param {string} filePath The path to the image file
 * @returns {Promise<string>} The IPFS hash of the uploaded file
 */
async function uploadImageToPinata(filePath) {
  console.log("Uploading image to Pinata...");
  
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));
  
  try {
    const response = await axios.post(pinataEndpoint, data, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });
    
    console.log("Image uploaded successfully to Pinata!");
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
}

/**
 * Creates and uploads metadata to Pinata
 * @param {string} name The NFT name
 * @param {string} description The NFT description
 * @param {string} imageHash The IPFS hash of the uploaded image
 * @returns {Promise<string>} The IPFS hash of the uploaded metadata
 */
async function createAndUploadMetadata(name, description, imageHash) {
  console.log("Creating and uploading metadata to Pinata...");
  
  const metadata = {
    name: name,
    description: description,
    image: `ipfs://${imageHash}`,
    attributes: [
      {
        trait_type: "Creation Date",
        value: new Date().toISOString()
      }
    ]
  };
  
  try {
    const response = await axios.post(pinataJSONEndpoint, metadata, {
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });
    
    console.log("Metadata uploaded successfully to Pinata!");
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw error;
  }
}

/**
 * Main function to create an edition of NFTs
 */
async function main() {
  try {
    console.log("===== EDITIONS NFT MINTING TOOL =====");
    console.log("This tool creates editions (multiple copies) of an NFT using ERC-1155");
    
    // 1. Get information from the user
    const contractAddress = "0x07f6B926Ecb7cB8d2908928db7b66B53cEa7745B";
    const imagePath = await askQuestion("Enter the path to your image file: ");
    
    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      console.error(`Error: File not found at ${imagePath}`);
      process.exit(1);
    }
    
    const nftName = await askQuestion("Enter a name for your NFT: ");
    const nftDescription = await askQuestion("Enter a description for your NFT (optional): ");
    
    // Get edition size
    const editionSizeStr = await askQuestion("Enter edition size (number of copies to mint): ");
    const editionSize = parseInt(editionSizeStr);
    
    if (isNaN(editionSize) || editionSize <= 0) {
      console.error("Edition size must be a positive number");
      process.exit(1);
    }
    
    // Get recipient address or use signer's address
    let recipientAddress = await askQuestion("Enter the recipient address (leave blank to use your address): ");
    const signers = await ethers.getSigners();
    if (!recipientAddress.trim()) {
      recipientAddress = signers[0].address;
    }
    
    // Check signer's balance
    const balance = await ethers.provider.getBalance(signers[0].address);
    console.log(`\nYour wallet balance: ${ethers.formatEther(balance)} ETH`);
    
    console.log(`\nUsing image file: ${imagePath}`);
    console.log(`Edition size: ${editionSize}`);
    console.log(`Recipient address: ${recipientAddress}`);
    
    // 2. Connect to the contract
    console.log(`\nConnecting to contract at ${contractAddress}...`);
    try {
      const PromptNFTEditions = await ethers.getContractFactory("PromptNFTEditions");
      const editionsContract = PromptNFTEditions.attach(contractAddress);
      
      // Verify contract exists
      const code = await ethers.provider.getCode(contractAddress);
      if (code === '0x') {
        console.error(`Error: No contract found at address ${contractAddress}`);
        process.exit(1);
      }
      
      // Check if caller is owner (required for minting)
      try {
        const owner = await editionsContract.owner();
        console.log(`Contract owner: ${owner}`);
        if (owner.toLowerCase() !== signers[0].address.toLowerCase()) {
          console.error(`Error: You (${signers[0].address}) are not the owner of this contract (${owner}). Only the owner can mint NFTs.`);
          process.exit(1);
        }
      } catch (error) {
        console.error(`Error checking contract ownership: ${error.message}`);
        process.exit(1);
      }
      
      console.log("Successfully connected to contract");
      
      // 3. Upload the image to Pinata
      const imageHash = await uploadImageToPinata(imagePath);
      console.log("Image IPFS hash:", imageHash);
      
      // 4. Create and upload metadata to Pinata
      const metadataHash = await createAndUploadMetadata(nftName, nftDescription, imageHash);
      console.log("Metadata IPFS hash:", metadataHash);
      
      // 5. Create the edition of NFTs
      console.log(`\nCreating edition of ${editionSize} NFTs...`);
      const tokenURI = `ipfs://${metadataHash}`;
      
      // Using an empty prompt value since we're removing prompt tracking
      const emptyPrompt = "";
      
      // Estimate gas
      try {
        const gasEstimate = await editionsContract.createEdition.estimateGas(
          recipientAddress, 
          editionSize,
          tokenURI, 
          emptyPrompt
        );
        console.log(`Estimated gas: ${gasEstimate.toString()}`);
      } catch (error) {
        console.error(`Error estimating gas: ${error.message}`);
        const proceed = await askQuestion("Continue anyway? (y/n): ");
        if (proceed.toLowerCase() !== 'y') {
          process.exit(0);
        }
      }
      
      console.log("Creating NFT edition...");
      const createTx = await editionsContract.createEdition(
        recipientAddress, 
        editionSize,
        tokenURI, 
        emptyPrompt
      );
      
      console.log(`Transaction hash: ${createTx.hash}`);
      console.log("Waiting for transaction confirmation...");
      
      const receipt = await createTx.wait();
      console.log("Transaction confirmed!");
      console.log(`Transaction status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);
      
      // 6. Get the token ID from the event
      let tokenId;
      for (const log of receipt.logs) {
        try {
          if (log.fragment?.name === 'EditionCreated') {
            tokenId = ethers.toNumber(log.args[0]);
            console.log(`Found EditionCreated event with token ID: ${tokenId}`);
            break;
          }
        } catch (error) {
          console.error(`Error parsing log: ${error.message}`);
        }
      }
      
      console.log("\n===== EDITION CREATED SUCCESSFULLY! =====");
      console.log(`- Edition Size: ${editionSize} copies`);
      console.log(`- Token ID: ${tokenId || 'unknown'}`);
      console.log(`- Contract Address: ${contractAddress}`);
      console.log(`- Owner: ${recipientAddress}`);
      console.log(`- Token URI: ${tokenURI}`);
      console.log(`- Image URL: https://gateway.pinata.cloud/ipfs/${imageHash}`);
      console.log(`- Metadata URL: https://gateway.pinata.cloud/ipfs/${metadataHash}`);
      
      // 7. Save minting info to a file
      const networkName = hre.network.name || 'unknown';
      const mintInfo = {
        contractAddress,
        owner: recipientAddress,
        tokenId: tokenId || 'unknown',
        tokenURI,
        imageIpfsHash: imageHash,
        metadataIpfsHash: metadataHash,
        name: nftName,
        description: nftDescription,
        originalImagePath: imagePath,
        imageUrl: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
        metadataUrl: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
        editionSize,
        mintTime: new Date().toISOString(),
        transactionHash: createTx.hash,
        blockNumber: receipt.blockNumber,
        network: networkName
      };
      
      const outputFile = `edition-nft-mint-${networkName}-${Date.now()}.json`;
      fs.writeFileSync(
        outputFile,
        JSON.stringify(mintInfo, null, 2)
      );
      
      console.log(`\nEdition info saved to ${outputFile}`);
      
      console.log("\nTo view your NFTs on OpenSea (if supported):");
      console.log(`https://opensea.io/assets/base/${contractAddress}/${tokenId || 0}`);
      
    } catch (error) {
      console.error(`Error in the NFT minting process: ${error.message}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`Fatal error in the NFT minting process: ${error.message}`);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });