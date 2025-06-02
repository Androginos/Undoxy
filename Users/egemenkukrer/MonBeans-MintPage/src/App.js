import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import contractABI from './contractABI.json';

const CONFIG_URL = '/config.json';
const RPC_URL = 'https://monad-testnet.g.alchemy.com/v2/8QMlEIAdNyu3vAlf8e7XhoyRRwBiaFr5';

function getProvider(selected) {
  if (window.ethereum && window.ethereum.providers) {
    if (selected) {
      return window.ethereum.providers.find(p => {
        if (selected === 'MetaMask') return p.isMetaMask;
        if (selected === 'Phantom') return p.isPhantom;
        if (selected === 'Backpack') return p.isBackpack;
        return false;
      }) || window.ethereum.providers[0];
    }
    return window.ethereum.providers[0];
  }
  return window.ethereum;
}

// Config yüklenmeden hiçbir şey gösterme
function MintPanel() {
  const [account, setAccount] = useState(null);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [mintPrice, setMintPrice] = useState(null);
  const [totalMinted, setTotalMinted] = useState(null);
  const [maxSupply, setMaxSupply] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isEligibleWL1, setIsEligibleWL1] = useState(false);
  const [isEligibleWL2, setIsEligibleWL2] = useState(false);
  const [isEligiblePublic, setIsEligiblePublic] = useState(false);
  const [hasMintedWL1, setHasMintedWL1] = useState(false);
  const [hasMintedWL2, setHasMintedWL2] = useState(false);
  const [hasMintedPublic, setHasMintedPublic] = useState(false);
  const [wlCountdown, setWlCountdown] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [fcfsCountdown, setFcfsCountdown] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [publicCountdown, setPublicCountdown] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [config, setConfig] = useState(null);
  const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);

  // Config dosyasını yükle
  useEffect(() => {
    fetch(CONFIG_URL)
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  // Config yüklenmeden hiçbir şey gösterme
  if (!config) {
    return <div className="text-white">Yükleniyor...</div>;
  }

  // Config'ten adres ve zamanları al
  const CONTRACT_ADDRESS = config.contractAddress;

  // RPC üzerinden kontrat verilerini al
  const getContractData = useCallback(async () => {
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, rpcProvider);
      
      // Mint fiyatlarını al
      const wlPrice = await contract.wlMintPrice();
      const fcfsPrice = await contract.fcfsMintPrice();
      const publicPrice = await contract.publicMintPrice();
      
      // Monad 18 decimal olduğu için formatEther kullanıyoruz
      setMintPrice(ethers.formatEther(publicPrice)); // Public fiyatı göster

      // Total minted ve max supply değerlerini al
      const total = await contract.totalSupply();
      const max = await contract.maxSupply();
      setTotalMinted(total.toString());
      setMaxSupply(max.toString());

      // Şu anki fazı belirle
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < config.wlStartTime) {
        setCurrentPhase("bekleme");
      } else if (currentTime >= config.wlStartTime && currentTime < config.fcfsStartTime) {
        setCurrentPhase("wl");
        setMintPrice(ethers.formatEther(wlPrice));
      } else if (currentTime >= config.fcfsStartTime && currentTime < config.publicStartTime) {
        setCurrentPhase("fcfs");
        setMintPrice(ethers.formatEther(fcfsPrice));
      } else {
        setCurrentPhase("public");
        setMintPrice(ethers.formatEther(publicPrice));
      }

      // Cüzdan bağlıysa whitelist ve mint durumlarını kontrol et
      if (account) {
        // WL1 kontrolü
        const isWL1 = await contract.isWhitelist1(account);
        const hasMintedWL = await contract.hasMintedWL(account);
        setIsEligibleWL1(isWL1);
        setHasMintedWL1(hasMintedWL);

        // WL2 kontrolü
        const isWL2 = await contract.isWhitelist2(account);
        const hasMintedFCFS = await contract.hasMintedFCFS(account);
        setIsEligibleWL2(isWL2);
        setHasMintedWL2(hasMintedFCFS);

        // Public mint kontrolü
        const hasMintedPublic = await contract.hasMintedPublic(account);
        setIsEligiblePublic(true); // Public herkes için eligible
        setHasMintedPublic(hasMintedPublic);
      }

    } catch (err) {
      console.error("Kontrat verisi hatası:", err);
      setError(err?.reason || err?.message || 'Kontrat verileri alınamadı');
    }
  }, [account, rpcProvider, config, CONTRACT_ADDRESS]);

  // Sayfa yüklendiğinde ve her 10 saniyede bir verileri güncelle
  useEffect(() => {
    if (config) {
      getContractData();
      const interval = setInterval(getContractData, 10000);
      return () => clearInterval(interval);
    }
  }, [getContractData, config]);

  // Cüzdan bağlandığında verileri güncelle
  useEffect(() => {
    if (account) {
      getContractData();
    }
  }, [account, getContractData]);

  // Cüzdan seçici modalı aç
  const connectWallet = async () => {
    setError(null);
    setShowWalletModal(false);
    try {
      if (!window.ethereum) throw new Error('MetaMask/Phantom/Backpack yüklü değil!');
      // Eğer birden fazla provider varsa seçim yap
      if (window.ethereum.providers && window.ethereum.providers.length > 1 && !selectedWallet) {
        setShowWalletModal(true);
        return;
      }
      // Monad testnet ağına geçiş
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x279F', // 10143
          chainName: 'Monad Testnet',
          rpcUrls: ['https://testnet-rpc.monad.xyz/'],
          nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
          blockExplorerUrls: ['https://testnet.monadexplorer.com/']
        }]
      });
      const provider = getProvider(selectedWallet);
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      setError(err?.reason || err?.message || 'Cüzdan bağlanamadı!');
    }
  };

  // Modalda cüzdan seçimi
  const handleWalletSelect = async (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletModal(false);
    setTimeout(connectWallet, 100); // Seçimden sonra connectWallet çağır
  };

  // Cüzdan bağlantısını kes
  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
    setSelectedWallet(null);
  };

  // Mint işlemi
  const handleMint = async () => {
    setError(null);
    setMinting(true);
    
    try {
      if (!window.ethereum) throw new Error('MetaMask/Phantom/Backpack yüklü değil!');
      const provider = new ethers.BrowserProvider(getProvider(selectedWallet));
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

      // Mint fiyatını kontrat üzerinden al
      let price;
      if (currentPhase === "wl") {
        price = await contract.wlMintPrice();
      } else if (currentPhase === "fcfs") {
        price = await contract.fcfsMintPrice();
      } else {
        price = await contract.publicMintPrice();
      }

      let tx;
      try {
        if (currentPhase === "wl") {
          tx = await contract.mintWL({ 
            value: price
          });
        } else if (currentPhase === "fcfs") {
          tx = await contract.mintFCFS({ 
            value: price
          });
        } else {
          tx = await contract.mintPublic({ 
            value: price
          });
        }
      } catch (txError) {
        throw new Error(`İşlem gönderilemedi: ${txError.message}`);
      }

      await tx.wait();
      await getContractData();
    } catch (err) {
      setError(err?.reason || err?.message || 'Mint başarısız!');
    }
    setMinting(false);
  };

  // Sayaçlarda da Number tipini zorunlu kullan
  useEffect(() => {
    if (typeof config.wlStartTime !== 'number' || typeof config.fcfsStartTime !== 'number') return;
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(config.fcfsStartTime) - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setWlCountdown({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      } else {
        setWlCountdown({ hours: "00", minutes: "00", seconds: "00" });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [config.fcfsStartTime, config.wlStartTime]);

  useEffect(() => {
    if (typeof config.fcfsStartTime !== 'number' || typeof config.publicStartTime !== 'number') return;
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(config.publicStartTime) - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setFcfsCountdown({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      } else {
        setFcfsCountdown({ hours: "00", minutes: "00", seconds: "00" });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [config.publicStartTime, config.fcfsStartTime]);

  useEffect(() => {
    if (typeof config.publicStartTime !== 'number') return;
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(config.publicStartTime) - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setPublicCountdown({
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0')
        });
      } else {
        setPublicCountdown({ hours: "00", minutes: "00", seconds: "00" });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [config.publicStartTime]);

  return (
    <div className="w-full max-w-xl bg-[#2D292B] text-white px-10 pt-2 pb-8 rounded-2xl shadow-lg flex flex-col">
      {/* Cüzdan seçici modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#18181B] p-8 rounded-2xl flex flex-col gap-5 min-w-[320px] shadow-2xl relative">
            <button onClick={() => setShowWalletModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">×</button>
            <div className="flex flex-col items-center mb-2">
              <span className="text-xl font-bold mb-1 text-white">Bir EVM cüzdanı ile bağlan</span>
              <span className="text-sm text-gray-300 text-center">Mint işlemi için lütfen bir cüzdan seçin. Monad Testnet destekli cüzdanlar:</span>
            </div>
            <div className="flex flex-col gap-3">
              {/* MetaMask */}
              <button onClick={() => handleWalletSelect('MetaMask')} className="flex items-center gap-3 bg-[#232323] hover:bg-[#333] transition p-3 rounded-xl border border-[#333]">
                <img src="/metamask.svg" alt="MetaMask" className="w-8 h-8" />
                <span className="flex-1 text-left text-white font-semibold">MetaMask</span>
                {window.ethereum && ((window.ethereum.providers && window.ethereum.providers.find(p => p.isMetaMask)) || window.ethereum.isMetaMask) ? (
                  <span className="text-green-400 text-xs font-bold">Tespit Edildi</span>
                ) : (
                  <span className="text-gray-400 text-xs">Yüklü Değil</span>
                )}
              </button>
              {/* Phantom */}
              <button onClick={() => handleWalletSelect('Phantom')} className="flex items-center gap-3 bg-[#232323] hover:bg-[#333] transition p-3 rounded-xl border border-[#333]">
                <img src="/phantom.svg" alt="Phantom" className="w-8 h-8" />
                <span className="flex-1 text-left text-white font-semibold">Phantom</span>
                {window.ethereum && ((window.ethereum.providers && window.ethereum.providers.find(p => p.isPhantom)) || window.ethereum.isPhantom) ? (
                  <span className="text-green-400 text-xs font-bold">Tespit Edildi</span>
                ) : (
                  <span className="text-gray-400 text-xs">Yüklü Değil</span>
                )}
              </button>
              {/* Backpack */}
              <button onClick={() => handleWalletSelect('Backpack')} className="flex items-center gap-3 bg-[#232323] hover:bg-[#333] transition p-3 rounded-xl border border-[#333]">
                <img src="/backpack.svg" alt="Backpack" className="w-8 h-8" />
                <span className="flex-1 text-left text-white font-semibold">Backpack</span>
                {window.ethereum && ((window.ethereum.providers && window.ethereum.providers.find(p => p.isBackpack)) || window.ethereum.isBackpack) ? (
                  <span className="text-green-400 text-xs font-bold">Tespit Edildi</span>
                ) : (
                  <span className="text-gray-400 text-xs">Yüklü Değil</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-center mb-4">
        <img src="/monk-logo.png" alt="monk logo" className="h-16" />
      </div>
      {account && (
        <div
          className="w-full bg-[#C6F5E9] text-black text-center rounded-lg py-2 mb-2 font-mono text-lg font-bold min-h-[48px] flex items-center justify-center"
          style={{ height: '48px' }}
        >
          {account.slice(0, 6) + '...' + account.slice(-4)}
        </div>
      )}
      {!account ? (
        <>
          <div
            className="w-full bg-[#C6F5E9] rounded-lg mb-2"
            style={{ height: '48px', opacity: 0 }}
          ></div>
          <button
            onClick={connectWallet}
            className="w-full bg-[#C6F5E9] text-black py-2 rounded-lg mb-4 font-bold hover:bg-[#b0e6d7] transition flex items-center justify-center gap-2"
          >
            <img src="/metamask.svg" alt="MetaMask" className="w-6 h-6 object-contain" onError={e => { e.target.style.display = 'none'; }} />
            Connect Wallet
          </button>
        </>
      ) : (
        <button
          onClick={disconnectWallet}
          className="w-full bg-[#444] text-white py-2 rounded-lg mb-4 font-bold hover:bg-[#222] transition"
        >
          Disconnect
        </button>
      )}
      <div className="bg-white text-black rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[15px]">Total Minted</span>
          <span className="text-[15px]">
            {totalMinted && maxSupply ? `${totalMinted} / ${maxSupply}` : 'Yükleniyor...'}
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
                <span className="text-[14px]">Monked</span>
                <span role="img" aria-label="minted" className="text-[14px]">✓</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-[14px] text-white">
            <span>1 Per Wallet</span>
            <div className="flex items-center gap-1">
              <span>Mint Price</span>
              <span>{mintPrice ? `${Number(mintPrice).toFixed(2)} MON` : 'Yükleniyor...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white">
            <span>Bitiş</span>
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
                <span className="text-[14px]">Monked</span>
                <span role="img" aria-label="minted" className="text-[14px]">✓</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-[14px] text-white">
            <span>1 Per Wallet</span>
            <div className="flex items-center gap-1">
              <span>Mint Price</span>
              <span>{mintPrice ? `${Number(mintPrice).toFixed(2)} MON` : 'Yükleniyor...'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white">
            <span>Bitiş</span>
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
                <span className="text-[14px]">Monked</span>
                <span role="img" aria-label="minted" className="text-[14px]">✓</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-[14px] text-white">
            <span>1 Per Wallet</span>
            <div className="flex items-center gap-1">
              <span>Mint Price</span>
              <span>{mintPrice ? `${Number(mintPrice).toFixed(2)} MON` : 'Yükleniyor...'}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        className={`w-full py-3 rounded-lg mt-6 text-[14px] font-bold transition ${
          minting || !account
            ? 'bg-[#9A9A9A] text-white'
            : (currentPhase === "wl" && isEligibleWL1 && !hasMintedWL1) || 
              (currentPhase === "fcfs" && isEligibleWL2 && !hasMintedWL2) || 
              (currentPhase === "public" && isEligiblePublic && !hasMintedPublic)
            ? 'bg-white text-black hover:bg-gray-100'
            : 'bg-[#9A9A9A] text-white'
        }`}
        onClick={handleMint}
        disabled={minting || !account || 
          !((currentPhase === "wl" && isEligibleWL1 && !hasMintedWL1) || 
            (currentPhase === "fcfs" && isEligibleWL2 && !hasMintedWL2) || 
            (currentPhase === "public" && isEligiblePublic && !hasMintedPublic))}
      >
        {minting ? 'Mintleniyor...' : 'Mint'}
      </button>
      {error && (
        <div className="mt-2 text-red-400 text-center text-xs">{error}</div>
      )}
    </div>
  );
}

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#7918F5' }}>
      <div className="flex flex-col md:flex-row items-center md:justify-end justify-start w-full p-4 gap-4 md:gap-56 min-h-screen">
        {/* Sol taraftaki görsel */}
        <div className="flex-1 flex justify-start items-center mb-4 md:mb-0">
          <div className="flex justify-center items-center w-full h-full">
            <img 
              src="/web 1.png" 
              alt="Web" 
              className="w-[320px] sm:w-[430px] md:w-[520px] lg:w-[650px] xl:w-[810px] h-auto object-contain"
              style={{ maxHeight: '70vh' }}
            />
          </div>
        </div>
        {/* Sağ taraftaki mint alanı */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xl md:mr-[10vw]">
          <MintPanel />
        </div>
      </div>
    </div>
  );
}

export default App; 