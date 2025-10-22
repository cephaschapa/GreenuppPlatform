const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CropTraceability smart contract...\n");

  // Get the deployer's account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(
    "💰 Account balance:",
    hre.ethers.formatEther(balance),
    "MATIC\n"
  );

  if (balance === 0n) {
    console.error("❌ Error: Account has no MATIC!");
    console.log("\n📌 To get testnet MATIC:");
    console.log("   1. Visit: https://faucet.polygon.technology/");
    console.log("   2. Enter your wallet address:", deployer.address);
    console.log("   3. Wait 1-2 minutes\n");
    process.exit(1);
  }

  // Deploy the contract
  console.log("⏳ Deploying contract...");
  const CropTraceability = await hre.ethers.getContractFactory(
    "CropTraceability"
  );
  const contract = await CropTraceability.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Contract Address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("⛓️  Chain ID:", hre.network.config.chainId);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // View on block explorer
  if (hre.network.name === "mumbai") {
    console.log(
      "🔍 View on PolygonScan:",
      `https://mumbai.polygonscan.com/address/${contractAddress}`
    );
  } else if (hre.network.name === "polygon") {
    console.log(
      "🔍 View on PolygonScan:",
      `https://polygonscan.com/address/${contractAddress}`
    );
  }

  console.log("\n📋 Next Steps:");
  console.log("1. Add this to your .env file:");
  console.log(`   BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Restart your server");
  console.log("3. Test by creating a crop\n");

  // Wait for a few block confirmations
  console.log("⏳ Waiting for 5 block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Contract confirmed on blockchain!\n");

  // Optionally verify on Etherscan/PolygonScan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("🔍 Verifying contract on PolygonScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!\n");
    } catch (error) {
      console.log("⚠️  Verification failed (this is optional):", error.message);
    }
  }

  console.log("🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

