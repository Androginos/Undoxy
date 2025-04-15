import { useState } from "react";
import './App.css';

const WalletButton = () => {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAccount("0x1234...5678");
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <div className="w-[30vw]">
      {account ? (
        <>
          <div className="w-full bg-[#CCFFF5] text-[#2D292B] py-3 rounded-lg text-[15px] text-center absolute -translate-y-[calc(100%+8px)]">
            {account}
          </div>
          <button 
            onClick={disconnectWallet}
            className="w-full bg-[#3D393B] text-white py-3 rounded-lg text-[15px] hover:bg-[#504C4E] transition-all"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-[30vw] bg-[#3D393B] text-white py-3 rounded-lg text-[15px] hover:bg-[#504C4E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

const MintInfo = () => {
  return (
    <div className="w-[30vw] h-[68vh] bg-[#2D292B] text-white px-6 py-8 rounded-2xl shadow-lg flex flex-col">
      <div className="bg-white text-black rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-[15px]">Total Minted</span>
          <span className="text-[15px]">137 / 500</span>
        </div>
      </div>

      <div className="space-y-7 flex-grow">
        {/* Whitelist 1 Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="bg-[#E0F1B4] text-black px-4 py-1.5 rounded-lg text-[14px]">Whitelist 1</span>
            <div className="bg-[#FFE5E5] text-[#FF6B6B] px-4 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[14px]">Not Eligible</span>
              <span role="img" aria-label="not eligible" className="text-[14px]">✕</span>
            </div>
          </div>
          <div className="flex justify-between text-[14px] text-white">
            <span>1 Per Wallet</span>
            <div className="flex items-center gap-1">
              <span>Mint Price</span>
              <span>1 MON</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white">
            <span>Ends in</span>
            <div className="flex gap-1">
              {["00", "00", "00"].map((num, index) => (
                <div key={index} className="bg-[#F7FEE0] text-black px-3 py-1.5 rounded text-center w-[40px]">{num}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#3D393B]"></div>

        {/* Whitelist 2 Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="bg-[#E0F1B4] text-black px-4 py-1.5 rounded-lg text-[14px]">Whitelist 2</span>
            <div className="bg-[#FFE5E5] text-[#FF6B6B] px-4 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[14px]">Not Eligible</span>
              <span role="img" aria-label="not eligible" className="text-[14px]">✕</span>
            </div>
          </div>
          <div className="flex justify-between text-[14px] text-white">
            <span>1 Per Wallet</span>
            <div className="flex items-center gap-1">
              <span>Mint Price</span>
              <span>1 MON</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white">
            <span>Ends in</span>
            <div className="flex gap-1">
              {["00", "00", "00"].map((num, index) => (
                <div key={index} className="bg-[#F7FEE0] text-black px-3 py-1.5 rounded text-center w-[40px]">{num}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#3D393B]"></div>

        {/* Public Sale Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <span className="bg-[#E0F1B4] text-black px-4 py-1.5 rounded-lg text-[14px]">Public</span>
            <div className="bg-[#E5FFE5] text-[#4CAF50] px-4 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-[14px]">Eligible</span>
              <span role="img" aria-label="eligible" className="text-[14px]">✓</span>
            </div>
          </div>
          <div className="flex justify-between text-[14px] text-white">
            <span>1 Per Wallet</span>
            <div className="flex items-center gap-1">
              <span>Mint Price</span>
              <span>10 MON</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[14px] text-white">
            <span>Start</span>
            <div className="flex gap-1">
              {["00", "00", "00"].map((num, index) => (
                <div key={index} className="bg-[#F7FEE0] text-black px-3 py-1.5 rounded text-center w-[40px]">{num}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-[#9A9A9A] text-white py-3 rounded-lg mt-6 text-[14px]">
        Mint
      </button>
    </div>
  );
};

function App() {
  return (
    <div className="h-screen overflow-hidden bg-[#E0F1B4] relative">
      {/* Left top corner image */}
      <div className="absolute top-0 left-0">
        <img 
          src="/web 1.png" 
          alt="Web" 
          className="w-[52vw] h-[52vw] object-cover"
        />
      </div>
      
      {/* Right side mint area */}
      <div className="absolute right-[10vw] flex flex-col items-end" style={{ top: '4vw', gap: '3vw' }}>
        <div>
          <WalletButton />
        </div>
        <div className="flex flex-col items-center" style={{ gap: '2vw' }}>
          <img src="/monbeans-logo.png" alt="MonBeans" className="h-8" />
          <MintInfo />
        </div>
      </div>
    </div>
  );
}

export default App;