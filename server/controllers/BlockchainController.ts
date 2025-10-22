import { Request, Response } from "express";
import { blockchainService } from "../services/blockchainService.js";
import { logger } from "../lib/logger.js";

export class BlockchainController {
  /**
   * Get blockchain network status and info
   */
  static async getStatus(req: Request, res: Response) {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      res.json(networkInfo);
    } catch (error) {
      logger.error("Error getting blockchain status:", error);
      res.status(500).json({
        enabled: false,
        error: "Failed to get blockchain status",
      });
    }
  }

  /**
   * Get transaction details by hash
   */
  static async getTransaction(req: Request, res: Response) {
    try {
      const { txHash } = req.params;

      if (!txHash) {
        return res.status(400).json({ message: "Transaction hash required" });
      }

      const transaction = await blockchainService.getTransaction(txHash);

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      logger.error("Error getting transaction:", error);
      res.status(500).json({ message: "Failed to get transaction details" });
    }
  }

  /**
   * Verify a transaction on blockchain
   */
  static async verifyTransaction(req: Request, res: Response) {
    try {
      const { txHash } = req.params;

      if (!txHash) {
        return res.status(400).json({ message: "Transaction hash required" });
      }

      const isVerified = await blockchainService.verifyTransaction(txHash);

      res.json({
        txHash,
        verified: isVerified,
        status: isVerified ? "confirmed" : "not found or failed",
      });
    } catch (error) {
      logger.error("Error verifying transaction:", error);
      res.status(500).json({ message: "Failed to verify transaction" });
    }
  }

  /**
   * Get wallet balance
   */
  static async getBalance(req: Request, res: Response) {
    try {
      if (!blockchainService.isEnabled()) {
        return res.status(503).json({
          message: "Blockchain not enabled",
          balance: "0",
        });
      }

      const balance = await blockchainService.getWalletBalance();

      res.json({
        balance,
        unit: "MATIC",
      });
    } catch (error) {
      logger.error("Error getting wallet balance:", error);
      res.status(500).json({ message: "Failed to get wallet balance" });
    }
  }

  /**
   * Estimate gas cost for operation
   */
  static async estimateGas(req: Request, res: Response) {
    try {
      const { operation, params } = req.body;

      if (!operation || !params) {
        return res.status(400).json({
          message: "Operation and params required",
        });
      }

      if (!["register", "record"].includes(operation)) {
        return res.status(400).json({
          message: 'Operation must be "register" or "record"',
        });
      }

      const estimatedCost = await blockchainService.estimateGasCost(
        operation,
        params
      );

      res.json({
        operation,
        estimatedCost,
        unit: "MATIC",
      });
    } catch (error) {
      logger.error("Error estimating gas:", error);
      res.status(500).json({ message: "Failed to estimate gas cost" });
    }
  }
}
