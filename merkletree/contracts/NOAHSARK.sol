// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "erc721a/contracts/ERC721A.sol";

contract NOAHSARK is ERC721A, ERC2981, Ownable {
    uint256 public wlStartTime;
    uint256 public fcfsStartTime;
    uint256 public publicStartTime;

    uint256 public maxSupply = 555; 

    uint256 public wlMintPrice = 0.01 ether;
    uint256 public fcfsMintPrice = 0.015 ether;
    uint256 public publicMintPrice = 0.02 ether;

    string public baseURI;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasMintedWL;
    mapping(address => bool) public hasMintedFCFS;
    mapping(address => bool) public hasMintedPublic;

    constructor(
        uint256 _wlStartTime,
        uint256 _fcfsStartTime,
        uint256 _publicStartTime,
        string memory _baseURI,
        address _royaltyReceiver
    ) ERC721A("NOAHSARK", "NOAH") Ownable(msg.sender) {
        wlStartTime = _wlStartTime;
        fcfsStartTime = _fcfsStartTime;
        publicStartTime = _publicStartTime;
        baseURI = _baseURI;
        _setDefaultRoyalty(_royaltyReceiver, 500); // 5% royalty
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function setMintPrices(
        uint256 _wlMintPrice,
        uint256 _fcfsMintPrice,
        uint256 _publicMintPrice
    ) external onlyOwner {
        wlMintPrice = _wlMintPrice;
        fcfsMintPrice = _fcfsMintPrice;
        publicMintPrice = _publicMintPrice;
    }

    function setStartTimes(
        uint256 _wlStartTime,
        uint256 _fcfsStartTime,
        uint256 _publicStartTime
    ) external onlyOwner {
        wlStartTime = _wlStartTime;
        fcfsStartTime = _fcfsStartTime;
        publicStartTime = _publicStartTime;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function mintWL(bytes32[] calldata _proof) external payable {
        require(block.timestamp >= wlStartTime, "WL mint not started");
        require(block.timestamp < fcfsStartTime, "WL mint ended");
        require(!hasMintedWL[msg.sender], "Already minted in WL");
        require(msg.value >= wlMintPrice, "Insufficient payment");
        require(totalSupply() + 1 <= maxSupply, "Max supply reached");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_proof, merkleRoot, leaf), "Invalid proof");

        hasMintedWL[msg.sender] = true;
        _mint(msg.sender, 1);
    }

    function mintFCFS(bytes32[] calldata _proof) external payable {
        require(block.timestamp >= fcfsStartTime, "FCFS mint not started");
        require(block.timestamp < publicStartTime, "FCFS mint ended");
        require(!hasMintedFCFS[msg.sender], "Already minted in FCFS");
        require(msg.value >= fcfsMintPrice, "Insufficient payment");
        require(totalSupply() + 1 <= maxSupply, "Max supply reached");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_proof, merkleRoot, leaf), "Invalid proof");

        hasMintedFCFS[msg.sender] = true;
        _mint(msg.sender, 1);
    }

    function mintPublic() external payable {
        require(block.timestamp >= publicStartTime, "Public mint not started");
        require(!hasMintedPublic[msg.sender], "Already minted in public");
        require(msg.value >= publicMintPrice, "Insufficient payment");
        require(totalSupply() + 1 <= maxSupply, "Max supply reached");

        hasMintedPublic[msg.sender] = true;
        _mint(msg.sender, 1);
    }

    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
} 