export let userAddress = null;

const amoyTestnetParams = {
  chainId: '0x13882', // 80002 hex
  chainName: 'Amoy Testnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'], // Please update with actual RPC if different
  blockExplorerUrls: ['https://amoyscan.io'], // Update if there's a block explorer URL
  blockGasLimit: '0x3938700', // Hex for 60000000
};

export async function connectWallet(connectWalletBtn, walletAddressDiv) {
  if (window.ethereum) {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Check the network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== amoyTestnetParams.chainId) {
        try {
          // Try to switch to Amoy Testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: amoyTestnetParams.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            // Add Amoy Testnet if not already added
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [amoyTestnetParams],
            });
          } else {
            throw switchError;
          }
        }
      }

      userAddress = accounts[0];
      walletAddressDiv.textContent = 'Connected Wallet: ' + userAddress;
      connectWalletBtn.disabled = true;
    } catch (err) {
      alert('Connection rejected or network error: ' + err.message);
    }
  } else {
    alert('MetaMask not detected. Please install MetaMask.');
  }
}