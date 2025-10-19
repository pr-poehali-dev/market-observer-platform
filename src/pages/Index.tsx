import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
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
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

const generateMockData = (symbol: string): MarketData => {
  const basePrice = symbol === 'BTCUSDT' ? 43250 : 2280;
  const randomChange = (Math.random() - 0.5) * 100;
  
  return {
    symbol,
    price: basePrice + randomChange,
    change24h: (Math.random() - 0.5) * 5,
    volume: Math.random() * 10000000 + 5000000,
    high24h: basePrice + Math.abs(randomChange) + 50,
    low24h: basePrice - Math.abs(randomChange) - 50,
    lastUpdate: new Date()
  };
};

const generateIndicators = (): Indicator[] => {
  const randomStatus = (): 'bullish' | 'bearish' | 'neutral' => {
    const rand = Math.random();
    if (rand > 0.66) return 'bullish';
    if (rand > 0.33) return 'bearish';
    return 'neutral';
  };

  return [
    { name: 'EMA5', value: Math.random() * 100, status: randomStatus() },
    { name: 'EMA10', value: Math.random() * 100, status: randomStatus() },
    { name: 'RSI14', value: Math.random() * 100, status: randomStatus() },
    { name: 'Stoch14', value: Math.random() * 100, status: randomStatus() },
    { name: 'Volume', value: Math.random() * 100, status: randomStatus() },
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

const Index = () => {
  const [btcData, setBtcData] = useState<MarketData>(generateMockData('BTCUSDT'));
  const [ethData, setEthData] = useState<MarketData>(generateMockData('ETHUSDT'));
  const [btcIndicators, setBtcIndicators] = useState<Indicator[]>(generateIndicators());
  const [ethIndicators, setEthIndicators] = useState<Indicator[]>(generateIndicators());
  const [events, setEvents] = useState<Event[]>([]);
  const [btcOrderBook, setBtcOrderBook] = useState(generateOrderBook(btcData.price));
  const [ethOrderBook, setEthOrderBook] = useState(generateOrderBook(ethData.price));

  useEffect(() => {
    const interval = setInterval(() => {
      const newBtcData = generateMockData('BTCUSDT');
      const newEthData = generateMockData('ETHUSDT');
      
      setBtcData(newBtcData);
      setEthData(newEthData);
      setBtcIndicators(generateIndicators());
      setEthIndicators(generateIndicators());
      setBtcOrderBook(generateOrderBook(newBtcData.price));
      setEthOrderBook(generateOrderBook(newEthData.price));

      if (Math.random() > 0.7) {
        const eventTypes: Event['type'][] = ['HIGH_VOLUME', 'DIVERGENCE', 'EMA_CROSS', 'OVERSOLD', 'OVERBOUGHT'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const randomSymbol = Math.random() > 0.5 ? 'BTCUSDT' : 'ETHUSDT';
        
        const newEvent: Event = {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          symbol: randomSymbol,
          type: randomType,
          description: `${randomType.replace('_', ' ')} detected`
        };
        
        setEvents(prev => [newEvent, ...prev].slice(0, 20));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getIndicatorColor = (status: string) => {
    if (status === 'bullish') return 'bg-chart-1/20 text-chart-1';
    if (status === 'bearish') return 'bg-chart-2/20 text-chart-2';
    return 'bg-muted text-muted-foreground';
  };

  const getEventBadgeVariant = (type: Event['type']) => {
    if (type === 'HIGH_VOLUME' || type === 'EMA_CROSS') return 'default';
    if (type === 'OVERSOLD') return 'outline';
    return 'secondary';
  };

  const PairDashboard = ({ data, indicators, orderBook }: { 
    data: MarketData; 
    indicators: Indicator[];
    orderBook: { bids: OrderBookEntry[], asks: OrderBookEntry[] };
  }) => (
    <div className="space-y-4">
      <Card className="p-6 border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{data.symbol.replace('USDT', '/USDT')}</h2>
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
              ${data.price.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
            <p className="text-xl font-mono">${(data.volume / 1000000).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h High</p>
            <p className="text-lg font-mono text-chart-1">${data.high24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">24h Low</p>
            <p className="text-lg font-mono text-chart-2">${data.low24h.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-border/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="Activity" size={20} />
          Technical Indicators
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {indicators.map((indicator) => (
            <div
              key={indicator.name}
              className={`p-3 rounded-lg ${getIndicatorColor(indicator.status)} transition-all duration-300`}
            >
              <p className="text-xs font-medium mb-1">{indicator.name}</p>
              <p className="text-lg font-bold font-mono">{indicator.value.toFixed(1)}</p>
              <p className="text-xs capitalize mt-1">{indicator.status}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border-border/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icon name="BookOpen" size={20} />
          Order Book
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-semibold">BIDS</p>
            <div className="space-y-1">
              {orderBook.bids.slice(0, 5).map((bid, idx) => (
                <div key={idx} className="flex justify-between text-xs font-mono bg-chart-1/5 p-1.5 rounded">
                  <span className="text-chart-1">${bid.price.toFixed(2)}</span>
                  <span className="text-muted-foreground">{bid.amount.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-semibold">ASKS</p>
            <div className="space-y-1">
              {orderBook.asks.slice(0, 5).map((ask, idx) => (
                <div key={idx} className="flex justify-between text-xs font-mono bg-chart-2/5 p-1.5 rounded">
                  <span className="text-chart-2">${ask.price.toFixed(2)}</span>
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
          <PairDashboard data={btcData} indicators={btcIndicators} orderBook={btcOrderBook} />
          <PairDashboard data={ethData} indicators={ethIndicators} orderBook={ethOrderBook} />
        </div>

        <Card className="p-6 border-border/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="Zap" size={20} />
            Market Events Feed
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
                      {event.type.replace('_', ' ')}
                    </Badge>
                    <span className="font-semibold">{event.symbol.replace('USDT', '/USDT')}</span>
                    <span className="text-sm text-muted-foreground">{event.description}</span>
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
            For informational purposes only. Not financial advice.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
