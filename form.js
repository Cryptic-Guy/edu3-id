import { userAddress } from './wallet.js';

// Upload encrypted string to Pinata - no change needed
async function uploadToPinata(encryptedString, pinataJWT) {
  const blob = new Blob([encryptedString], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, 'encryptedCertificate.txt');

  const metadata = JSON.stringify({
    name: 'Encrypted Certificate',
    keyvalues: { encrypted: 'true' },
  });
  formData.append('pinataMetadata', metadata);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pinataJWT}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return data.IpfsHash;
}

// Placeholder minting logic (unchanged)
async function mintNFT(cid, secretKey, metadata) {
  console.log('Minting NFT...');
  console.log('IPFS CID:', cid);
  console.log('Encryption Key:', secretKey);
  console.log('Metadata:', metadata);
  // TODO: Actual smart contract mint logic is in mint.js
}

export function handleFormSubmission(certificateForm, uploadStatus, encryptImage) {
  certificateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userAddress) {
      alert('Please connect your wallet first!');
      return;
    }
    const studentName = document.getElementById('studentName').value.trim();
    const studentGR = document.getElementById('studentGR').value.trim();
    const branch = document.getElementById('branch').value.trim();
    const courseName = document.getElementById('courseName').value.trim();
    const certificateImage = document.getElementById('certificateImage').files[0];
    if (!certificateImage) {
      alert('Please select a certificate image.');
      return;
    }

    // Generate passphrase (UUID)
    const secretKey = window.crypto.randomUUID();

    uploadStatus.innerHTML = 'Encrypting and uploading to Pinata, please wait...';

    try {
      await encryptImage(certificateImage, secretKey, async (encryptedBase64) => {
        // Upload encrypted string to Pinata
        // Pass encrypted string as plain base64 string
        // (You might want to format encryptedBase64 properly, e.g., as binary or base64 string blob)
        const pinataJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4Yjg5ZjUyZi0yM2Y5LTRhMDUtOGQ2Ny01OGI1ZDMwOWQwY2UiLCJlbWFpbCI6Imt1bGRlZXBwYXRoYWsyODA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJmNDI0MTk0ZDhhOTdlYzFjNjJhZiIsInNjb3BlZEtleVNlY3JldCI6ImMzZWM0MDQ4YzRkMDkwODg2OWU2NDJjODRmZGNkYmVhMGEzNDM5Y2UxYTEwMGZkNWFjZDkxYTIyODM2OTlmOWEiLCJleHAiOjE3OTMyMTA0NzF9.20r6rUqHO0gpdLWW4ZPI9Z5ogXJuFSJ7qzn5QLfhd_M';
        const cid = await uploadToPinata(encryptedBase64, pinataJWT);

        window.currentCID = cid; // For mint.js integration
        document.getElementById('mintNFTBtn').disabled = false; // Enable Mint button

        const shortEncrypted = encryptedBase64.slice(0, 4) + '...' + encryptedBase64.slice(-4);

        uploadStatus.innerHTML = `
          Image encrypted and uploaded to IPFS.<br>
          IPFS CID: <code>${cid}</code><br>
          Encryption Key (store securely!): ${secretKey}<br>
          Encrypted Data (Base64): <code id="encryptedShort">${shortEncrypted}</code>
          <button id="copyBtn" style="margin-left:10px;">Copy</button>
        `;

        const copyBtn = document.getElementById('copyBtn');
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(encryptedBase64).then(() => {
            copyBtn.textContent = 'Copied ✔️';
            setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
          });
        });

        uploadStatus.innerHTML += '<br>Congrats for encrypting!';
      });
    } catch (err) {
      uploadStatus.textContent = 'Encrypting failed: ' + err.message;
    }
  });
}
