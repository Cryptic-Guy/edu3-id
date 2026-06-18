import { connectWallet, userAddress } from './wallet.js';
import { handleFormSubmission } from './form.js';
import { setupMintButton } from './mint.js';
import { encryptImage } from './encrypt.js';

// Configuration for your Smart Contract
const CONTRACT_ADDRESS = "0xedE54d81fbe4D4Ed42fe45A1C89F1356f42A7821";
const ABI = [
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function owner() view returns (address)"
];

window.addEventListener('DOMContentLoaded', () => {
  const connectWalletBtn = document.getElementById('connectWalletBtn');
  const walletAddressDiv = document.getElementById('walletAddress');
  const certificateForm = document.getElementById('certificateForm');
  const uploadStatus = document.getElementById('uploadStatus');

  // --- College Admin Logic ---
  connectWalletBtn.addEventListener('click', () => connectWallet(connectWalletBtn, walletAddressDiv));

  handleFormSubmission(certificateForm, uploadStatus, encryptImage);
  setupMintButton('mintNFTBtn', 'uploadStatus');

  // --- Student Mode Logic ---
  const viewCertBtn = document.getElementById('viewCertBtn');
  const tidInput = document.getElementById('tokenIdInput');
  const keyInput = document.getElementById('secretKeyInput');
  const certDisplay = document.getElementById('certDisplay');
  const certPreviewContainer = document.getElementById('certPreviewContainer');
  const shareLinkBtn = document.getElementById('shareLinkBtn');
  const shareUrlDiv = document.getElementById('shareUrl');

  viewCertBtn.addEventListener('click', async () => {
    const tokenId = tidInput.value;
    const secretKey = keyInput.value;

    if (!tokenId || !secretKey) return alert("Please enter both Token ID and Key");

    try {
      viewCertBtn.innerText = "Unlocking...";

      // 1. Initialize Ethers
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      // 2. Fetch Metadata from Blockchain
      const tokenURI = await contract.tokenURI(tokenId);
      const ipfsUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');

      // 3. Fetch Encrypted Data from IPFS
      const response = await fetch(ipfsUrl);
      const encryptedBase64 = await response.text();

      // 4. Decrypt the Image
      const imageUrl = await decryptImage(encryptedBase64, secretKey);

      // 5. Update UI
      certDisplay.src = imageUrl;
      certPreviewContainer.classList.remove('hidden');
      viewCertBtn.innerText = "Unlock Certificate";

      // 6. Share Link Logic
      shareLinkBtn.onclick = () => {
        // We use the # fragment so the key stays in the browser and isn't sent to a server
        const link = `${window.location.origin}/verify.html?tid=${tokenId}#key=${secretKey}`;
        shareUrlDiv.textContent = "Share this link for verification: " + link;
        shareUrlDiv.classList.remove('hidden');
      };

    } catch (err) {
      console.error(err);
      alert("Verification Failed: Could not decrypt data.");
      viewCertBtn.innerText = "Unlock Certificate";
    }
  });
});

/**
 * Decrypts the Base64 string back into a viewable Image URL.
 * Reverses your encryption logic: Extract IV (12 bytes) + Ciphertext.
 */
async function decryptImage(base64Data, secretKey) {
  // Helper from your existing code or local implementation
  const combined = base64ToArrayBuffer(base64Data);

  // Split IV and Data
  const iv = new Uint8Array(combined.slice(0, 12));
  const ciphertext = combined.slice(12);

  // Derive the same key used during encryption
  const key = await deriveKey(secretKey);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    ciphertext
  );

  const blob = new Blob([decryptedBuffer], { type: 'image/png' });
  return URL.createObjectURL(blob);
}

// Ensure these helpers match your encrypt.js logic exactly
async function deriveKey(secretKey) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(secretKey), "PBKDF2", false, ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("your-salt-here"), iterations: 100000, hash: "SHA-256" },
    keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
  );
}

function base64ToArrayBuffer(base64) {
  let binary = atob(base64);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}