import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import PairDashboard from '@/components/market/PairDashboard';
import EventsFeed from '@/components/market/EventsFeed';
import { Event } from '@/components/market/types';
import { 
  generateMockData, 
  generateIndicators, 
  generateOrderBook,
  generateCandle,
  getBasePrice
} from '@/components/market/utils';

const Index = () => {
  const [pair1, setPair1] = useState('BTCUSDT');
  const [pair2, setPair2] = useState('ETHUSDT');
  
  const [pair1Data, setPair1Data] = useState(() => generateMockData(pair1));
  const [pair2Data, setPair2Data] = useState(() => generateMockData(pair2));
  const [pair1Indicators, setPair1Indicators] = useState(() => generateIndicators(pair1Data.candles));
  const [pair2Indicators, setPair2Indicators] = useState(() => generateIndicators(pair2Data.candles));
  const [events, setEvents] = useState<Event[]>([]);
  const [pair1OrderBook, setPair1OrderBook] = useState(() => generateOrderBook(pair1Data.price));
  const [pair2OrderBook, setPair2OrderBook] = useState(() => generateOrderBook(pair2Data.price));

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
            events={events}
          />
          <PairDashboard 
            data={pair2Data} 
            indicators={pair2Indicators} 
            orderBook={pair2OrderBook}
            onPairChange={(symbol) => handlePairChange(2, symbol)}
            events={events}
          />
        </div>

        <EventsFeed events={events} />

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
