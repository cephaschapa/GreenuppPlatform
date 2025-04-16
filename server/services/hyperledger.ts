import { nanoid } from 'nanoid';
import crypto from 'crypto';

/**
 * Service for interacting with Hyperledger Fabric blockchain
 * 
 * Note: This is a simulated implementation for development.
 * In a production environment, this would connect to an actual Hyperledger Fabric network.
 */
export class HyperledgerService {
  private readonly networkId = 'greenupp-croptrace-network';
  private readonly channelName = 'croptrace-channel';
  private readonly chaincodeName = 'croptrace-chaincode';
  
  // In-memory storage for transaction simulations
  private transactions: Map<string, {
    txHash: string,
    timestamp: Date,
    data: any
  }> = new Map();
  
  // In-memory storage for crop batches
  private cropBatches: Map<string, {
    cropId: number,
    batchId: string,
    txId: string,
    createdAt: Date,
    events: Array<{
      txId: string,
      eventType: string,
      timestamp: Date,
      data: any
    }>
  }> = new Map();
  
  /**
   * Generates a unique transaction ID for blockchain operations
   */
  private generateTxId(): string {
    return `tx_${nanoid(16)}`;
  }
  
  /**
   * Generates a secure hash of data for blockchain storage
   * @param data The data to hash
   */
  private generateHash(data: any): string {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto.createHash('sha256').update(stringData).digest('hex');
  }
  
  /**
   * Records a crop event on the blockchain
   * @param cropId ID of the crop
   * @param eventType Type of event (planting, harvesting, etc)
   * @param eventData Event details
   * @param userId User who performed the action
   */
  async recordCropEvent(cropId: number, eventType: string, eventData: any, userId: number): Promise<{
    txId: string,
    txHash: string
  }> {
    // Create transaction data
    const txData = {
      cropId,
      eventType,
      eventData,
      userId,
      timestamp: new Date().toISOString()
    };
    
    // Generate transaction ID and hash
    const txId = this.generateTxId();
    const txHash = this.generateHash(txData);
    
    // Store transaction (simulating blockchain)
    this.transactions.set(txId, {
      txHash,
      timestamp: new Date(),
      data: txData
    });
    
    // If this crop has a batch, add the event to the batch history
    for (const [batchId, batchData] of this.cropBatches.entries()) {
      if (batchData.cropId === cropId) {
        batchData.events.push({
          txId,
          eventType,
          timestamp: new Date(),
          data: eventData
        });
        this.cropBatches.set(batchId, batchData);
        break;
      }
    }
    
    // Simulate blockchain network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      txId,
      txHash
    };
  }
  
  /**
   * Verifies a transaction on the blockchain
   * @param txId Transaction ID to verify
   * @param txHash Transaction hash to verify against
   */
  async verifyTransaction(txId: string, txHash: string): Promise<boolean> {
    // Retrieve transaction
    const transaction = this.transactions.get(txId);
    
    if (!transaction) {
      return false;
    }
    
    // Verify hash
    return transaction.txHash === txHash;
  }
  
  /**
   * Creates a crop batch on the blockchain
   * @param cropId ID of the crop
   * @param batchId Batch identifier
   * @param cropData Crop metadata
   */
  async createCropBatch(cropId: number, batchId: string, cropData: any): Promise<{
    txId: string,
    txHash: string
  }> {
    // Create transaction data
    const txData = {
      cropId,
      batchId,
      cropData,
      action: 'create_batch',
      timestamp: new Date().toISOString()
    };
    
    // Generate transaction ID and hash
    const txId = this.generateTxId();
    const txHash = this.generateHash(txData);
    
    // Store transaction (simulating blockchain)
    this.transactions.set(txId, {
      txHash,
      timestamp: new Date(),
      data: txData
    });
    
    // Create a new batch record
    this.cropBatches.set(batchId, {
      cropId,
      batchId,
      txId,
      createdAt: new Date(),
      events: []
    });
    
    // Simulate blockchain network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      txId,
      txHash
    };
  }
  
  /**
   * Links a marketplace listing to a crop on the blockchain
   * @param listingId ID of the marketplace listing
   * @param cropId ID of the source crop
   * @param batchId Batch identifier
   */
  async linkListingToCrop(listingId: number, cropId: number, batchId: string): Promise<{
    txId: string,
    txHash: string
  }> {
    // Create transaction data
    const txData = {
      listingId,
      cropId,
      batchId,
      action: 'link_listing',
      timestamp: new Date().toISOString()
    };
    
    // Generate transaction ID and hash
    const txId = this.generateTxId();
    const txHash = this.generateHash(txData);
    
    // Store transaction (simulating blockchain)
    this.transactions.set(txId, {
      txHash,
      timestamp: new Date(),
      data: txData
    });
    
    // Add this as an event to the batch record
    const batchData = this.cropBatches.get(batchId);
    if (batchData) {
      batchData.events.push({
        txId,
        eventType: 'marketplace_listing',
        timestamp: new Date(),
        data: { listingId }
      });
      this.cropBatches.set(batchId, batchData);
    }
    
    // Simulate blockchain network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      txId,
      txHash
    };
  }
  
  /**
   * Gets the complete history of a crop from the blockchain
   * @param cropId ID of the crop
   * @param batchId Optional batch ID
   */
  async getCropHistory(cropId: number, batchId?: string): Promise<any[]> {
    // If a batch ID is provided, retrieve that specific batch's history
    if (batchId) {
      const batchData = this.cropBatches.get(batchId);
      if (batchData && batchData.cropId === cropId) {
        return [
          {
            txId: batchData.txId,
            action: 'create_batch',
            timestamp: batchData.createdAt.toISOString(),
            data: { batchId, cropId }
          },
          ...batchData.events.map(event => ({
            txId: event.txId,
            action: event.eventType,
            timestamp: event.timestamp.toISOString(),
            data: event.data
          }))
        ];
      }
    }
    
    // Otherwise, find all batches related to this crop
    const history: any[] = [];
    for (const [id, batchData] of this.cropBatches.entries()) {
      if (batchData.cropId === cropId) {
        history.push({
          txId: batchData.txId,
          action: 'create_batch',
          timestamp: batchData.createdAt.toISOString(),
          data: { batchId: id, cropId }
        });
        
        history.push(
          ...batchData.events.map(event => ({
            txId: event.txId,
            action: event.eventType,
            timestamp: event.timestamp.toISOString(),
            data: event.data
          }))
        );
      }
    }
    
    // Sort by timestamp
    return history.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }
  
  /**
   * Generates a QR code with blockchain verification data
   * @param cropId ID of the crop
   * @param batchId Batch identifier
   */
  generateTraceabilityQrData(cropId: number, batchId: string): string {
    // Generate verification URL with embedded data
    const verificationData = {
      c: cropId,
      b: batchId,
      v: 1, // version
      t: Date.now()
    };
    
    return JSON.stringify(verificationData);
  }
}

export const hyperledgerService = new HyperledgerService();