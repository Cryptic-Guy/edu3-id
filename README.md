# Edu3-ID: Decentralized Credential Vault Protocol

Edu3-ID is a privacy-first, decentralized academic credential issuance and verification protocol. It bridges the gap between official institutional certification and student-controlled data privacy by combining **ERC-721 NFTs** with **AES-GCM client-side encryption** and **IPFS storage (via Pinata / Web3.Storage)**.

With Edu3-ID, educational institutions can issue secure certificates as NFTs, while students retain absolute control over who views their academic data via local cryptographic decryption and shareable verification links.

---

## 🚀 Key Features

- **Double-Layer Security Architecture**: Certificates and student metadata are stored encrypted on IPFS using **256-bit AES-GCM** keys derived via **PBKDF2**. The public blockchain stores only the immutable IPFS pointer (`ipfs://CID`), keeping sensitive student data invisible to the public ledger.
- **Institutional Minting Control**: The underlying Solidity smart contract enforces strict access boundaries using OpenZeppelin's `Ownable` pattern, ensuring that only verified college administrator wallets can register certificates.
- **Absolute Student Privacy**: No raw student information or certificate images are exposed on public IPFS gateways. Unlocking and viewing certificates happens strictly on the client side.
- **Zero-Server Verifier Links**: Students can generate unique verification links using an encoded URI payload (`#key=...`). Because fragment identifiers (`#`) are handled natively inside the browser, the private decryption key is never transmitted across the network or stored on external servers.
- **Modern Glassmorphic UI**: Designed with a sleek, futuristic dark-theme interface utilizing custom CSS transitions and responsive grid layouts—completely independent of heavy frontend frameworks.

---

## 🛠️ Tech Stack & Frameworks

- **Smart Contract Language**: Solidity `^0.8.0` (Inherits OpenZeppelin `ERC721URIStorage` and `Ownable`)
- **Blockchain Network**: Deployed on Polygon Amoy Testnet (Contract Address: `0xedE54d81fbe4D4Ed42fe45A1C89F1356f42A7821`)
- **Web3 Interface**: `Ethers.js (v6.7.0)` for MetaMask provider connections and smart contract interaction.
- **Storage Layer**: IPFS decentralized storage protocol via Pinata API wrappers.
- **Cryptography**: Native Web Crypto API (`window.crypto.subtle`) for bulletproof browser encryption alongside `CryptoJS` fallback modules.

---

## 📂 Project Architecture

```bash
├── index.html          # Protocol portal and combined landing layout
├── admin.html          # College Administrator Portal (Issue & upload workflows)
├── student.html        # Student Credentials Portal (Unlock & share workflows)
├── main.js             # Core client router orchestrating connection states & token lookups
├── mint.js             # Web3/Ethers ledger compiler handling contract instantiation & minting
├── encrypt.js          # Cryptographic core (PBKDF2 key-derivation & AES-GCM encryption)
├── form.js             # Multi-part form handler & Pinata IPFS payload builder
├── contractABI.json    # Compiled JSON ABI interface for the Edu3IDCertificate smart contract
├── sc.ignore           # Solidity source code file for the contract registry
└── style.css           # Global typography baseline and micro-layout elements
