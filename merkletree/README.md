# NFT Smart Contract

Bu klasör NFT kontratı ve deploy işlemleri için gerekli dosyaları içerir.

## Klasör Yapısı

- `contracts/`: Smart contract dosyaları
  - `NFTFCFS.sol`: Ana NFT kontratı
- `scripts/`: Deploy ve etkileşim scriptleri
  - `deploy.js`: Kontrat deploy scripti
  - `interact.js`: Kontrat etkileşim scripti
- `deployConfig.json`: Deploy ayarları
- `deployInfo.json`: Deploy sonrası bilgiler

## Kurulum

```bash
npm install
```

## Deploy

1. `.env` dosyasını oluşturun:
```
RPC_URL=https://rpc.testnet.monad.xyz
PRIVATE_KEY=your_private_key
```

2. `deployConfig.json` dosyasını düzenleyin:
```json
{
    "wl_start": "03:47",
    "fcfs_start": "03:55",
    "public_start": "03:57",
    "baseURI": "ipfs://your_metadata_cid/",
    "notRevealedURI": "ipfs://your_hidden_metadata_cid.json",
    "wl1": ["address1", "address2"],
    "wl2": ["address3", "address4"],
    "royaltyReceiver": "your_address"
}
```

3. Deploy edin:
```bash
npx hardhat run scripts/deploy.js --network monad
```

## Kontrat Etkileşimi

Reveal yapmak için:
```bash
npx hardhat run scripts/interact.js --network monad
```

## Frontend Entegrasyonu

Deploy sonrası oluşan `deployInfo.json` dosyasındaki bilgiler otomatik olarak frontend'in `config.json` dosyasına aktarılır.
