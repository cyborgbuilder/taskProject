const express = require("express");
const { ethers } = require("ethers");

const tokenRoutes = (contract) => {
  const router = express.Router();
  router.get("/balance/:address", async (req, res) => {
    try {
      const address = req.params.address;
      const balance = await contract.balanceOf(address);
      res.status(200).json({ balance: ethers.utils.formatEther(balance) });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  router.post("/transfer", async (req, res) => {
    const { recipient, amount } = req.body;
    if (!recipient || !amount) {
      return res
        .status(400)
        .json({ error: "Recipient and amount are required" });
    }

    try {
      const tx = await contract.transfer(
        recipient,
        ethers.utils.parseEther(amount)
      );
      await tx.wait();
      res.status(200).json({ success: true, txHash: tx.hash });
    } catch (error) {
      console.error("Transfer failed:", error);
      res.status(500).json({ error: "Transfer failed" });
    }
  });

  return router;
};

module.exports = tokenRoutes;
