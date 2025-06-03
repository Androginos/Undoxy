// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "erc721a/contracts/ERC721A.sol";

contract NFTFCFS is ERC721A, ERC2981, Ownable {
    uint256 public wlStartTime;
    uint256 public fcfsStartTime;
    uint256 public publicStartTime;

    uint256 public maxSupply = 555; 

    uint256 public wlMintPrice = 0.00001 ether;
    uint256 public fcfsMintPrice = 0.0001 ether;
    uint256 public publicMintPrice = 0.0001 ether;

    string public baseURI;

    mapping(address => bool) public isWhitelist1;
    mapping(address => bool) public isWhitelist2;
    mapping(address => bool) public hasMintedWL;
    mapping(address => bool) public hasMintedFCFS;
    mapping(address => bool) public hasMintedPublic;

    address public royaltyReceiver;

    event MintPriceUpdated(uint256 newPrice, string phase);
    event TimesUpdated(uint256 wlStart, uint256 fcfsStart, uint256 publicStart);
    event WhitelistUpdated(string phase, address[] addresses);
    event BaseURIUpdated(string newBaseURI);
    event RoyaltyReceiverUpdated(address newReceiver);

    constructor(
        uint256 _wlStartTime,
        uint256 _fcfsStartTime,
        uint256 _publicStartTime,
        address[] memory whitelist1Addresses,
        address[] memory whitelist2Addresses,
        string memory _baseURI,
        address _royaltyReceiver
    ) ERC721A("NFTFCFS", "NFCFS") Ownable(msg.sender) {
        wlStartTime = _wlStartTime;
        fcfsStartTime = _fcfsStartTime;
        publicStartTime = _publicStartTime;
        baseURI = _baseURI;
        royaltyReceiver = _royaltyReceiver;

        _setDefaultRoyalty(_royaltyReceiver, 500);

        for (uint i = 0; i < whitelist1Addresses.length; i++) {
            isWhitelist1[whitelist1Addresses[i]] = true;
        }
        for (uint i = 0; i < whitelist2Addresses.length; i++) {
            isWhitelist2[whitelist2Addresses[i]] = true;
        }

        _safeMint(_royaltyReceiver, 55); // maxSupply'a dahil
    }

    function mintWL() external payable {
        require(block.timestamp >= wlStartTime, "WL mint henuz baslamadi");
        require(block.timestamp < fcfsStartTime, "WL mint sona erdi");
        require(isWhitelist1[msg.sender], "Whitelist 1'de yoksun!");
        require(!hasMintedWL[msg.sender], "Zaten mint edildi");
        require(totalSupply() + 1 <= maxSupply, "Max supply asildi");
        require(msg.value >= wlMintPrice, "Yetersiz MON");

        hasMintedWL[msg.sender] = true;
        _safeMint(msg.sender, 1);
        payable(royaltyReceiver).transfer(msg.value);
    }

    function mintFCFS() external payable {
        require(block.timestamp >= fcfsStartTime, "FCFS mint henuz baslamadi");
        require(block.timestamp < publicStartTime, "FCFS mint sona erdi");
        require(isWhitelist2[msg.sender], "Whitelist 2'de yoksun!");
        require(!hasMintedFCFS[msg.sender], "Zaten mint edildi");
        require(totalSupply() + 1 <= maxSupply, "Max supply asildi");
        require(msg.value >= fcfsMintPrice, "Yetersiz MON");

        hasMintedFCFS[msg.sender] = true;
        _safeMint(msg.sender, 1);
        payable(royaltyReceiver).transfer(msg.value);
    }

    function mintPublic() external payable {
        require(block.timestamp >= publicStartTime, "Public mint henuz baslamadi");
        require(!hasMintedPublic[msg.sender], "Zaten mint edildi");
        require(totalSupply() + 1 <= maxSupply, "Max supply asildi");
        require(msg.value >= publicMintPrice, "Yetersiz MON");

        hasMintedPublic[msg.sender] = true;
        _safeMint(msg.sender, 1);
        payable(royaltyReceiver).transfer(msg.value);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, _toString(tokenId)));
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
        emit BaseURIUpdated(_baseURI);
    }

    function setMintPrices(
        uint256 _wlPrice,
        uint256 _fcfsPrice,
        uint256 _publicPrice
    ) external onlyOwner {
        wlMintPrice = _wlPrice;
        fcfsMintPrice = _fcfsPrice;
        publicMintPrice = _publicPrice;
        emit MintPriceUpdated(_wlPrice, "WL");
        emit MintPriceUpdated(_fcfsPrice, "FCFS");
        emit MintPriceUpdated(_publicPrice, "Public");
    }

    function setTimes(
        uint256 _wlStart,
        uint256 _fcfsStart,
        uint256 _publicStart
    ) external onlyOwner {
        require(_wlStart < _fcfsStart && _fcfsStart < _publicStart, unicode"Geçersiz zaman sıralaması");
        wlStartTime = _wlStart;
        fcfsStartTime = _fcfsStart;
        publicStartTime = _publicStart;
        emit TimesUpdated(_wlStart, _fcfsStart, _publicStart);
    }

    function setWhitelist1(address[] memory addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            isWhitelist1[addresses[i]] = true;
        }
        emit WhitelistUpdated("WL1", addresses);
    }

    function setWhitelist2(address[] memory addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            isWhitelist2[addresses[i]] = true;
        }
        emit WhitelistUpdated("WL2", addresses);
    }

    // Yeni: Whitelist'ten çıkarma fonksiyonları
    function removeFromWhitelist1(address[] memory addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            isWhitelist1[addresses[i]] = false;
        }
    }

    function removeFromWhitelist2(address[] memory addresses) external onlyOwner {
        for (uint i = 0; i < addresses.length; i++) {
            isWhitelist2[addresses[i]] = false;
        }
    }

    function setRoyaltyReceiver(address newReceiver) external onlyOwner {
        require(newReceiver != address(0), "Gecersiz adres");
        royaltyReceiver = newReceiver;
        _setDefaultRoyalty(newReceiver, 500);
        emit RoyaltyReceiverUpdated(newReceiver);
    }

    function setRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getTimes() external view returns (uint256, uint256, uint256, uint256) {
        return (block.timestamp, wlStartTime, fcfsStartTime, publicStartTime);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Yeni: receive fonksiyonu
    receive() external payable {
        payable(royaltyReceiver).transfer(msg.value);
    }
}
