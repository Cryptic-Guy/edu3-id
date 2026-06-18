// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  for (let b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  let binary = atob(base64);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// Derive key from passphrase
async function deriveKey(secretKey) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("your-salt-here"), // Use a unique, securely stored salt!
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt an image file
export async function encryptImage(file, secretKey, callback) {
  const reader = new FileReader();
  reader.onload = async function (e) {
    const fileArrBuffer = e.target.result;
    const key = await deriveKey(secretKey);
    // Generate random IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    // Encrypt
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      fileArrBuffer
    );
    // Concatenate IV + ciphertext, then base64
    const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(cipherBuffer), iv.length);
    callback(arrayBufferToBase64(combined.buffer));
  };
  reader.readAsArrayBuffer(file);
}