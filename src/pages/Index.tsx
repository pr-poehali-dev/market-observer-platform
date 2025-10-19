import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Candle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number;
}

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
  candles: Candle[];
}

interface Indicator {
  name: string;
  value: number;
  status: 'bullish' | 'bearish' | 'neutral';
}

interface Event {
  id: string;
  timestamp: Date;
  symbol: string;
  type: 'HIGH_VOLUME' | 'DIVERGENCE' | 'EMA_CROSS' | 'OVERSOLD' | 'OVERBOUGHT';
  description: string;
  price: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

const AVAILABLE_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 
  'XRPUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT'
];

const getBasePrice = (symbol: string): number => {
  const prices: Record<string, number> = {
    BTCUSDT: 43250, ETHUSDT: 2280, BNBUSDT: 310, SOLUSDT: 98,
    ADAUSDT: 0.52, XRPUSDT: 0.61, DOGEUSDT: 0.082, MATICUSDT: 0.85,
    DOTUSDT: 7.2, AVAXUSDT: 36.5
  };
  return prices[symbol] || 100;
};

const generateCandle = (prevCandle: Candle | null, basePrice: number): Candle => {
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

const generateInitialCandles = (symbol: string, count: number = 50): Candle[] => {
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

const generateMockData = (symbol: string, prevCandles?: Candle[]): MarketData => {
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

const generateIndicators = (candles: Candle[]): Indicator[] => {
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

const generateOrderBook = (basePrice: number): { bids: OrderBookEntry[], asks: OrderBookEntry[] } => {
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

const CandlestickChart = ({ candles, events, symbol }: { candles: Candle[], events: Event[], symbol: string }) => {
  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));
  const priceRange = maxPrice - minPrice;
  const symbolEvents = events.filter(e => e.symbol === symbol);

  return (
    <div className="relative h-64 bg-muted/20 rounded-lg p-4">
      <div className="flex items-end justify-between h-full gap-0.5">
        {candles.slice(-30).map((candle, idx) => {
          const bodyTop = ((maxPrice - Math.max(candle.open, candle.close)) / priceRange) * 100;
          const bodyHeight = (Math.abs(candle.close - candle.open) / priceRange) * 100;
          const wickTop = ((maxPrice - candle.high) / priceRange) * 100;
          const wickBottom = ((candle.low - minPrice) / priceRange) * 100;
          const isGreen = candle.close >= candle.open;
          const hasEvent = symbolEvents.some(e => 
            Math.abs(e.timestamp.getTime() - candle.timestamp.getTime()) < 15000
          );

          return (
            <div key={idx} className="relative flex-1 h-full flex flex-col justify-start">
              <div 
                className="w-0.5 bg-muted-foreground/30 mx-auto" 
                style={{ 
                  marginTop: `${wickTop}%`,
                  height: `${100 - wickTop - wickBottom}%`
                }}
              />
              <div 
                className={`absolute left-0 right-0 mx-auto ${isGreen ? 'bg-chart-1' : 'bg-chart-2'} ${hasEvent ? 'ring-2 ring-chart-3' : ''}`}
                style={{
                  top: `${bodyTop}%`,
                  height: `${Math.max(bodyHeight, 1)}%`,
                  width: '80%'
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="absolute top-2 right-2 text-xs text-muted-foreground">
        Last 30 candles
      </div>
    </div>
  );
};

const VolumeChart = ({ candles }: { candles: Candle[] }) => {
  const maxVolume = Math.max(...candles.map(c => c.volume));
  const maxAbsDelta = Math.max(...candles.map(c => Math.abs(c.delta)));

  return (
    <div className="space-y-4">
      <div className="relative h-32 bg-muted/20 rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-2">Volume</p>
        <div className="flex items-end justify-between h-full gap-0.5">
          {candles.slice(-30).map((candle, idx) => {
            const height = (candle.volume / maxVolume) * 100;
            const isGreen = candle.close >= candle.open;

            return (
              <div
                key={idx}
                className={`flex-1 ${isGreen ? 'bg-chart-1/50' : 'bg-chart-2/50'} rounded-sm`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative h-32 bg-muted/20 rounded-lg p-4">
        <p className="text-xs text-muted-foreground mb-2">Cumulative Delta</p>
        <div className="flex items-center justify-between h-full gap-0.5">
          {candles.slice(-30).map((candle, idx) => {
            const height = (Math.abs(candle.delta) / maxAbsDelta) * 100;
            const isPositive = candle.delta > 0;

            return (
              <div key={idx} className="flex-1 flex items-center justify-center">
                <div
                  className={`w-full ${isPositive ? 'bg-chart-1/60' : 'bg-chart-2/60'} rounded-sm`}
                  style={{ 
                    height: `${height}%`,
                    marginTop: isPositive ? 'auto' : '0',
                    marginBottom: isPositive ? '0' : 'auto'
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const [pair1, setPair1] = useState('BTCUSDT');
  const [pair2, setPair2] = useState('ETHUSDT');
  
  const [pair1Data, setPair1Data] = useState<MarketData>(generateMockData(pair1));
  const [pair2Data, setPair2Data] = useState<MarketData>(generateMockData(pair2));
  const [pair1Indicators, setPair1Indicators] = useState<Indicator[]>(generateIndicators(pair1Data.candles));
  const [pair2Indicators, setPair2Indicators] = useState<Indicator[]>(generateIndicators(pair2Data.candles));
  const [events, setEvents] = useState<Event[]>([]);
  const [pair1OrderBook, setPair1OrderBook] = useState(generateOrderBook(pair1Data.price));
  const [pair2OrderBook, setPair2OrderBook] = useState(generateOrderBook(pair2Data.price));

  useEffect(() => {
    const interval = setInterval(() => {
      setPair1Data(prev => {
        const newCandles = [...prev.candles.slice(-49), generateCandle(prev.candles[prev.candles.length - 1], getBasePrice(pair1))];
        const newData = generateMockData(pair1, newCandles);
        setPair1Indicators(generateIndicators(newCandles));
        setPair1OrderBook(generateOrderBook(newData.price));
        
        if (Math.random() > 0.7) {
          const eventTypes: Event['type'][] = ['HIGH_VOLUME', 'DIVERGENCE', 'EMA_CROSS', 'OVERSOLD', 'OVERBOUGHT'];
          const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          const newEvent: Event = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            symbol: pair1,
            type: randomType,
            description: `${randomType.replace(/_/g, ' ')} detected`,
            price: newData.price
          };
          
          setEvents(prev => [newEvent, ...prev].slice(0, 30));
        }
        
        return newData;
      });

      setPair2Data(prev => {
        const newCandles = [...prev.candles.slice(-49), generateCandle(prev.candles[prev.candles.length - 1], getBasePrice(pair2))];
        const newData = generateMockData(pair2, newCandles);
        setPair2Indicators(generateIndicators(newCandles));
        setPair2OrderBook(generateOrderBook(newData.price));
        
        if (Math.random() > 0.7) {
          const eventTypes: Event['type'][] = ['HIGH_VOLUME', 'DIVERGENCE', 'EMA_CROSS', 'OVERSOLD', 'OVERBOUGHT'];
          const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          const newEvent: Event = {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            symbol: pair2,
            type: randomType,
            description: `${randomType.replace(/_/g, ' ')} detected`,
            price: newData.price
          };
          
          setEvents(prev => [newEvent, ...prev].slice(0, 30));
        }
        
        return newData;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [pair1, pair2]);

  const handlePairChange = (pairNumber: 1 | 2, newSymbol: string) => {
    if (pairNumber === 1) {
      setPair1(newSymbol);
      const newData = generateMockData(newSymbol);
      setPair1Data(newData);
      setPair1Indicators(generateIndicators(newData.candles));
    } else {
      setPair2(newSymbol);
      const newData = generateMockData(newSymbol);
      setPair2Data(newData);
      setPair2Indicators(generateIndicators(newData.candles));
    }
  };

  const getIndicatorColor = (status: string) => {
    if (status === 'bullish') return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
    if (status === 'bearish') return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
    return 'bg-muted text-muted-foreground border-muted';
  };

  const getEventBadgeVariant = (type: Event['type']) => {
    if (type === 'HIGH_VOLUME') return 'default';
    if (type === 'OVERSOLD') return 'outline';
    if (type === 'OVERBOUGHT') return 'destructive';
    return 'secondary';
  };

  const PairDashboard = ({ 
    data, 
    indicators, 
    orderBook,
    onPairChange
  }: { 
    data: MarketData; 
    indicators: Indicator[];
    orderBook: { bids: OrderBookEntry[], asks: OrderBookEntry[] };
    onPairChange: (symbol: string) => void;
  }) => (
    <div className="space-y-4">
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Select value={data.symbol} onValueChange={onPairChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_PAIRS.map(pair => (
                  <SelectItem key={pair} value={pair}>
                    {pair.replace('USDT', '/USDT')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
          <Badge variant={data.change24h >= 0 ? 'default' : 'destructive'} className="font-mono">
            {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className={`text-3xl font-bold font-mono ${data.change24h >= 0 ? 'text-chart-1' : 'text-chart-2'}`}>
              ${data.price.toFixed(data.price < 1 ? 4 : 2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
            <p className="text-xl font-mono">${(data.volume / 1000000).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h High</p>
            <p className="text-lg font-mono text-chart-1">${data.high24h.toFixed(data.high24h < 1 ? 4 : 2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h Low</p>
            <p className="text-lg font-mono text-chart-2">${data.low24h.toFixed(data.low24h < 1 ? 4 : 2)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border/50">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Icon name="TrendingUp" size={18} />
          Price Chart
        </h3>
        <CandlestickChart candles={data.candles} events={events} symbol={data.symbol} />
      </Card>

      <Card className="p-6 border-border/50">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Icon name="BarChart3" size={18} />
          Volume & Delta Analysis
        </h3>
        <VolumeChart candles={data.candles} />
      </Card>

      <Card className="p-6 border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Icon name="Activity" size={18} />
          Technical Indicators
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {indicators.map((indicator) => (
            <div
              key={indicator.name}
              className={`p-3 rounded-lg border ${getIndicatorColor(indicator.status)} transition-all duration-300`}
            >
              <p className="text-xs font-medium mb-1">{indicator.name}</p>
              <p className="text-base font-bold font-mono">{indicator.value.toFixed(1)}</p>
              <p className="text-xs capitalize mt-1">{indicator.status}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-border/50">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Icon name="BookOpen" size={18} />
          Order Book
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-semibold">BIDS</p>
            <div className="space-y-1">
              {orderBook.bids.slice(0, 6).map((bid, idx) => (
                <div key={idx} className="flex justify-between text-xs font-mono bg-chart-1/5 p-1.5 rounded">
                  <span className="text-chart-1">${bid.price.toFixed(bid.price < 1 ? 4 : 2)}</span>
                  <span className="text-muted-foreground">{bid.amount.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-semibold">ASKS</p>
            <div className="space-y-1">
              {orderBook.asks.slice(0, 6).map((ask, idx) => (
                <div key={idx} className="flex justify-between text-xs font-mono bg-chart-2/5 p-1.5 rounded">
                  <span className="text-chart-2">${ask.price.toFixed(ask.price < 1 ? 4 : 2)}</span>
                  <span className="text-muted-foreground">{ask.amount.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Market Observer
            </h1>
            <p className="text-muted-foreground">Real-time crypto market analysis • 10s intervals</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/50">
            <div className="w-3 h-3 rounded-full bg-chart-1 animate-pulse-glow" />
            <span className="text-sm font-medium">Live Data</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PairDashboard 
            data={pair1Data} 
            indicators={pair1Indicators} 
            orderBook={pair1OrderBook}
            onPairChange={(symbol) => handlePairChange(1, symbol)}
          />
          <PairDashboard 
            data={pair2Data} 
            indicators={pair2Indicators} 
            orderBook={pair2OrderBook}
            onPairChange={(symbol) => handlePairChange(2, symbol)}
          />
        </div>

        <Card className="p-6 border-border/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Zap" size={20} />
            Market Events Feed
            <Badge variant="outline" className="ml-auto">{events.length} events</Badge>
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Waiting for market events...
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-slide-up"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getEventBadgeVariant(event.type)} className="font-mono text-xs">
                      {event.type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="font-semibold">{event.symbol.replace('USDT', '/USDT')}</span>
                    <span className="text-sm text-muted-foreground">{event.description}</span>
                    <span className="text-sm font-mono">${event.price.toFixed(2)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <footer className="text-center text-sm text-muted-foreground border-t border-border/50 pt-6">
          <p className="flex items-center justify-center gap-2">
            <Icon name="AlertTriangle" size={16} />
            For informational purposes only. Not financial advice. Data updates every 10 seconds.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
