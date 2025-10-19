import { Candle, Event } from './types';

interface CandlestickChartProps {
  candles: Candle[];
  events: Event[];
  symbol: string;
}

const CandlestickChart = ({ candles, events, symbol }: CandlestickChartProps) => {
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

export default CandlestickChart;
