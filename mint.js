const ethers = window.ethers;
if (!ethers) throw new Error('Ethers UMD is not loaded!');

import { userAddress } from './wallet.js';

// Replace with your deployed Edu3IDCertificate contract address on Amoy Testnet
const CONTRACT_ADDRESS = '0xede54d81fbe4d4ed42fe45a1c89f1356f42a7821';

let provider;
let signer;
let contract;
let contractABI; // declare contractABI variable

// Load ABI from JSON file dynamically
async function loadABI() {
  const response = await fetch('./contractABI.json');
  contractABI = await response.json();
}

export async function initContract() {
  if (!window.ethereum) {
    alert('Please install MetaMask.');
    return;
  }

  // Load contract ABI first
  await loadABI();

  await window.ethereum.request({ method: 'eth_requestAccounts' });
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
}

export async function mintNFT(cid, callback) {
  if (!contract) throw new Error('Contract not initialized. Call initContract first.');
  if (!userAddress) throw new Error('Wallet not connected.');

  const tokenURI = `ipfs://${cid}`;

  try {
    const tx = await contract.mint(userAddress, tokenURI);
    await tx.wait();
    callback(null, tx.hash);
  } catch (error) {
    callback(error);
  }
}

export function setupMintButton(buttonId, statusDivId) {
  const mintBtn = document.getElementById(buttonId);
  const statusDiv = document.getElementById(statusDivId);

  mintBtn.addEventListener('click', async () => {
    if (!userAddress) {
      alert('Please connect your wallet first.');
      return;
    }
    if (!window.currentCID) {
      alert('No IPFS CID available. Upload certificate first.');
      return;
    }
    statusDiv.textContent = 'Minting NFT, please wait...';

    try {
      await initContract();
      await mintNFT(window.currentCID, (err, txHash) => {
        if (err) {
          statusDiv.textContent = `Minting failed: ${err.message}`;
        } else {
          statusDiv.textContent = `NFT minted successfully! Tx Hash: ${txHash}`;
          mintBtn.disabled = true;
        }
      });
    } catch (err) {
      statusDiv.textContent = `Error: ${err.message}`;
    }
  });
}