const { ethers } = require("ethers");

console.log("\n🔐 Generating New Wallet for Blockchain...\n");

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📝 Wallet Address:", wallet.address);
console.log("🔑 Private Key:", wallet.privateKey);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("💾 Seed Phrase (SAVE THIS SECURELY!):");
console.log(wallet.mnemonic.phrase);
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

console.log("📋 Next Steps:");
console.log("1. SAVE the seed phrase above in a secure location");
console.log("2. Add private key to .env:");
console.log(`   BLOCKCHAIN_PRIVATE_KEY=${wallet.privateKey}`);
console.log("3. Get testnet MATIC:");
console.log(`   Visit: https://faucet.polygon.technology/`);
console.log(`   Enter address: ${wallet.address}`);
console.log("4. Deploy contract:");
console.log(`   npx hardhat run scripts/deploy.cjs --network mumbai\n`);

console.log("⚠️  WARNING:");
console.log("   - NEVER share your private key or seed phrase");
console.log("   - NEVER commit .env to git");
console.log("   - Keep seed phrase backed up offline\n");

