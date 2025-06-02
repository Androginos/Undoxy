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

const CONTRACT_ADDRESS = '0x89508Fcb102915C70945D8948aB8750C9ca09319';

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

  // Kontrattan kullanıcının mint durumunu oku
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

  // Contract okuma işlemleri
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

  const { data: totalSupply, isLoading: totalSupplyLoading, isError: totalSupplyError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'totalSupply',
  });

  const { data: maxSupply, isLoading: maxSupplyLoading, isError: maxSupplyError } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'maxSupply',
  });

  // Daha önce mint yapılıp yapılmadığını kontrattan oku ve state'e ata
  useEffect(() => {
    setHasMintedWL1(userHasMintedWL || false);
    setHasMintedWL2(userHasMintedFCFS || false);
    setHasMintedPublic(userHasMintedPublic || false);
  }, [userHasMintedWL, userHasMintedFCFS, userHasMintedPublic]);

  // Config dosyasını yükle
  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  // Fazı belirle (yalnızca config'ten)
  useEffect(() => {
    if (!config) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      if (now < config.wlStartTime) {
        setCurrentPhase("bekleme");
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

  // Sayaçlar (yalnızca config'ten)
  useEffect(() => {
    if (!config) return;
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      // WL1 için sayaç: FCFS başlangıcına kadar
      const diffWL = config.fcfsStartTime - now;
      setWlCountdown({
        hours: diffWL > 0 ? String(Math.floor(diffWL / 3600)).padStart(2, '0') : "00",
        minutes: diffWL > 0 ? String(Math.floor((diffWL % 3600) / 60)).padStart(2, '0') : "00",
        seconds: diffWL > 0 ? String(diffWL % 60).padStart(2, '0') : "00"
      });
      // WL2 için sayaç: Public başlangıcına kadar
      const diffFCFS = config.publicStartTime - now;
      setFcfsCountdown({
        hours: diffFCFS > 0 ? String(Math.floor(diffFCFS / 3600)).padStart(2, '0') : "00",
        minutes: diffFCFS > 0 ? String(Math.floor((diffFCFS % 3600) / 60)).padStart(2, '0') : "00",
        seconds: diffFCFS > 0 ? String(diffFCFS % 60).padStart(2, '0') : "00"
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [config]);

  // Whitelist eligibility (yalnızca config'ten)
  useEffect(() => {
    if (!address || !config) return;
    setIsEligibleWL1(config.whitelist1.map(a => a.toLowerCase()).includes(address.toLowerCase()));
    setIsEligibleWL2(config.whitelist2.map(a => a.toLowerCase()).includes(address.toLowerCase()));
    setIsEligiblePublic(true);
  }, [address, config]);

  // Mint işlemi
  const handleMint = async () => {
    console.log('handleMint called (ethers)');
    setError(null);
    setMinting(true);
    
    if (!connectorClient) {
      console.error('Wallet not connected or connectorClient not obtained.');
      setError('Please connect your wallet.');
      setMinting(false);
      return;
    }

    try {
      const signer = clientToSigner(connectorClient);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      let tx;
      if (currentPhase === "wl") {
        console.log('Initiating WL phase mint (ethers)');
        if (!isEligibleWL1) {
           setError('Not eligible for WL1.');
           setMinting(false);
           return;
        }
        if (hasMintedWL1) {
           setError('You have already minted in WL1.');
           setMinting(false);
           return;
        }
        if (!wlMintPrice) {
           setError('Mint price could not be loaded.');
           setMinting(false);
           return;
        }
        tx = await contract.mintWL({ value: wlMintPrice });
      } else if (currentPhase === "fcfs") {
        console.log('Initiating FCFS phase mint (ethers)');
         if (!isEligibleWL2) {
           setError('Not eligible for WL2 (FCFS).');
           setMinting(false);
           return;
        }
        if (hasMintedWL2) {
           setError('You have already minted in WL2 (FCFS).');
           setMinting(false);
           return;
        }
         if (!fcfsMintPrice) {
           setError('Mint price could not be loaded.');
           setMinting(false);
           return;
        }
        tx = await contract.mintFCFS({ value: fcfsMintPrice });
      } else if (currentPhase === "public") {
        console.log('Initiating Public phase mint (ethers)');
         if (!isEligiblePublic) {
           setError('Not eligible for Public mint.');
           setMinting(false);
           return;
        }
        if (hasMintedPublic) {
           setError('You have already minted in Public.');
           setMinting(false);
           return;
        }
         if (!publicMintPrice) {
           setError('Mint price could not be loaded.');
           setMinting(false);
           return;
        }
        tx = await contract.mintPublic({ value: publicMintPrice });
      } else {
        console.log('Attempting mint in invalid phase (ethers):', currentPhase);
        setError('Minting is not currently available.');
        setMinting(false);
        return;
      }

      console.log('Transaction sent:', tx.hash);
      // Wait for the transaction to be confirmed
      await tx.wait();
      console.log('Transaction confirmed:', tx.hash);
      setError('Mint successful!');

      // Successful mint may require updating statuses (e.g., re-fetching hasMinted states)
      // useContractRead hooks will automatically refetch.

    } catch (err) {
      console.error('Error during mint operation (ethers):', err);
      // Make the error message more understandable if the user rejects
      if (err.code === 4001) {
        setError('Transaction rejected by wallet.');
      } else {
         setError(err?.reason || err?.message || 'Mint failed!');
      }
    }
    setMinting(false);
    console.log('handleMint finished (ethers)');
  };

  // Config yüklenmeden hiçbir şey gösterme
  const renderContent = () => {
    if (!config) {
      return <div className="text-white">Loading...</div>;
    }

    // useContractRead hook'larından alınan boolean değerleri doğrudan kullan
    const hasMintedWL1 = userHasMintedWL || false;
    const hasMintedWL2 = userHasMintedFCFS || false; // Kontratta FCFS için hasMintedFCFS kullanılıyor
    const hasMintedPublic = userHasMintedPublic || false;

    const wlPrice = wlMintPrice ? Number(wlMintPrice) / 1e18 : 0;
    const fcfsPrice = fcfsMintPrice ? Number(fcfsMintPrice) / 1e18 : 0;
    const publicPrice = publicMintPrice ? Number(publicMintPrice) / 1e18 : 0;

    const canMint = !minting && isConnected && (
      (currentPhase === "wl" && isEligibleWL1 && !hasMintedWL1 && !!wlMintPrice) || 
      (currentPhase === "fcfs" && isEligibleWL2 && !hasMintedWL2 && !!fcfsMintPrice) || 
      (currentPhase === "public" && isEligiblePublic && !hasMintedPublic && !!publicMintPrice)
    );

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
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

          <button
            className={`w-full py-3 rounded-lg mt-6 text-[14px] font-bold transition ${
            minting || !isConnected
              ? 'bg-[#9A9A9A] text-white'
              : (currentPhase === "wl" && isEligibleWL1 && !hasMintedWL1) || 
                (currentPhase === "fcfs" && isEligibleWL2 && !hasMintedWL2) || 
                (currentPhase === "public" && isEligiblePublic && !hasMintedPublic)
              ? 'bg-white text-black hover:bg-gray-100'
              : 'bg-[#9A9A9A] text-white'
          }`}
          onClick={handleMint}
          disabled={minting || !isConnected || 
            !((currentPhase === "wl" && isEligibleWL1 && !hasMintedWL1) || 
              (currentPhase === "fcfs" && isEligibleWL2 && !hasMintedWL2) || 
              (currentPhase === "public" && isEligiblePublic && !hasMintedPublic))}
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
          {/* Sabit arka plan divi */}
          <div style={{ backgroundImage: 'url("/noahbg.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}></div>
          {/* Ana içerik ve layout divi */}
          <div style={{ minHeight: '100vh', backgroundColor: 'transparent', zIndex: 1, position: 'relative' }}>
            {/* Sabitlenmiş noah.png görseli (mint panelinin altında) */}
            <img 
              src="/noah.png" 
              alt="Web" 
              style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                height: 'auto', /* height otomatik ayarlansın */
                width: '50vw', /* Genişliği Responsive olarak %50 yapıldı */
                maxWidth: '800px', /* Max genişlik biraz artırıldı */
                objectFit: 'contain', /* Oran bozulmasın */
                zIndex: 0, /* Mint panelinin altında kalsın */
              }}
              className="hidden md:block"
            />
            {/* Ana düzen divi, sadece mint paneli için */}
            <div className="flex flex-col md:flex-row items-center md:justify-end justify-start w-full p-4 gap-4 md:gap-56 min-h-screen">
              {/* Mint panelinin bulunduğu sağ alan, soldan ve sağdan marjinli */}
              <div className="flex flex-col items-center gap-4 w-full max-w-xl md:mr-[5vw] md:ml-[10vw] my-auto max-h-[90vh] overflow-y-auto md:mb-[10vh]" style={{ border: '5px solid #0F0', boxShadow: '0 0 10px #0F0, 0 0 20px #0F0, 0 0 30px #0F0, 0 0 40px #0F0', borderRadius: '10px' }}>
                <MintPanel />
              </div>
            </div>
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;