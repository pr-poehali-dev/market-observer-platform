import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarketData, Indicator, OrderBookEntry, Event, AVAILABLE_PAIRS } from './types';
import { getIndicatorColor } from './utils';
import CandlestickChart from './CandlestickChart';
import VolumeChart from './VolumeChart';

interface PairDashboardProps {
  data: MarketData;
  indicators: Indicator[];
  orderBook: { bids: OrderBookEntry[], asks: OrderBookEntry[] };
  onPairChange: (symbol: string) => void;
  events: Event[];
}

const PairDashboard = ({ 
  data, 
  indicators, 
  orderBook,
  onPairChange,
  events
}: PairDashboardProps) => (
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

export default PairDashboard;
