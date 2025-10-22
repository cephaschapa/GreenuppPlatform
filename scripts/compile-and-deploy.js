import { ethers } from "ethers";
import solc from "solc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("\n🚀 Deploying CropTraceability Smart Contract\n");

  // Read the contract source
  const contractPath = path.join(
    __dirname,
    "../contracts/CropTraceability.sol"
  );
  const source = fs.readFileSync(contractPath, "utf8");

  // Compile the contract
  console.log("⏳ Compiling contract...");
  const input = {
    language: "Solidity",
    sources: {
      "CropTraceability.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Check for errors
  if (output.errors) {
    const errors = output.errors.filter((error) => error.severity === "error");
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach((error) => console.error(error.formattedMessage));
      process.exit(1);
    }
  }

  const contract = output.contracts["CropTraceability.sol"]["CropTraceability"];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  console.log("✅ Contract compiled successfully!\n");

  // Setup blockchain connection
  // Polygon Amoy Testnet (Mumbai is deprecated)
  const rpcUrl =
    process.env.BLOCKCHAIN_RPC_URL || "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ Error: BLOCKCHAIN_PRIVATE_KEY not set in .env");
    console.log("\nAdd this to your .env file:");
    console.log(
      "BLOCKCHAIN_PRIVATE_KEY=0xf2714904fa78ee91ebe8b2399ded2bb079535117270201717ff2d22b9d728a7a"
    );
    process.exit(1);
  }

  console.log("🔌 Connecting to Polygon Amoy testnet...");
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("📝 Deployer address:", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const formattedBalance = ethers.formatEther(balance);
  console.log("💰 Wallet balance:", formattedBalance, "POL\n");

  if (balance === 0n) {
    console.error("❌ Error: Wallet has no POL tokens!");
    console.log("\n📌 To get free testnet POL:");
    console.log("   1. Visit: https://faucet.polygon.technology/");
    console.log("   2. Select 'Polygon Amoy' (NOT Mumbai - it's deprecated)");
    console.log("   3. Enter your address:", wallet.address);
    console.log("   4. Wait 1-2 minutes\n");
    process.exit(1);
  }

  // Deploy the contract
  console.log("⏳ Deploying contract to blockchain...");
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const deployment = await factory.deploy();

  console.log("📨 Transaction sent:", deployment.deploymentTransaction().hash);
  console.log("⏳ Waiting for confirmation...");

  await deployment.waitForDeployment();
  const contractAddress = await deployment.getAddress();

  console.log("\n✅ Contract deployed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Contract Address:", contractAddress);
  console.log("🌐 Network: Polygon Mumbai Testnet");
  console.log("⛓️  Chain ID: 80001");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🔍 View on PolygonScan:");
  console.log(`   https://amoy.polygonscan.com/address/${contractAddress}\n`);

  console.log("📋 Next Steps:");
  console.log("1. Add to your .env file:");
  console.log(`   BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Set BLOCKCHAIN_ENABLED=true in .env");
  console.log("3. Restart your server");
  console.log("4. Create a crop to test blockchain!\n");

  // Save deployment info
  const network = await provider.getNetwork();
  const deploymentInfo = {
    contractAddress,
    deployer: wallet.address,
    network: network.name || "amoy",
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    transactionHash: deployment.deploymentTransaction().hash,
  };

  fs.writeFileSync(
    path.join(__dirname, "../.blockchain-deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to .blockchain-deployment.json\n");
  console.log("🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
