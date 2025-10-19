export interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
  candles: Candle[];
}

export interface Indicator {
  name: string;
  value: number;
  status: 'bullish' | 'bearish' | 'neutral';
}

export interface Event {
  id: string;
  timestamp: Date;
  symbol: string;
  type: 'HIGH_VOLUME' | 'DIVERGENCE' | 'EMA_CROSS' | 'OVERSOLD' | 'OVERBOUGHT';
  description: string;
  price: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export const AVAILABLE_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 
  'XRPUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT'
];
