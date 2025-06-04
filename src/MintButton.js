import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import contractAbi from "./contractABI.json";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

// Whitelist arrays (should be lowercase!)
// This list will be automatically updated by the deploy script
const whitelist1 = [
  // This list will be automatically updated by the deploy script
].map(addr => addr.toLowerCase());

const whitelist2 = [
  // This list will be automatically updated by the deploy script
].map(addr => addr.toLowerCase());

// Create Merkle trees
const leaves1 = whitelist1.map(addr => keccak256(addr));
const tree1 = new MerkleTree(leaves1, keccak256, { sortPairs: true });

const leaves2 = whitelist2.map(addr => keccak256(addr));
const tree2 = new MerkleTree(leaves2, keccak256, { sortPairs: true });

function getProof(address, tree) {
  const leaf = keccak256(address.toLowerCase());
  return tree.getHexProof(leaf);
}

export default function MintButton() {
  const [status, setStatus] = useState("");
  const [currentPhase, setCurrentPhase] = useState("waiting"); // wl, fcfs, public, waiting
  const [contract, setContract] = useState(null);
  const [mintPrice, setMintPrice] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
        setContract(contractInstance);
        checkPhase(contractInstance);
      }
    };
    initContract();
  }, []);

  const checkPhase = async (contractInstance) => {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const wlStartTime = await contractInstance.wlStartTime();
      const fcfsStartTime = await contractInstance.fcfsStartTime();
      const publicStartTime = await contractInstance.publicStartTime();

      // Get mint prices
      const wlPrice = await contractInstance.wlMintPrice();
      const fcfsPrice = await contractInstance.fcfsMintPrice();
      const publicPrice = await contractInstance.publicMintPrice();

      if (currentTime < wlStartTime) {
        setCurrentPhase("waiting");
      } else if (currentTime >= wlStartTime && currentTime < fcfsStartTime) {
        setCurrentPhase("wl");
        setMintPrice(ethers.formatEther(wlPrice));
      } else if (currentTime >= fcfsStartTime && currentTime < publicStartTime) {
        setCurrentPhase("fcfs");
        setMintPrice(ethers.formatEther(fcfsPrice));
      } else {
        setCurrentPhase("public");
        setMintPrice(ethers.formatEther(publicPrice));
      }
    } catch (err) {
      console.error("Phase check error:", err);
    }
  };

  const mintWL = async () => {
    try {
      if (!window.ethereum) return setStatus("Metamask required!");
      setStatus("Whitelist mint transaction is being sent...");
      const price = await contract.wlMintPrice();
      const tx = await contract.mintWL({
        value: price
      });
      await tx.wait();
      setStatus("Whitelist mint successful!");
    } catch (err) {
      setStatus("Error: " + (err?.reason || err?.message));
    }
  };

  const mintFCFS = async () => {
    try {
      if (!window.ethereum) return setStatus("Metamask required!");
      setStatus("FCFS mint transaction is being sent...");
      const price = await contract.fcfsMintPrice();
      const tx = await contract.mintFCFS({
        value: price
      });
      await tx.wait();
      setStatus("FCFS mint successful!");
    } catch (err) {
      setStatus("Error: " + (err?.reason || err?.message));
    }
  };

  const mintPublic = async () => {
    try {
      if (!window.ethereum) return setStatus("Metamask required!");
      setStatus("Public mint transaction is being sent...");
      const price = await contract.publicMintPrice();
      const tx = await contract.mintPublic({
        value: price
      });
      await tx.wait();
      setStatus("Public mint successful!");
    } catch (err) {
      setStatus("Error: " + (err?.reason || err?.message));
    }
  };

  const renderMintButton = () => {
    switch (currentPhase) {
      case "wl":
        return <button onClick={mintWL}>Whitelist Mint</button>;
      case "fcfs":
        return <button onClick={mintFCFS}>FCFS Mint</button>;
      case "public":
        return <button onClick={mintPublic}>Public Mint</button>;
      default:
        return <button disabled>Mint has not started yet</button>;
    }
  };

  return (
    <div>
      {renderMintButton()}
      <div>{status}</div>
    </div>
  );
} 