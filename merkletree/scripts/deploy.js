require("dotenv").config();
const { ethers } = require("hardhat");
const { JsonRpcProvider } = require("ethers");
const fs = require("fs");
const path = require("path");

// deployConfig.json dosyasından ayarları oku
const config = JSON.parse(fs.readFileSync("deployConfig.json", "utf8"));

// CID'yi buraya yaz
const METADATA_CID = config.baseURI;
const ROYALTY_RECEIVER = config.royaltyReceiver;

// Saatleri Unix timestamp'e çevir
function getTimestampFromTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    
    // UTC saatini al
    const currentUTCHours = now.getUTCHours();
    const currentUTCMinutes = now.getUTCMinutes();
    
    // Hedef tarihi UTC olarak oluştur
    const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes));

    // Eğer belirtilen saat şu anki UTC saatten önceyse, bir sonraki güne ayarla
    if (hours < currentUTCHours || (hours === currentUTCHours && minutes <= currentUTCMinutes)) {
        targetDate.setUTCDate(targetDate.getUTCDate() + 1);
    }

    // Saati doğru şekilde ayarla
    targetDate.setUTCHours(hours);
    targetDate.setUTCMinutes(minutes);

    return Math.floor(targetDate.getTime() / 1000);
}

const wlStartTime = getTimestampFromTime(config.wl_start);
const fcfsStartTime = getTimestampFromTime(config.fcfs_start);
const publicStartTime = getTimestampFromTime(config.public_start);

// Whitelist adresleri
const whitelist1Addresses = config.wl1 || [];
const whitelist2Addresses = config.wl2 || [];

// RPC URL (Abstract Testnet)
const ABSTRACT_TESTNET_RPC_URL = process.env.ABSTRACT_TESTNET_RPC_URL || "https://abstract-testnet.g.alchemy.com/v2/8QMlEIAdNyu3vAlf8e7XhoyRRwBiaFr5"; // Kullanıcının sağladığı RPC URL
const provider = new JsonRpcProvider(ABSTRACT_TESTNET_RPC_URL);

async function measureBlockTime() {
  let timestamps = [];
  let blockNumbers = [];
  let elapsed = 0;
  const interval = 3000; // 3 saniye
  const maxDuration = 2 * 60 * 1000; // 2 dakika

  console.log("Abstract Testnet blok süresi ölçümü başlatıldı...");
  
  return new Promise((resolve) => {
    const timer = setInterval(async () => {
      try {
        const block = await provider.getBlock("latest");
        if (block) {
          timestamps.push(block.timestamp);
          blockNumbers.push(block.number);
          console.log("Block:", block.number, "Timestamp:", block.timestamp);

          elapsed += interval;
          if (elapsed >= maxDuration) {
            clearInterval(timer);

            // Ortalama blok süresini hesapla
            let diffs = [];
            for (let i = 1; i < timestamps.length; i++) {
              diffs.push(timestamps[i] - timestamps[i - 1]);
            }
            const avgBlockTime = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            console.log("Ortalama blok süresi (saniye):", avgBlockTime);

            // Zamanları kontrol et
            const lastTimestamp = timestamps[timestamps.length - 1];
            console.log("Son blok zamanı:", lastTimestamp, "UTC:", new Date(lastTimestamp * 1000).toISOString());
            console.log("WL başlangıç zamanı:", wlStartTime, "UTC:", new Date(wlStartTime * 1000).toISOString());
            console.log("FCFS başlangıç zamanı:", fcfsStartTime, "UTC:", new Date(fcfsStartTime * 1000).toISOString());
            console.log("Public başlangıç zamanı:", publicStartTime, "UTC:", new Date(publicStartTime * 1000).toISOString());

            resolve({
              wlStart: wlStartTime,
              fcfsStart: fcfsStartTime,
              publicStart: publicStartTime
            });
          }
        } else {
           console.log("Abstract Testnet için blok bilgisi alınamadı.");
        }
      } catch (error) {
        console.error("Blok süresi ölçümü sırasında hata:", error);
        clearInterval(timer);
        resolve({
           wlStart: wlStartTime,
           fcfsStart: fcfsStartTime,
           publicStart: publicStartTime
        });
      }
    }, interval);
  });
}

