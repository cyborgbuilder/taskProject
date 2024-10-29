import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../configs/web3/contractConfig";
import { Layout } from "@src/layouts";
import { Button } from "@chakra-ui/react";

const TokenComponent: React.FC = () => {
  const [balance, setBalance] = useState<string>("0");
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchBalance = async () => {
    try {
      if ((window as any).ethereum) {
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(
          (window as any).ethereum
        );
        const signer = provider.getSigner();
        const address = await signer.getAddress();

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          provider
        );
        const balance = await contract.balanceOf(address);
        setBalance(ethers.utils.formatEther(balance));
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const handleTransfer = async () => {
    if (!recipient || !amount) {
      alert("Please fill out both recipient and amount fields.");
      return;
    }

    try {
      setLoading(true);
      if ((window as any).ethereum) {
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(
          (window as any).ethereum
        );
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        const tx = await contract.transfer(
          recipient,
          ethers.utils.parseEther(amount)
        );
        await tx.wait();

        alert("Transfer successful!");
        setRecipient("");
        setAmount("");
        fetchBalance();
      }
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <div className="container mx-auto h-full">
      <div className="flex flex-col items-center p-6 bg-secondary shadow-md rounded-lg max-w-md mx-auto h-full">
        <h2 className="text-2xl font-bold mb-4 text-[#fff]">
          Your Token Balance
        </h2>
        <p className="text-xl text-[#fff] mb-6">{balance} CBK</p>

        <div className="w-full mb-4">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
        </div>

        <div className="w-full mb-4">
          <input
            type="text"
            placeholder="Amount to Transfer"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          colorScheme="brand"
          size="md"
          bgColor="bg.brand !important"
          rounded="full"
          px={4}
          py={1}
          color="bg.default"
          borderRadius={"8px"}
          onClick={handleTransfer}
          disabled={loading}
          className={`w-full bg-blue-500 text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Processing..." : "Transfer Tokens"}
        </Button>
      </div>
    </div>
  );
};

TokenComponent.getLayout = (page: React.ReactNode) => <Layout>{page}</Layout>;

export default TokenComponent;
