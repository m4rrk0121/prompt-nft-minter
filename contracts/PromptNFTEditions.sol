// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PromptNFTEditions
 * @dev ERC1155 NFT contract for creating editions with prompts
 *
 * _  _______ _   _  _____    ____  ______            _____  ______  _____ 
 *| |/ /_   _| \ | |/ ____|  / __ \|  ____|     /\   |  __ \|  ____|/ ____|
 *| ' /  | | |  \| | |  __  | |  | | |__       /  \  | |__) | |__  | (___  
 *|  <   | | | . ` | | |_ | | |  | |  __|     / /\ \ |  ___/|  __|  \___ \ 
 *| . \ _| |_| |\  | |__| | | |__| | |       / ____ \| |    | |____ ____) |
 *|_|\_\_____|_| \_|\_____|  \____/|_|      /_/    \_\_|    |______|_____/ 
 *                                                                        
 *
 */
contract PromptNFTEditions is ERC1155, Ownable {
    // Counter for token types - uint32 is plenty for 100,000 NFTs
    uint32 private _tokenIdCounter;
    
    // Mapping from token ID to metadata URI
    mapping(uint32 => string) private _tokenURIs;
    
    // Mapping from token ID to prompt
    mapping(uint32 => string) public tokenPrompts;
    
    // Event emitted when new edition is created
    event EditionCreated(uint32 tokenId, uint256 amount, string prompt, string tokenURI);
    
    constructor() ERC1155("") Ownable(msg.sender) {}
    
    /**
     * @dev Creates a new edition of NFTs (with gas optimization)
     * @param recipient Address that will receive the NFTs
     * @param amount Number of copies to mint
     * @param tokenURI URI pointing to the token metadata on IPFS
     * @param prompt The prompt associated with this NFT (can be empty)
     * @return The ID of the newly created token type
     */
    function createEdition(
        address recipient,
        uint256 amount,
        string calldata tokenURI,
        string calldata prompt
    ) public onlyOwner returns (uint32) {
        uint32 newTokenId = _tokenIdCounter++;
        
        _mint(recipient, newTokenId, amount, "");
        
        _tokenURIs[newTokenId] = tokenURI;
        tokenPrompts[newTokenId] = prompt;
        
        emit EditionCreated(newTokenId, amount, prompt, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch creates multiple editions in a single transaction (saves gas)
     * @param recipients Array of recipient addresses
     * @param amounts Array of edition sizes
     * @param tokenURIs Array of token URIs
     * @param prompts Array of prompts
     * @return Array of created token IDs
     */
    function batchCreateEditions(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string[] calldata tokenURIs,
        string[] calldata prompts
    ) external onlyOwner returns (uint32[] memory) {
        uint256 count = recipients.length;
        require(count == amounts.length && count == tokenURIs.length && count == prompts.length, 
                "Parameter length mismatch");
        
        uint32[] memory tokenIds = new uint32[](count);
        
        for (uint256 i = 0; i < count; i++) {
            tokenIds[i] = _internalCreateEdition(recipients[i], amounts[i], tokenURIs[i], prompts[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Internal function to create an edition
     */
    function _internalCreateEdition(
        address recipient,
        uint256 amount,
        string calldata tokenURI,
        string calldata prompt
    ) private returns (uint32) {
        uint32 newTokenId = _tokenIdCounter++;
        
        _mint(recipient, newTokenId, amount, "");
        
        _tokenURIs[newTokenId] = tokenURI;
        tokenPrompts[newTokenId] = prompt;
        
        emit EditionCreated(newTokenId, amount, prompt, tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Returns the URI for a token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[uint32(tokenId)];
    }
    
    /**
     * @dev Gets the prompt used for a token ID
     */
    function getPromptForToken(uint256 tokenId) public view returns (string memory) {
        return tokenPrompts[uint32(tokenId)];
    }
}