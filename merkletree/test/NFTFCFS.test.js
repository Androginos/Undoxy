const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTFCFS", function () {
    let NFTFCFS;
    let nftFCFS;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let addrs;
    let snapshotId;

    const wlStartTime = Math.floor(Date.now() / 1000) + 3600; // 1 saat sonra
    const fcfsStartTime = wlStartTime + 3600; // WL'den 1 saat sonra
    const publicStartTime = fcfsStartTime + 3600; // FCFS'den 1 saat sonra
    const baseURI = "ipfs://QmBaseURI/";
    const notRevealedURI = "ipfs://QmNotRevealedURI/";
    const mintPrice = ethers.parseEther("0.01");

    beforeEach(async function () {
        // Kontratı deploy etmeden önce test hesaplarını al
        [owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();

        // Kontratı deploy et
        NFTFCFS = await ethers.getContractFactory("NFTFCFS");
        nftFCFS = await NFTFCFS.deploy(
            wlStartTime,
            fcfsStartTime,
            publicStartTime,
            [addr1.address], // WL1 listesi
            [addr2.address], // WL2 listesi
            baseURI,
            notRevealedURI,
            owner.address // Royalty alıcısı
        );
        await nftFCFS.waitForDeployment();

        // Her testten önce snapshot al
        snapshotId = await ethers.provider.send("evm_snapshot", []);

        // EVM'in mevcut blok zamanını al
        const blockNum = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNum);
        const currentTime = BigInt(block.timestamp);

        // Zamanı ilerlet
        await ethers.provider.send("evm_increaseTime", [60]);
        await ethers.provider.send("evm_mine");

        // Zamanları kontrol et
        const [blockTime, wlTime, fcfsTime, publicTime] = await nftFCFS.getTimes();
        console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
        console.log("WL Start Time:", new Date(Number(wlTime) * 1000).toLocaleString());
        console.log("FCFS Start Time:", new Date(Number(fcfsTime) * 1000).toLocaleString());
        console.log("Public Start Time:", new Date(Number(publicTime) * 1000).toLocaleString());
    });

    afterEach(async function () {
        // Her testten sonra snapshot'a geri dön
        await ethers.provider.send("evm_revert", [snapshotId]);
    });

    describe("Deployment", function () {
        it("Doğru isim ve sembol ile deploy edilmeli", async function () {
            expect(await nftFCFS.name()).to.equal("NFTFCFS");
            expect(await nftFCFS.symbol()).to.equal("NFCFS");
        });

        it("Başlangıç değerleri doğru ayarlanmalı", async function () {
            expect(await nftFCFS.wlStartTime()).to.equal(wlStartTime);
            expect(await nftFCFS.fcfsStartTime()).to.equal(fcfsStartTime);
            expect(await nftFCFS.publicStartTime()).to.equal(publicStartTime);
            expect(await nftFCFS.baseURI()).to.equal(baseURI);
            expect(await nftFCFS.notRevealedURI()).to.equal(notRevealedURI);
        });

        it("Whitelist listeleri doğru ayarlanmalı", async function () {
            expect(await nftFCFS.isWhitelist1(addr1.address)).to.be.true;
            expect(await nftFCFS.isWhitelist2(addr2.address)).to.be.true;
        });
    });

    describe("Mint İşlemleri", function () {
        it("WL mint zamanından önce mint yapılamamalı", async function () {
            await expect(
                nftFCFS.connect(addr1).mintWL({ value: mintPrice })
            ).to.be.revertedWith("WL mint henuz baslamadi");
        });

        it("WL listesinde olmayan kullanıcı mint yapamamalı", async function () {
            // Zamanı ilerlet
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            await expect(
                nftFCFS.connect(addr3).mintWL({ value: mintPrice })
            ).to.be.revertedWith("Whitelist 1'de yoksun!");
        });

        it("WL listesindeki kullanıcı doğru fiyatla mint yapabilmeli", async function () {
            // Zamanı ilerlet
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            await nftFCFS.connect(addr1).mintWL({ value: mintPrice });
            expect(await nftFCFS.balanceOf(addr1.address)).to.equal(1);
        });
    });

    describe("Reveal İşlemleri", function () {
        it("Sadece owner reveal yapabilmeli", async function () {
            await expect(
                nftFCFS.connect(addr1).reveal()
            ).to.be.revertedWithCustomError(nftFCFS, "OwnableUnauthorizedAccount");
        });

        it("Owner reveal yapabilmeli", async function () {
            await nftFCFS.reveal();
            expect(await nftFCFS.revealed()).to.be.true;
        });

        it("Reveal öncesi ve sonrası tokenURI doğru olmalı", async function () {
            // Önce mint yap
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            await nftFCFS.connect(addr1).mintWL({ value: mintPrice });

            // Reveal öncesi
            expect(await nftFCFS.tokenURI(0)).to.equal(notRevealedURI);

            // Reveal sonrası
            await nftFCFS.reveal();
            expect(await nftFCFS.tokenURI(0)).to.equal(baseURI + "0.json");
        });
    });

    describe("Admin İşlemleri", function () {
        it("Mint fiyatları güncellenebilmeli", async function () {
            const newPrice = ethers.parseEther("0.02");
            await nftFCFS.setMintPrices(newPrice, newPrice, newPrice);
            expect(await nftFCFS.wlMintPrice()).to.equal(newPrice);
        });

        it("Zamanlar güncellenebilmeli", async function () {
            const newWlTime = wlStartTime + 7200;
            const newFcfsTime = fcfsStartTime + 7200;
            const newPublicTime = publicStartTime + 7200;
            
            await nftFCFS.setTimes(newWlTime, newFcfsTime, newPublicTime);
            expect(await nftFCFS.wlStartTime()).to.equal(newWlTime);
        });

        it("Whitelist listeleri güncellenebilmeli", async function () {
            const newAddresses = [addr3.address];
            await nftFCFS.setWhitelist1(newAddresses);
            expect(await nftFCFS.isWhitelist1(addr3.address)).to.be.true;
        });
    });

    describe("FCFS Mint", function () {
        it("Should allow FCFS mint for whitelisted address", async function () {
            // FCFS aralığına gir
            let [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            if (Number(blockTime) < Number(fcfsTime)) {
                await ethers.provider.send("evm_increaseTime", [Number(fcfsTime) - Number(blockTime) + 1]);
                await ethers.provider.send("evm_mine");
            } else if (Number(blockTime) >= Number(publicTime)) {
                throw new Error("Block time FCFS aralığını geçti");
            }

            // Zamanları kontrol et
            [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            console.log("\nFCFS Mint Test - Zamanlar:");
            console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
            console.log("FCFS Start Time:", new Date(Number(fcfsTime) * 1000).toLocaleString());
            console.log("Public Start Time:", new Date(Number(publicTime) * 1000).toLocaleString());

            // FCFS mint işlemini dene
            const mintPrice = await nftFCFS.fcfsMintPrice();
            await expect(nftFCFS.connect(addr2).mintFCFS({ value: mintPrice }))
                .to.emit(nftFCFS, "Transfer")
                .withArgs(ethers.ZeroAddress, addr2.address, 0);

            // Mint durumunu kontrol et
            const hasMinted = await nftFCFS.hasMintedFCFS(addr2.address);
            expect(hasMinted).to.be.true;

            // NFT sahipliğini kontrol et
            const owner = await nftFCFS.ownerOf(0);
            expect(owner).to.equal(addr2.address);
        });

        it("Should not allow FCFS mint for non-whitelisted address", async function () {
            // FCFS aralığına gir
            let [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            if (Number(blockTime) < Number(fcfsTime)) {
                await ethers.provider.send("evm_increaseTime", [Number(fcfsTime) - Number(blockTime) + 1]);
                await ethers.provider.send("evm_mine");
            } else if (Number(blockTime) >= Number(publicTime)) {
                throw new Error("Block time FCFS aralığını geçti");
            }

            // Zamanları kontrol et
            [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            console.log("\nNon-Whitelist Test - Zamanlar:");
            console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
            console.log("FCFS Start Time:", new Date(Number(fcfsTime) * 1000).toLocaleString());
            console.log("Public Start Time:", new Date(Number(publicTime) * 1000).toLocaleString());

            // FCFS mint işlemini dene
            const mintPrice = await nftFCFS.fcfsMintPrice();
            await expect(nftFCFS.connect(addr1).mintFCFS({ value: mintPrice }))
                .to.be.revertedWith("Whitelist 2'de yoksun!");
        });

        it("Should not allow FCFS mint before start time", async function () {
            // FCFS başlamadan önceyiz, garantiye almak için block time'ı fcfsTime'dan 10 saniye önceye çek
            let [blockTime, , fcfsTime, ] = await nftFCFS.getTimes();
            if (Number(blockTime) >= Number(fcfsTime)) {
                // Zamanı geri alamayız, test baştan başlasın
                throw new Error("Block time FCFS başlangıcından sonra, test baştan başlatılmalı");
            }
            // Zamanları kontrol et
            [blockTime, , fcfsTime, ] = await nftFCFS.getTimes();
            console.log("\nBefore Start Time Test - Zamanlar:");
            console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
            console.log("FCFS Start Time:", new Date(Number(fcfsTime) * 1000).toLocaleString());

            const mintPrice = await nftFCFS.fcfsMintPrice();
            await expect(nftFCFS.connect(addr2).mintFCFS({ value: mintPrice }))
                .to.be.revertedWith("FCFS mint henuz baslamadi");
        });

        it("Should not allow FCFS mint after public start time", async function () {
            // Public aralığına geç
            let [blockTime, , , publicTime] = await nftFCFS.getTimes();
            if (Number(blockTime) < Number(publicTime)) {
                await ethers.provider.send("evm_increaseTime", [Number(publicTime) - Number(blockTime) + 1]);
                await ethers.provider.send("evm_mine");
            }
            // Zamanları kontrol et
            [blockTime, , , publicTime] = await nftFCFS.getTimes();
            console.log("\nAfter Public Time Test - Zamanlar:");
            console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
            console.log("Public Start Time:", new Date(Number(publicTime) * 1000).toLocaleString());

            const mintPrice = await nftFCFS.fcfsMintPrice();
            await expect(nftFCFS.connect(addr2).mintFCFS({ value: mintPrice }))
                .to.be.revertedWith("FCFS mint sona erdi");
        });

        it("Should not allow double FCFS mint", async function () {
            // FCFS aralığına gir
            let [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            if (Number(blockTime) < Number(fcfsTime)) {
                await ethers.provider.send("evm_increaseTime", [Number(fcfsTime) - Number(blockTime) + 1]);
                await ethers.provider.send("evm_mine");
            } else if (Number(blockTime) >= Number(publicTime)) {
                throw new Error("Block time FCFS aralığını geçti");
            }
            // Zamanları kontrol et
            [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            console.log("\nDouble Mint Test - Zamanlar:");
            console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
            console.log("FCFS Start Time:", new Date(Number(fcfsTime) * 1000).toLocaleString());
            console.log("Public Start Time:", new Date(Number(publicTime) * 1000).toLocaleString());

            // İlk mint
            const mintPrice = await nftFCFS.fcfsMintPrice();
            await nftFCFS.connect(addr2).mintFCFS({ value: mintPrice });

            // İkinci mint denemesi
            await expect(nftFCFS.connect(addr2).mintFCFS({ value: mintPrice }))
                .to.be.revertedWith("Zaten mint edildi");
        });

        it("Should not allow FCFS mint with insufficient payment", async function () {
            // FCFS aralığına gir
            let [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            if (Number(blockTime) < Number(fcfsTime)) {
                await ethers.provider.send("evm_increaseTime", [Number(fcfsTime) - Number(blockTime) + 1]);
                await ethers.provider.send("evm_mine");
            } else if (Number(blockTime) >= Number(publicTime)) {
                throw new Error("Block time FCFS aralığını geçti");
            }
            // Zamanları kontrol et
            [blockTime, , fcfsTime, publicTime] = await nftFCFS.getTimes();
            console.log("\nInsufficient Payment Test - Zamanlar:");
            console.log("Block Time:", new Date(Number(blockTime) * 1000).toLocaleString());
            console.log("FCFS Start Time:", new Date(Number(fcfsTime) * 1000).toLocaleString());
            console.log("Public Start Time:", new Date(Number(publicTime) * 1000).toLocaleString());

            const mintPrice = await nftFCFS.fcfsMintPrice();
            const insufficientPrice = mintPrice / BigInt(2); // Fiyatın yarısını gönder
            
            await expect(nftFCFS.connect(addr2).mintFCFS({ value: insufficientPrice }))
                .to.be.revertedWith("Yetersiz MON");
        });
    });
}); 