async function updateFrontendFiles(contractAddress, whitelist1, whitelist2) {
  try {
    // App.js dosyasını güncelle
    const appJsPath = path.join(__dirname, "..", "..", "Monk-MintPage", "src", "App.js");
    let appJsContent = fs.readFileSync(appJsPath, "utf8");

    // Kontrat adresini güncelle
    appJsContent = appJsContent.replace(
      /const CONTRACT_ADDRESS = ['"].*?['"];/,
      `const CONTRACT_ADDRESS = '${contractAddress}';`
    );

    // Abstract Testnet chain ID'sini güncelle
    appJsContent = appJsContent.replace(
      /const CHAIN_ID = \d+;/,
      `const CHAIN_ID = 11124;` // Abstract Testnet chain ID
    );

    fs.writeFileSync(appJsPath, appJsContent);
    console.log("App.js dosyası güncellendi");

    // MintButton.js dosyasını güncelle
    const mintButtonPath = path.join(__dirname, "..", "..", "Monk-MintPage", "src", "MintButton.js");
    let mintButtonContent = fs.readFileSync(mintButtonPath, "utf8");

    // Whitelist array'ini güncelle
    const whitelist1Str = JSON.stringify(whitelist1, null, 2);
    const whitelist2Str = JSON.stringify(whitelist2, null, 2);
    
    // Whitelist array'ini değiştir
    mintButtonContent = mintButtonContent.replace(
      /const whitelist = \[\s\S]*?\];/,
      `const whitelist = ${whitelist1Str};`
    );

    // Abstract Testnet chain ID'sini güncelle
    mintButtonContent = mintButtonContent.replace(
      /const CHAIN_ID = \d+;/,
      `const CHAIN_ID = 11124;` // Abstract Testnet chain ID
    );

    fs.writeFileSync(mintButtonPath, mintButtonContent);
    console.log("MintButton.js dosyası güncellendi");

    // config.json dosyasını güncelle
    const configPath = path.join(__dirname, "..", "..", "Monk-MintPage", "public", "config.json");
    const deployInfo = JSON.parse(fs.readFileSync("deployInfo.json", "utf8"));
    
    // Abstract Testnet bilgilerini ekle
    const configData = {
      ...deployInfo,
      chainId: 11124,
      chainName: "Abstract Testnet",
      rpcUrl: ABSTRACT_TESTNET_RPC_URL,
      blockExplorerUrl: "https://sepolia.abscan.org" // Abstract Testnet Explorer URL
    };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log("config.json dosyası güncellendi");

  } catch (error) {
    console.error("Frontend dosyaları güncellenirken hata:", error);
  }
}

async function deployContract(times) {
  const [deployer] = await ethers.getSigners();
  console.log("\n=== Deploy Bilgileri ===");
  console.log("Deploy eden adres:", deployer.address);
  console.log("Deploy eden bakiyesi:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH"); // Sembolü ETH olarak değiştir

  const NFTFCFS = await ethers.getContractFactory("NFTFCFS");
  console.log("\nKontrat deploy ediliyor...");
  
  const contract = await NFTFCFS.deploy(
    times.wlStart,
    times.fcfsStart,
    times.publicStart,
    whitelist1Addresses,
    whitelist2Addresses,
    METADATA_CID,
    ROYALTY_RECEIVER
  );

  // Kontratın deploy edilmesini bekle
  console.log("Kontrat deploy ediliyor, lütfen bekleyin...");
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  // Kontrat fonksiyonlarını test et
  console.log("\n=== Kontrat Testleri ===");
  try {
    const wlPrice = await contract.wlMintPrice();
    const fcfsPrice = await contract.fcfsMintPrice();
    const publicPrice = await contract.publicMintPrice();
    
    console.log("WL Mint Fiyatı:", ethers.formatEther(wlPrice), "ETH"); // Sembolü ETH olarak değiştir
    console.log("FCFS Mint Fiyatı:", ethers.formatEther(fcfsPrice), "ETH"); // Sembolü ETH olarak değiştir
    console.log("Public Mint Fiyatı:", ethers.formatEther(publicPrice), "ETH"); // Sembolü ETH olarak değiştir
    
    // Whitelist kontrolleri
    for (const addr of whitelist1Addresses) {
      const isWL1 = await contract.isWhitelist1(addr);
      console.log(`WL1 Kontrol (${addr}):`, isWL1);
    }
    
    for (const addr of whitelist2Addresses) {
      const isWL2 = await contract.isWhitelist2(addr);
      console.log(`WL2 Kontrol (${addr}):`, isWL2);
    }
  } catch (error) {
    console.error("Kontrat test hatası:", error);
  }

  console.log("\n=== Kontrat Bilgileri ===");
  console.log("Kontrat Adresi:", contractAddress);
  console.log("Whitelist Başlangıç:", new Date(times.wlStart * 1000).toLocaleString());
  console.log("FCFS Başlangıç:", new Date(times.fcfsStart * 1000).toLocaleString());
  console.log("Public Başlangıç:", new Date(times.publicStart * 1000).toLocaleString());
  console.log("\nWhitelist 1 adresleri:", whitelist1Addresses);
  console.log("Whitelist 2 adresleri:", whitelist2Addresses);

  // Deploy bilgilerini kaydet
  const deployInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    wlStartTime: times.wlStart,
    fcfsStartTime: times.fcfsStart,
    publicStartTime: times.publicStart,
    whitelist1: whitelist1Addresses,
    whitelist2: whitelist2Addresses,
    deployTime: new Date().toISOString()
  };

  fs.writeFileSync("deployInfo.json", JSON.stringify(deployInfo, null, 2));
  console.log("\nDeploy bilgileri deployInfo.json dosyasına kaydedildi.");

  // Frontend dosyalarını güncelle
  console.log("\nFrontend dosyaları güncelleniyor...");
  await updateFrontendFiles(contractAddress, whitelist1Addresses, whitelist2Addresses);
  
  console.log("\n=== Önemli Not ===");
  console.log("1. Kontrat adresini kopyalayın:", contractAddress);
  console.log("2. Bu adresi frontend'de kullanmak için App.js dosyasında güncelleyin");
  console.log("3. deployInfo.json dosyasında tüm bilgiler saklanmıştır");
}

async function main() {
  try {
    // Blok süresini ölç ve zamanları hesapla
    const times = await measureBlockTime();
    
    // Kontratı deploy et
    await deployContract(times);
  } catch (error) {
    console.error("Deploy hatası:", error);
    process.exitCode = 1;
  }
}

main(); 