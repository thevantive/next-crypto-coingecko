"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';

/* membuat struktur data */
interface CryptoData {
  id: string;
  name: string;
  usd: number;
  usd_24h_change: number;
  icon: string;
}


/* membuat struktur data untuk informasi koin */
/* yang nantinya akan di merge ke CryptoData */
interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
}

/* keperluan styling */
/* untuk konfigurasi style pada main perlu penggunaan interface CSSProperties */
const mainStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  padding: '20px',
  overflow: 'auto'
};

const containerStyle = {
  marginBottom: '20px'
};

const buttonStyle = {
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  padding: '10px 20px',
  marginRight: '10px'
};

const connectedStyle = {
  ...buttonStyle,
  display: 'inline-block'
};

const disconnectStyle = {
  ...buttonStyle,
  display: 'inline-block',
  color: '#fff',
  backgroundColor: '#f00'
};

/* daftar path icon masing masing coin crypto */
const baseIconUrl = 'https://assets.coingecko.com/coins/images/';
const iconUrls: { [key: string]: string } = {
  binancecoin: '825/large/binance-coin-logo.png',
  dogecoin: '5/large/dogecoin.png',
  litecoin: '2/large/litecoin.png',
  cardano: '975/large/cardano.png',
  bitcoin: '1/large/bitcoin.png'
};

/* mapping crypto yang akan ditampilkan */
const cryptoIds = ["bitcoin", "dogecoin", "cardano", "binancecoin", "litecoin"];

export default function Home() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [coinInfos, setCoinInfos] = useState<CoinInfo[]>([]);

  /* menghubungkan wallet */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setConnectedAddress(accounts[0]);
        alert('Wallet Connected!');
      } catch (error) {
        console.error(error);
        alert('Failed To Connect');
      }
    } else {
      alert('MetaMask Not Detected. Please Install MetaMask');
    }
  };

  const disconnectWallet = () => {
    alert('Wallet Disconnected!');
    setConnectedAddress(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* mengambil informasi harga dan perubahan harga crypto */
        const priceApiUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cdogecoin%2Ccardano%2Cbinancecoin%2Clitecoin&vs_currencies=usd%2Cusd%2Cusd%2Cusd%2Cusd&include_24hr_change=true";
        const priceResponse = await axios.get(priceApiUrl);
        const priceData = priceResponse.data;

        /* mengambil informasi crypto */
        const coinInfoApiUrl = "https://api.coingecko.com/api/v3/coins/list";
        const coinInfoResponse = await axios.get<CoinInfo[]>(coinInfoApiUrl);
        const coinInfoData = coinInfoResponse.data;

        /* memfilter koin sesuai yang diinginkan  */
        const filteredCoinInfos = coinInfoData.filter(info => cryptoIds.includes(info.id));
        
        /* melakukan maping pada informasi koin */
        const mergedData: CryptoData[] = filteredCoinInfos.map(info => {
          
          /* apabila tidak tersedia maka path default akan digunakan sesuai id */
          const iconUrl = iconUrls[info.id] || `${info.id}/large/${info.id}.png`;
          
          /* menggabungkan informasi crypto dan harga */
          return {
            id: info.id,
            name: `${info.name} (${info.symbol.toUpperCase()})`,
            usd: priceData[info.id]?.usd || 0,
            usd_24h_change: priceData[info.id]?.usd_24h_change || 0,
            icon: baseIconUrl + iconUrl
          };
        });

        setCryptoData(mergedData);
        setCoinInfos(filteredCoinInfos);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main style={mainStyle}>
      <div style={containerStyle}>
        {!connectedAddress && (
          <button onClick={connectWallet} style={buttonStyle}>Connect Wallet</button>
        )}
        {connectedAddress && (
          <div>
            <p style={connectedStyle}>Wallet Address {connectedAddress}</p>
            <button onClick={disconnectWallet} style={disconnectStyle}>Disconnect Wallet</button>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {cryptoData.map(crypto => (
          <div key={crypto.id} className="crypto-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img src={crypto.icon} alt={crypto.name} style={{ width: "50px", height: "50px", marginRight: '10px' }} />
              <div style={{ display: 'inline-flex', flexDirection: 'column', textAlign: 'left' }}>
                <h2 style={{ margin: '0', color: '#2196F3' }}>{crypto.name}</h2>
                <p style={{ margin: '0' }}>
                  <span style={{ marginRight: '5px' }}>{crypto.usd} USD</span>
                  <span style={{ color: crypto.usd_24h_change < 0 ? 'red' : (crypto.usd_24h_change > 0 ? 'green' : 'lightblue') }}>
                    ({crypto.usd_24h_change.toFixed(2)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
