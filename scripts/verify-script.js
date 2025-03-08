const hre = require("hardhat");
const fs = require("fs");

async function main() {
  try {
    console.log("Starting contract verification process...");
    
    // Load the deployment info, if available
    let contractAddress;
    let contractName;
    
    try {
      if (fs.existsSync("editions-contract-deployment.json")) {
        const deploymentInfo = JSON.parse(fs.readFileSync("editions-contract-deployment.json", "utf8"));
        contractAddress = deploymentInfo.contractAddress;
        contractName = deploymentInfo.contractName;
        console.log(`Loaded deployment info from file: ${contractName} at ${contractAddress}`);
      }
    } catch (error) {
      console.log("Could not load deployment info from file:", error.message);
    }
    
    // If address was not loaded from file, prompt for it
    if (!contractAddress) {
      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      contractAddress = await new Promise(resolve => {
        readline.question("Enter contract address to verify: ", (address) => {
          readline.close();
          resolve(address);
        });
      });
      
      if (!contractAddress) {
        throw new Error("Contract address is required");
      }
    }
    
    if (!contractName) {
      contractName = "PromptNFTEditions"; // Default to PromptNFTEditions
      console.log(`Using default contract name: ${contractName}`);
    }
    
    console.log(`Verifying ${contractName} at address ${contractAddress} on ${hre.network.name}...`);
    
    // No constructor arguments were used
    const constructorArguments = [];
    
    // Start verification
    await hre.run("verify:verify", {
      address: contractAddress,
      contract: `contracts/${contractName}.sol:${contractName}`,
      constructorArguments: constructorArguments,
    });
    
    console.log("Contract verification completed successfully!");
    
  } catch (error) {
    // Handle common verification errors
    if (error.message.includes("Already Verified")) {
      console.log("Contract is already verified on the blockchain explorer.");
    } else if (error.message.includes("Source code already verified")) {
      console.log("Contract is already verified on the blockchain explorer.");
    } else {
      console.error("Error during verification:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });