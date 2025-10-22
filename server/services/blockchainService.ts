/**
 * Real Blockchain Service - Polygon/Ethereum Integration
 * Replaces the mock Hyperledger service with actual blockchain transactions
 */

import { ethers } from "ethers";
import { logger } from "../lib/logger.js";

// Smart contract ABI (Application Binary Interface)
const CROP_TRACEABILITY_ABI = [
  "function registerCrop(uint256 _cropId, string memory _batchId, string memory _initialData) public returns (bool)",
  "function recordEvent(string memory _batchId, string memory _eventType, string memory _eventData, string memory _location) public returns (bool)",
  "function getCropRecord(string memory _batchId) public view returns (uint256 cropId, address farmer, uint256 createdAt, uint256 eventCount)",
  "function getCropEvents(string memory _batchId) public view returns (tuple(uint256 cropId, string batchId, string eventType, string eventData, address farmer, uint256 timestamp, string location)[])",
  "function getEventCount(string memory _batchId) public view returns (uint256)",
  "function batchExists(string memory _batchId) public view returns (bool)",
  "function verifyCropOwner(string memory _batchId, address _address) public view returns (bool)",
  "event CropRegistered(string indexed batchId, uint256 cropId, address indexed farmer, uint256 timestamp)",
  "event CropEventRecorded(string indexed batchId, string eventType, address indexed farmer, uint256 timestamp)",
];

export interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  chainId: number;
  enabled: boolean;
}

export interface CropEventData {
  eventType: string;
  cropId: number;
  batchId: string;
  eventData: any;
  location?: string;
}

export interface BlockchainTransactionResult {
  txId: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  gasUsed: string;
  success: boolean;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private config: BlockchainConfig;
  private enabled: boolean = false;

  constructor() {
    this.config = this.loadConfig();
    this.initialize();
  }

  /**
   * Load blockchain configuration from environment variables
   */
  private loadConfig(): BlockchainConfig {
    const config: BlockchainConfig = {
      // Polygon Mumbai Testnet by default
      rpcUrl:
        process.env.BLOCKCHAIN_RPC_URL || "https://rpc-mumbai.maticvigil.com", // Free Polygon testnet RPC
      contractAddress:
        process.env.BLOCKCHAIN_CONTRACT_ADDRESS ||
        "0x0000000000000000000000000000000000000000", // Deploy and set this
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || "",
      chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || "80001"), // 80001 = Polygon Mumbai, 137 = Polygon Mainnet
      enabled: process.env.BLOCKCHAIN_ENABLED === "true",
    };

    return config;
  }

  /**
   * Initialize blockchain connection
   */
  private async initialize() {
    try {
      if (!this.config.enabled) {
        logger.info(
          "Blockchain service is disabled. Using database-only mode."
        );
        return;
      }

      if (!this.config.privateKey) {
        logger.warn(
          "⚠️ BLOCKCHAIN_PRIVATE_KEY not set. Blockchain transactions disabled."
        );
        return;
      }

      if (
        !this.config.contractAddress ||
        this.config.contractAddress ===
          "0x0000000000000000000000000000000000000000"
      ) {
        logger.warn(
          "⚠️ BLOCKCHAIN_CONTRACT_ADDRESS not set. Deploy smart contract first."
        );
        return;
      }

      // Connect to blockchain
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);

      // Create wallet
      this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);

      // Connect to contract
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        CROP_TRACEABILITY_ABI,
        this.wallet
      );

      // Test connection
      const network = await this.provider.getNetwork();
      logger.info(
        `✅ Connected to blockchain: ${network.name} (Chain ID: ${network.chainId})`
      );
      logger.info(`📝 Contract address: ${this.config.contractAddress}`);
      logger.info(`💼 Wallet address: ${this.wallet.address}`);

      this.enabled = true;
    } catch (error) {
      logger.error("Failed to initialize blockchain service:", error);
      logger.warn("Falling back to database-only mode");
      this.enabled = false;
    }
  }

  /**
   * Check if blockchain service is enabled and ready
   */
  isEnabled(): boolean {
    return this.enabled && this.contract !== null && this.wallet !== null;
  }

  /**
   * Register a new crop on the blockchain
   */
  async registerCrop(
    cropId: number,
    batchId: string,
    initialData: any
  ): Promise<BlockchainTransactionResult> {
    if (!this.isEnabled()) {
      logger.info("Blockchain disabled, skipping crop registration");
      return this.createMockTransaction();
    }

    try {
      logger.info(
        `Registering crop on blockchain: Crop ${cropId}, Batch ${batchId}`
      );

      const dataString = JSON.stringify(initialData);

      // Send transaction
      const tx = await this.contract!.registerCrop(cropId, batchId, dataString);

      logger.info(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      logger.info(
        `✅ Crop registered on blockchain! Block: ${receipt.blockNumber}`
      );

      return {
        txId: tx.hash,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        gasUsed: receipt.gasUsed.toString(),
        success: true,
      };
    } catch (error) {
      logger.error("Failed to register crop on blockchain:", error);
      throw new Error(
        `Blockchain registration failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Record a crop event on the blockchain
   */
  async recordCropEvent(
    batchId: string,
    eventType: string,
    eventData: any,
    location?: string
  ): Promise<BlockchainTransactionResult> {
    if (!this.isEnabled()) {
      logger.info("Blockchain disabled, skipping event recording");
      return this.createMockTransaction();
    }

    try {
      logger.info(
        `Recording event on blockchain: Batch ${batchId}, Type ${eventType}`
      );

      const dataString = JSON.stringify(eventData);
      const locationString = location || "";

      // Send transaction
      const tx = await this.contract!.recordEvent(
        batchId,
        eventType,
        dataString,
        locationString
      );

      logger.info(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();

      logger.info(
        `✅ Event recorded on blockchain! Block: ${receipt.blockNumber}`
      );

      return {
        txId: tx.hash,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
        gasUsed: receipt.gasUsed.toString(),
        success: true,
      };
    } catch (error) {
      logger.error("Failed to record event on blockchain:", error);
      throw new Error(
        `Blockchain event recording failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get crop history from blockchain
   */
  async getCropHistory(batchId: string): Promise<any[]> {
    if (!this.isEnabled()) {
      logger.info("Blockchain disabled, returning empty history");
      return [];
    }

    try {
      logger.info(`Fetching crop history from blockchain: ${batchId}`);

      // Check if batch exists
      const exists = await this.contract!.batchExists(batchId);
      if (!exists) {
        logger.warn(`Batch ${batchId} not found on blockchain`);
        return [];
      }

      // Get all events
      const events = await this.contract!.getCropEvents(batchId);

      logger.info(`Retrieved ${events.length} events from blockchain`);

      // Parse events
      return events.map((event: any) => ({
        cropId: Number(event.cropId),
        batchId: event.batchId,
        eventType: event.eventType,
        eventData: this.tryParseJSON(event.eventData),
        farmer: event.farmer,
        timestamp: Number(event.timestamp),
        location: event.location,
      }));
    } catch (error) {
      logger.error("Failed to get crop history from blockchain:", error);
      return [];
    }
  }

  /**
   * Verify a transaction on the blockchain
   */
  async verifyTransaction(txHash: string): Promise<boolean> {
    if (!this.isEnabled() || !this.provider) {
      return false;
    }

    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      logger.error("Failed to verify transaction:", error);
      return false;
    }
  }

  /**
   * Get blockchain transaction details
   */
  async getTransaction(txHash: string): Promise<any> {
    if (!this.isEnabled() || !this.provider) {
      return null;
    }

    try {
      const [tx, receipt] = await Promise.all([
        this.provider.getTransaction(txHash),
        this.provider.getTransactionReceipt(txHash),
      ]);

      return {
        hash: tx?.hash,
        from: tx?.from,
        to: tx?.to,
        value: tx?.value?.toString(),
        gasUsed: receipt?.gasUsed?.toString(),
        blockNumber: receipt?.blockNumber,
        status: receipt?.status === 1 ? "success" : "failed",
        timestamp: tx?.timestamp,
      };
    } catch (error) {
      logger.error("Failed to get transaction details:", error);
      return null;
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(): Promise<string> {
    if (!this.isEnabled() || !this.provider || !this.wallet) {
      return "0";
    }

    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error("Failed to get wallet balance:", error);
      return "0";
    }
  }

  /**
   * Get estimated gas cost for transaction
   */
  async estimateGasCost(
    operation: "register" | "record",
    params: any
  ): Promise<string> {
    if (!this.isEnabled() || !this.contract) {
      return "0";
    }

    try {
      let gasEstimate;
      if (operation === "register") {
        gasEstimate = await this.contract.registerCrop.estimateGas(
          params.cropId,
          params.batchId,
          JSON.stringify(params.data)
        );
      } else {
        gasEstimate = await this.contract.recordEvent.estimateGas(
          params.batchId,
          params.eventType,
          JSON.stringify(params.data),
          params.location || ""
        );
      }

      const gasPrice = await this.provider!.getFeeData();
      const cost = gasEstimate * (gasPrice.gasPrice || BigInt(0));

      return ethers.formatEther(cost);
    } catch (error) {
      logger.error("Failed to estimate gas cost:", error);
      return "0";
    }
  }

  /**
   * Helper: Create mock transaction for disabled blockchain
   */
  private createMockTransaction(): BlockchainTransactionResult {
    return {
      txId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: 0,
      timestamp: Date.now(),
      gasUsed: "0",
      success: true,
    };
  }

  /**
   * Helper: Try to parse JSON, return original if fails
   */
  private tryParseJSON(str: string): any {
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  }

  /**
   * Get blockchain network info
   */
  async getNetworkInfo() {
    if (!this.isEnabled() || !this.provider) {
      return {
        enabled: false,
        network: "disabled",
        chainId: 0,
      };
    }

    try {
      const network = await this.provider.getNetwork();
      const balance = await this.getWalletBalance();

      return {
        enabled: true,
        network: network.name,
        chainId: Number(network.chainId),
        contractAddress: this.config.contractAddress,
        walletAddress: this.wallet?.address,
        walletBalance: balance,
      };
    } catch (error) {
      logger.error("Failed to get network info:", error);
      return {
        enabled: false,
        network: "error",
        chainId: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
