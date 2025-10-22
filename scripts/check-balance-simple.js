import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const rpcUrl =
    process.env.BLOCKCHAIN_RPC_URL || "https://rpc-amoy.polygon.technology";
  const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

  if (!privateKey) {
    console.error("\n❌ BLOCKCHAIN_PRIVATE_KEY not set in .env\n");
    console.log("Add this to your .env file:");
    console.log(
      "BLOCKCHAIN_PRIVATE_KEY=0xf2714904fa78ee91ebe8b2399ded2bb079535117270201717ff2d22b9d728a7a\n"
    );
    process.exit(1);
  }

  console.log("\n💰 Checking Wallet Balance...\n");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Address:", wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const formattedBalance = ethers.formatEther(balance);

  console.log("💵 Balance:", formattedBalance, "POL");
  console.log("🌐 Network: Polygon Amoy Testnet (new testnet)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (balance === 0n) {
    console.log("❌ No POL tokens! Get some from the faucet:");
    console.log("   https://faucet.polygon.technology/");
    console.log(`   Enter your address: ${wallet.address}`);
    console.log("   Select: Polygon Amoy (NOT Mumbai - it's deprecated)\n");
  } else {
    console.log("✅ You have POL! Ready to deploy.\n");
    console.log("Run: node scripts/compile-and-deploy.js\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
