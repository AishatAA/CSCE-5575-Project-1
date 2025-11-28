/* Aishat Arawole */
import React, { useEffect, useMemo, useState } from "react";
import { ethers } from 'ethers';
import { Counter__factory } from './generated/contract-types';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [num, setNum] = useState<number>(0);
  const [slicedArray, setSlicedArray] = useState<string[]>([]);
  const [inputNum, setInputNum] = useState<string>('');
  const [contract, setContract] = useState<any>(null);
  const [fullArrayLength, setFullArrayLength] = useState<number>(0);
  const [contractAddress, setContractAddress] = useState<string>('');

  // Connect to MetaMask
  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const myProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(myProvider);
       
        await myProvider.send('eth_requestAccounts', []);
        const signer = await myProvider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
       
        // Get balance
        const userBalance = await myProvider.getBalance(userAddress);
        setBalance(ethers.formatEther(userBalance));
       
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Initialize contract after deployment
  const initializeContract = async (address: string) => {
    if (provider && address) {
      try {
        const signer = await provider.getSigner();
        const counterContract = Counter__factory.connect(address, signer);
        setContract(counterContract);
        setContractAddress(address);
       
        // Get initial values
        await getCurrentNum();
        await getFullArrayLength();
       
      } catch (error) {
        console.error('Error initializing contract:', error);
      }
    }
  };

  // Get current num from contract
  const getCurrentNum = async () => {
    if (contract) {
      try {
        const currentNum = await contract.num();
        setNum(Number(currentNum));
      } catch (error) {
        console.error('Error getting num:', error);
      }
    }
  };

  // Get full array length
  const getFullArrayLength = async () => {
    if (contract) {
      try {
        const length = await contract.getArrayLength();
        setFullArrayLength(Number(length));
      } catch (error) {
        console.error('Error getting array length:', error);
      }
    }
  };

  // Get sliced array from contract
  const getSlicedArray = async () => {
    if (contract) {
      try {
        const sliced = await contract.getSlicedArray();
        setSlicedArray(sliced);
      } catch (error) {
        console.error('Error getting sliced array:', error);
      }
    }
  };

  // Set new num value (requires payment)
  const handleSetNum = async () => {
    if (contract && inputNum) {
      try {
        const newNum = parseInt(inputNum);
        if (isNaN(newNum) || newNum < 0) {
          alert('Please enter a valid non-negative number');
          return;
        }

        // Call setNum function (this will trigger MetaMask for payment)
        const tx = await contract.setNum(newNum);
        console.log('Transaction sent:', tx.hash);
       
        // Wait for transaction to be mined
        await tx.wait();
       
        // Update values after transaction
        await getCurrentNum();
        await updateBalance();
       
        alert('Number updated successfully!');
       
      } catch (error) {
        console.error('Error setting num:', error);
        alert('Error setting number. Check console for details.');
      }
    }
  };

  // Update wallet balance
  const updateBalance = async () => {
    if (provider && address) {
      try {
        const userBalance = await provider.getBalance(address);
        setBalance(ethers.formatEther(userBalance));
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  // Auto-update balance when address changes
  useEffect(() => {
    if (address && provider) {
      updateBalance();
    }
  }, [address, provider]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Blockchain Homework App - Student ID: 11417509</h1>
       
        {/* Connect Wallet Section */}
        {!address ? (
          <button onClick={handleConnectWallet} style={{padding: '10px 20px', fontSize: '16px', margin: '10px'}}>
            Connect MetaMask Wallet
          </button>
        ) : (
          <div style={{margin: '20px 0'}}>
            <p><strong>Connected:</strong> {address.slice(0, 6)}...{address.slice(-4)}</p>
            <p><strong>Balance:</strong> {parseFloat(balance).toFixed(4)} ETH</p>
           
            {/* Contract Address Input */}
            <div style={{margin: '15px 0'}}>
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter deployed contract address"
                style={{padding: '8px', margin: '5px', width: '400px'}}
              />
              <button
                onClick={() => initializeContract(contractAddress)}
                style={{padding: '8px 16px', margin: '5px'}}
              >
                Initialize Contract
              </button>
            </div>
          </div>
        )}

        {/* Contract Functions (only show if contract is initialized) */}
        {contract && (
          <div>
            {/* Current Num Display */}
            <div style={{margin: '20px 0'}}>
              <h3>Current Num: {num}</h3>
              <button onClick={getCurrentNum} style={{margin: '5px', padding: '8px 16px'}}>
                Refresh Num
              </button>
            </div>

            {/* Set Num Section */}
            <div style={{margin: '20px 0'}}>
              <h3>Set New Num</h3>
              <input
                type="number"
                value={inputNum}
                onChange={(e) => setInputNum(e.target.value)}
                placeholder="Enter new number"
                min="0"
                style={{padding: '8px', margin: '5px', width: '200px'}}
              />
              <button onClick={handleSetNum} style={{padding: '8px 16px', margin: '5px'}}>
                Set Num (Pay Gas)
              </button>
              <p><strong>Array Length:</strong> {fullArrayLength}</p>
            </div>

            {/* Sliced Array Display */}
            <div style={{margin: '20px 0'}}>
              <h3>Sliced Array (First {num} items)</h3>
              <button onClick={getSlicedArray} style={{margin: '5px', padding: '8px 16px'}}>
                Get Sliced Array
              </button>
             
              {slicedArray.length > 0 ? (
                <ul style={{textAlign: 'left', display: 'inline-block'}}>
                  {slicedArray.map((word, index) => (
                    <li key={index} style={{margin: '5px 0'}}>{word}</li>
                  ))}
                </ul>
              ) : num === 0 ? (
                <p>No items to display (num is 0)</p>
              ) : (
                <p>Click "Get Sliced Array" to display items</p>
              )}
            </div>

            {/* Warning Messages */}
            {num < 0 && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                Warning: The inputted number cannot be negative
              </p>
            )}
           
            {num > fullArrayLength && fullArrayLength > 0 && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                Warning: The highest number of items that can be displayed is {fullArrayLength}
              </p>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
	
