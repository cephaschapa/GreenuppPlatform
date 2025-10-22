const hre = require("hardhat");

async function main() {
  const [account] = await hre.ethers.getSigners();

  console.log("\n💰 Checking Wallet Balance...\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 Address:", account.address);

  const balance = await hre.ethers.provider.getBalance(account.address);
  const formattedBalance = hre.ethers.formatEther(balance);

  console.log("💵 Balance:", formattedBalance, "MATIC");
  console.log("🌐 Network:", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (balance === 0n) {
    console.log("❌ No MATIC! Get some from the faucet:");
    console.log("   https://faucet.polygon.technology/");
    console.log(`   Enter your address: ${account.address}\n`);
  } else {
    console.log("✅ You have MATIC! Ready to deploy.\n");
    console.log("Run: npx hardhat run scripts/deploy.cjs --network mumbai\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

