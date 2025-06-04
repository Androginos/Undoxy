import React, { useState, useEffect } from 'react';
import contractABI from './contractABI.json';
import {
  getDefaultWallets,
  RainbowKitProvider,
  ConnectButton,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiConfig, createConfig, useAccount, useContractRead, useContractWrite, useSimulateContract, useConnectorClient } from 'wagmi';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import '@rainbow-me/rainbowkit/styles.css';
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { abstractWallet } from "@abstract-foundation/agw-react/connectors";
import { ethers } from 'ethers';
import { BrowserProvider, JsonRpcSigner } from 'ethers';


const CONTRACT_ADDRESS = '0xBF862bd509EeeB748A892771A2E50842328e09A2';


// Wagmi Wallet Client to Ethers.js Signer adapter (from Wagmi docs)
function clientToSigner(client) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

const abstractTestnet = {
  id: 11124,
  name: 'Abstract Testnet',
  network: 'abstract-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [process.env.REACT_APP_ABSTRACT_TESTNET_RPC_URL] },
    public: { http: [process.env.REACT_APP_ABSTRACT_TESTNET_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Abscan', url: 'https://sepolia.abscan.org' },
  },
};

const connectors = connectorsForWallets(
  [
    {
      groupName: "Abstract",
      wallets: [abstractWallet],
    },
  ],
  {
    appName: "Noah NFT",
    projectId: "", // WalletConnect Project ID goes here
    appDescription: "Noah NFT Minting Platform",
    appIcon: "",
    appUrl: "",
  }
);

const config = createConfig({
  chains: [abstractTestnet],
  connectors: [
    ...connectors,
    injected({
      target: 'metaMask',
      shimDisconnect: true,
      shimChainChangedDisconnect: true,
    }),
  ],
  transports: {
    [abstractTestnet.id]: http(abstractTestnet.rpcUrls.default.http[0]),
  },
});

const queryClient = new QueryClient();

function MintPanel() {
  const { address, isConnected } = useAccount();
  const { data: connectorClient } = useConnectorClient();
  const [config, setConfig] = useState(null);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isEligibleWL1, setIsEligibleWL1] = useState(false);
  const [isEligibleWL2, setIsEligibleWL2] = useState(false);
  const [isEligiblePublic, setIsEligiblePublic] = useState(true);
  const [hasMintedWL1, setHasMintedWL1] = useState(false);
  const [hasMintedWL2, setHasMintedWL2] = useState(false);
  const [hasMintedPublic, setHasMintedPublic] = useState(false);
  const [wlCountdown, setWlCountdown] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [fcfsCountdown, setFcfsCountdown] = useState({ hours: "00", minutes: "00", seconds: "00" });

  // Read user's mint status from contract
  const { data: userHasMintedWL } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'hasMintedWL',
    args: [address],
    enabled: isConnected && currentPhase === "wl", // Read only in WL phase and when connected
  });

  const { data: userHasMintedFCFS } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'hasMintedFCFS',
    args: [address],
    enabled: isConnected && currentPhase === "fcfs", // Read only in FCFS phase and when connected
  });

  const { data: userHasMintedPublic } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'hasMintedPublic',
    args: [address],
    enabled: isConnected && currentPhase === "public", // Read only in Public phase and when connected
  });

  // Contract read operations
  const { data: wlMintPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'wlMintPrice',
  });

  const { data: fcfsMintPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'fcfsMintPrice',
  });

  const { data: publicMintPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'publicMintPrice',
  });

  const { data: totalSupply, isLoading: totalSupplyLoading, isError: totalSupplyError, refetch: refetchTotalSupply } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'totalSupply',
  });

  const { data: maxSupply, isLoading: maxSupplyLoading, isError: maxSupplyError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'maxSupply',
  });

  // Read if user has minted before and set state
  useEffect(() => {
    setHasMintedWL1(userHasMintedWL || false);
    setHasMintedWL2(userHasMintedFCFS || false);
    setHasMintedPublic(userHasMintedPublic || false);
  }, [userHasMintedWL, userHasMintedFCFS, userHasMintedPublic]);

  // Load config file
  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  // Determine phase (only from config)
  useEffect(() => {
    if (!config) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now < config.wlStartTime) {
        setCurrentPhase("waiting");
      } else if (now >= config.wlStartTime && now < config.fcfsStartTime) {
        setCurrentPhase("wl");
      } else if (now >= config.fcfsStartTime && now < config.publicStartTime) {
        setCurrentPhase("fcfs");
      } else {
        setCurrentPhase("public");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  // Timers (only from config)
  useEffect(() => {
    if (!config) return;
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      // Countdown for WL1: until FCFS starts
      const diffWL = config.fcfsStartTime - now;
      setWlCountdown({
        hours: diffWL > 0 ? String(Math.floor(diffWL / 3600)).padStart(2, '0') : "00",
        minutes: diffWL > 0 ? String(Math.floor((diffWL % 3600) / 60)).padStart(2, '0') : "00",
        seconds: diffWL > 0 ? String(diffWL % 60).padStart(2, '0') : "00"
      });
      // Countdown for WL2: until Public starts
      const diffFCFS = config.publicStartTime - now;
      setFcfsCountdown({
        hours: diffFCFS > 0 ? String(Math.floor(diffFCFS / 3600)).padStart(2, '0') : "00",
        minutes: diffFCFS > 0 ? String(Math.floor((diffFCFS % 3600) / 60)).padStart(2, '0') : "00",
        seconds: diffFCFS > 0 ? String(diffFCFS % 60).padStart(2, '0') : "00"
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [config]);

  // Whitelist eligibility (only from config)
  useEffect(() => {
    if (!address || !config) return;
    setIsEligibleWL1(config.whitelist1.map(a => a.toLowerCase()).includes(address.toLowerCase()));
    setIsEligibleWL2(config.whitelist2.map(a => a.toLowerCase()).includes(address.toLowerCase()));
    setIsEligiblePublic(true);
  }, [address, config]);

  // Mint function
  const handleMint = async () => {
    setMinting(true);

    if (!isConnected) {
      setMinting(false);
      return;
    }

    try {
      // Abstract Wallet check
      const isAbstractWallet = connectorClient?.type === 'abstract';
      
      if (isAbstractWallet) {
        if (!connectorClient) {
          setMinting(false);
          return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, connectorClient);

        let tx;
        if (currentPhase === "wl") {
          if (!isEligibleWL1 || hasMintedWL1 || !wlMintPrice) {
            setMinting(false);
            return;
          }
          tx = await contract.mintWL({ value: wlMintPrice });
        } else if (currentPhase === "fcfs") {
          if (!isEligibleWL2 || hasMintedWL2 || !fcfsMintPrice) {
            setMinting(false);
            return;
          }
          tx = await contract.mintFCFS({ value: fcfsMintPrice });
        } else if (currentPhase === "public") {
          if (!isEligiblePublic || hasMintedPublic || !publicMintPrice) {
            setMinting(false);
            return;
          }
          tx = await contract.mintPublic({ value: publicMintPrice });
        }

        await tx.wait();
        
        // Update states
        if (currentPhase === "wl") {
          setHasMintedWL1(true);
        } else if (currentPhase === "fcfs") {
          setHasMintedWL2(true);
        } else if (currentPhase === "public") {
          setHasMintedPublic(true);
        }
        
        // Update total minted
        await refetchTotalSupply();
      } else {
        if (!connectorClient) {
          setMinting(false);
          return;
        }
        const signer = clientToSigner(connectorClient);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        let tx;
        if (currentPhase === "wl") {
          if (!isEligibleWL1 || hasMintedWL1 || !wlMintPrice) {
            setMinting(false);
            return;
          }
          tx = await contract.mintWL({ value: wlMintPrice });
        } else if (currentPhase === "fcfs") {
          if (!isEligibleWL2 || hasMintedWL2 || !fcfsMintPrice) {
            setMinting(false);
            return;
          }
          tx = await contract.mintFCFS({ value: fcfsMintPrice });
        } else if (currentPhase === "public") {
          if (!isEligiblePublic || hasMintedPublic || !publicMintPrice) {
            setMinting(false);
            return;
          }
          tx = await contract.mintPublic({ value: publicMintPrice });
        }

        await tx.wait();
        
        // Update states
        if (currentPhase === "wl") {
          setHasMintedWL1(true);
        } else if (currentPhase === "fcfs") {
          setHasMintedWL2(true);
        } else if (currentPhase === "public") {
          setHasMintedPublic(true);
        }
        
        // Update total minted
        await refetchTotalSupply();
      }
    } catch (err) {
      console.error('Error during mint operation:', err);
    }
    setMinting(false);
  };

  // Show nothing until config is loaded
  const renderContent = () => {
    if (!config) {
      return <div className="text-white">Loading...</div>;
    }

    return (
      <div className="w-full max-w-xl bg-[#2D292B] text-white px-10 pt-2 pb-8 rounded-2xl shadow-lg flex flex-col">
        <div className="flex justify-center mb-4">
          <img src="/noahsarklogo.png" alt="Noah logo" className="h-16" />
        </div>
        <div className="flex justify-center mb-4">
          <ConnectButton />
        </div>
        <div className="bg-white text-black rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-[15px]">Total Minted</span>
            <span className="text-[15px]">
              {totalSupply !== undefined && maxSupply !== undefined ? `${totalSupply} / ${maxSupply}` :
               (totalSupplyLoading || maxSupplyLoading) ? 'Loading...' :
               (totalSupplyError || maxSupplyError) ? 'Error!' : 'Loading...'} 
            </span>
          </div>
        </div>
        <div className="space-y-7 flex-grow">
          {/* Whitelist 1 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="bg-[#E0F1B4] text-black px-4 py-1.5 rounded-lg text-[14px]">Whitelist 1</span>
              <div className={`${isEligibleWL1 ? 'bg-[#E5FFE5] text-[#4CAF50]' : 'bg-[#FFE5E5] text-[#FF6B6B]'} px-4 py-1.5 rounded-lg flex items-center gap-2`}>
                <span className="text-[14px]">{isEligibleWL1 ? 'Eligible' : 'Not Eligible'}</span>
                <span role="img" aria-label={isEligibleWL1 ? 'eligible' : 'not eligible'} className="text-[14px]">{isEligibleWL1 ? '✓' : '✕'}</span>
              </div>
              {hasMintedWL1 && (
                <div className="bg-[#0066FF] text-black px-4 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-[14px]">Blessed</span>
                  <span role="img" aria-label="minted" className="text-[14px]">✓</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-[14px] text-white">
              <span>1 Per Wallet</span>
              <div className="flex items-center gap-1">
                <span>Mint Price</span>
                <span>{wlMintPrice ? `${Number(wlMintPrice) / 1e18} ETH` : 'Loading...'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[14px] text-white">
              <span>Ends</span>
              <div className="flex gap-1">
                {["hours", "minutes", "seconds"].map((unit, index) => (
                  <div key={index} className="bg-[#F7FEE0] text-black px-3 py-1.5 rounded text-center w-[40px]">
                    {wlCountdown[unit]}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-[#3D393B]"></div>
          {/* Whitelist 2 */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="bg-[#E0F1B4] text-black px-4 py-1.5 rounded-lg text-[14px]">Whitelist 2</span>
              <div className={`${isEligibleWL2 ? 'bg-[#E5FFE5] text-[#4CAF50]' : 'bg-[#FFE5E5] text-[#FF6B6B]'} px-4 py-1.5 rounded-lg flex items-center gap-2`}>
                <span className="text-[14px]">{isEligibleWL2 ? 'Eligible' : 'Not Eligible'}</span>
                <span role="img" aria-label={isEligibleWL2 ? 'eligible' : 'not eligible'} className="text-[14px]">{isEligibleWL2 ? '✓' : '✕'}</span>
              </div>
              {hasMintedWL2 && (
                <div className="bg-[#0066FF] text-black px-4 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-[14px]">Noahed</span>
                  <span role="img" aria-label="minted" className="text-[14px]">✓</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-[14px] text-white">
              <span>1 Per Wallet</span>
              <div className="flex items-center gap-1">
                <span>Mint Price</span>
                <span>{fcfsMintPrice ? `${Number(fcfsMintPrice) / 1e18} ETH` : 'Loading...'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[14px] text-white">
              <span>Ends</span>
              <div className="flex gap-1">
                {["hours", "minutes", "seconds"].map((unit, index) => (
                  <div key={index} className="bg-[#F7FEE0] text-black px-3 py-1.5 rounded text-center w-[40px]">
                    {fcfsCountdown[unit]}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-[#3D393B]"></div>
          {/* Public Sale */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="bg-[#E0F1B4] text-black px-4 py-1.5 rounded-lg text-[14px]">Public</span>
              <div className={`${isEligiblePublic ? 'bg-[#E5FFE5] text-[#4CAF50]' : 'bg-[#FFE5E5] text-[#FF6B6B]'} px-4 py-1.5 rounded-lg flex items-center gap-2`}>
                <span className="text-[14px]">{isEligiblePublic ? 'Eligible' : 'Not Eligible'}</span>
                <span role="img" aria-label={isEligiblePublic ? 'eligible' : 'not eligible'} className="text-[14px]">{isEligiblePublic ? '✓' : '✕'}</span>
              </div>
              {hasMintedPublic && (
                <div className="bg-[#0066FF] text-black px-4 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-[14px]">Noahed</span>
                  <span role="img" aria-label="minted" className="text-[14px]">✓</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-[14px] text-white">
              <span>1 Per Wallet</span>
              <div className="flex items-center gap-1">
                <span>Mint Price</span>
                <span>{publicMintPrice ? `${Number(publicMintPrice) / 1e18} ETH` : 'Loading...'}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          className={`w-full py-3 rounded-lg mt-6 text-[14px] font-bold transition ${
            minting || !isConnected || 
            (currentPhase === "wl" && (!isEligibleWL1 || hasMintedWL1)) || 
            (currentPhase === "fcfs" && (!isEligibleWL2 || hasMintedWL2)) || 
            (currentPhase === "public" && (!isEligiblePublic || hasMintedPublic))
              ? 'bg-[#9A9A9A] text-white'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
          onClick={handleMint}
          disabled={minting || !isConnected || 
            (currentPhase === "wl" && (!isEligibleWL1 || hasMintedWL1)) || 
            (currentPhase === "fcfs" && (!isEligibleWL2 || hasMintedWL2)) || 
            (currentPhase === "public" && (!isEligiblePublic || hasMintedPublic))}
        >
          {minting ? 'Minting...' : 'Mint'}
        </button>
      </div>
    );
  };

  return renderContent();
}

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={[abstractTestnet]} theme={darkTheme()}>
          {/* Fixed background div */}
          <div style={{ 
            backgroundImage: 'url("/bgnoah.png")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundRepeat: 'no-repeat', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            zIndex: 0
          }}></div>
          {/* Main content and layout div */}
          <div style={{ minHeight: '100vh', backgroundColor: 'transparent', zIndex: 1, position: 'relative' }}>
            <div className="flex flex-col md:flex-row items-center md:justify-end justify-start w-full p-4 gap-4 md:gap-56 min-h-screen">
              {/* The right area where the mint panel is located, with margin on the left and right */}
              <div className="flex flex-col items-center gap-4 w-full max-w-xl md:mr-[2vw] my-auto max-h-[90vh] overflow-y-auto md:mb-[10vh]" style={{ border: '5px solid #0F0', boxShadow: '0 0 10px #0F0, 0 0 20px #0F0, 0 0 30px #0F0, 0 0 40px #0F0', borderRadius: '10px', zIndex: 2, position: 'relative' }}>
                <MintPanel />
              </div>
            </div>
            {/* Noah image pinned to the far left and bottom */}
            {/*
            <img
              src="/noah.png"
              alt="Noah"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "99vw",
                height: "99vh",
                objectFit: "cover",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
            */}
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;