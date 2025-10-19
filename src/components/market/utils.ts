import { Candle, MarketData, Indicator, OrderBookEntry } from './types';

export const getBasePrice = (symbol: string): number => {
  const prices: Record<string, number> = {
    BTCUSDT: 43250, ETHUSDT: 2280, BNBUSDT: 310, SOLUSDT: 98,
    ADAUSDT: 0.52, XRPUSDT: 0.61, DOGEUSDT: 0.082, MATICUSDT: 0.85,
    DOTUSDT: 7.2, AVAXUSDT: 36.5
  };
  return prices[symbol] || 100;
};

export const generateCandle = (prevCandle: Candle | null, basePrice: number): Candle => {
  const open = prevCandle ? prevCandle.close : basePrice;
  const volatility = basePrice * 0.002;
  const change = (Math.random() - 0.5) * volatility;
  const close = open + change;
  const high = Math.max(open, close) + Math.random() * volatility * 0.5;
  const low = Math.min(open, close) - Math.random() * volatility * 0.5;
  const volume = Math.random() * 1000000 + 500000;
  const delta = (Math.random() - 0.5) * 500000;

  return {
    timestamp: new Date(),
    open,
    high,
    low,
    close,
    volume,
    delta
  };
};

export const generateInitialCandles = (symbol: string, count: number = 50): Candle[] => {
  const basePrice = getBasePrice(symbol);
  const candles: Candle[] = [];
  let prevCandle: Candle | null = null;

  for (let i = 0; i < count; i++) {
    const candle = generateCandle(prevCandle, basePrice);
    candle.timestamp = new Date(Date.now() - (count - i) * 10000);
    candles.push(candle);
    prevCandle = candle;
  }

  return candles;
};

export const generateMockData = (symbol: string, prevCandles?: Candle[]): MarketData => {
  const basePrice = getBasePrice(symbol);
  const candles = prevCandles || generateInitialCandles(symbol);
  const latestCandle = candles[candles.length - 1];
  
  return {
    symbol,
    price: latestCandle.close,
    change24h: ((latestCandle.close - candles[0].open) / candles[0].open) * 100,
    volume: candles.reduce((sum, c) => sum + c.volume, 0),
    high24h: Math.max(...candles.map(c => c.high)),
    low24h: Math.min(...candles.map(c => c.low)),
    lastUpdate: new Date(),
    candles
  };
};

export const generateIndicators = (candles: Candle[]): Indicator[] => {
  const latest = candles[candles.length - 1];
  const ema5 = candles.slice(-5).reduce((sum, c) => sum + c.close, 0) / 5;
  const ema10 = candles.slice(-10).reduce((sum, c) => sum + c.close, 0) / 10;
  
  const prices = candles.slice(-14).map(c => c.close);
  const gains = prices.slice(1).map((p, i) => Math.max(0, p - prices[i]));
  const losses = prices.slice(1).map((p, i) => Math.max(0, prices[i] - p));
  const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const avgLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
  const rs = avgGain / (avgLoss || 1);
  const rsi = 100 - (100 / (1 + rs));

  const avgVolume = candles.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
  const volumeRatio = (latest.volume / avgVolume) * 100;

  return [
    { 
      name: 'EMA5', 
      value: ema5, 
      status: ema5 > ema10 ? 'bullish' : ema5 < ema10 ? 'bearish' : 'neutral' 
    },
    { 
      name: 'EMA10', 
      value: ema10, 
      status: latest.close > ema10 ? 'bullish' : latest.close < ema10 ? 'bearish' : 'neutral' 
    },
    { 
      name: 'RSI14', 
      value: rsi, 
      status: rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral' 
    },
    { 
      name: 'Stoch14', 
      value: Math.random() * 100, 
      status: Math.random() > 0.5 ? 'bullish' : 'bearish' 
    },
    { 
      name: 'Volume', 
      value: volumeRatio, 
      status: volumeRatio > 150 ? 'bullish' : volumeRatio < 50 ? 'bearish' : 'neutral' 
    },
  ];
};

export const generateOrderBook = (basePrice: number): { bids: OrderBookEntry[], asks: OrderBookEntry[] } => {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  
  for (let i = 0; i < 8; i++) {
    const bidPrice = basePrice - (i + 1) * (basePrice * 0.0001);
    const askPrice = basePrice + (i + 1) * (basePrice * 0.0001);
    const bidAmount = Math.random() * 2 + 0.1;
    const askAmount = Math.random() * 2 + 0.1;
    
    bids.push({
      price: bidPrice,
      amount: bidAmount,
      total: bidPrice * bidAmount
    });
    
    asks.push({
      price: askPrice,
      amount: askAmount,
      total: askPrice * askAmount
    });
  }
  
  return { bids, asks };
};

export const getIndicatorColor = (status: string) => {
  if (status === 'bullish') return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
  if (status === 'bearish') return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
  return 'bg-muted text-muted-foreground border-muted';
};

export const getEventBadgeVariant = (type: string): 'default' | 'outline' | 'destructive' | 'secondary' => {
  if (type === 'HIGH_VOLUME') return 'default';
  if (type === 'OVERSOLD') return 'outline';
  if (type === 'OVERBOUGHT') return 'destructive';
  return 'secondary';
};
