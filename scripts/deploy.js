const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  try {
    // Get available contract files
    const contractFiles = fs.readdirSync("./contracts");
    console.log("Available contracts:", contractFiles);
    
    // Find our contract file
    let contractName = "PromptNFT";
    if (!contractFiles.includes("PromptNFT.sol")) {
      // Try to find an alternative contract
      const promptNFTFiles = contractFiles.filter(file => 
        file.startsWith("PromptNFT") && file.endsWith(".sol")
      );
      
      if (promptNFTFiles.length === 0) {
        throw new Error("No PromptNFT contract found in contracts directory");
      }
      
      // Use the first matching contract
      contractName = promptNFTFiles[0].replace(".sol", "");
      console.log(`Using contract: ${contractName}`);
    }
    
    console.log(`Deploying the ${contractName} contract...`);
    const NFTContract = await ethers.getContractFactory(contractName);
    const nftContract = await NFTContract.deploy();
    await nftContract.waitForDeployment();
    
    const contractAddress = await nftContract.getAddress();
    console.log(`${contractName} contract deployed to:`, contractAddress);
    
    // Save deployment info to a file
    const deploymentInfo = {
      contractName,
      contractAddress,
      network: network.name,
      deploymentTime: new Date().toISOString()
    };
    
    fs.writeFileSync(
      "contract-deployment.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("Deployment info saved to contract-deployment.json");
    
    return contractAddress;
  } catch (error) {
    console.error("Error in the deployment process:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });