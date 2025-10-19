import { Candle, Event } from './types';
import { generatePriceForecast } from './utils';

interface CandlestickChartProps {
  candles: Candle[];
  events: Event[];
  symbol: string;
}

const CandlestickChart = ({ candles, events, symbol }: CandlestickChartProps) => {
  const forecast = generatePriceForecast(candles, 5);
  const allPrices = [...candles.map(c => c.high), ...forecast];
  const allLows = [...candles.map(c => c.low), ...forecast];
  const maxPrice = Math.max(...allPrices);
  const minPrice = Math.min(...allLows);
  const priceRange = maxPrice - minPrice;
  const symbolEvents = events.filter(e => e.symbol === symbol);

  const displayCandles = candles.slice(-30);
  const lastCandle = displayCandles[displayCandles.length - 1];

  return (
    <div className="relative h-64 bg-muted/20 rounded-lg p-4">
      <div className="flex items-end justify-between h-full gap-0.5">
        {displayCandles.map((candle, idx) => {
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
        
        {forecast.map((price, idx) => {
          const y = ((maxPrice - price) / priceRange) * 100;
          
          return (
            <div key={`forecast-${idx}`} className="relative flex-1 h-full">
              <div 
                className="absolute w-2 h-2 rounded-full bg-secondary -ml-1"
                style={{ top: `${y}%` }}
              />
            </div>
          );
        })}
      </div>

      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <pattern id="dashed-line" patternUnits="userSpaceOnUse" width="8" height="2">
            <line x1="0" y1="1" x2="6" y2="1" stroke="hsl(var(--secondary))" strokeWidth="2" />
          </pattern>
        </defs>
        
        {forecast.length > 1 && (
          <path
            d={(() => {
              const startX = 85;
              const startY = ((maxPrice - lastCandle.close) / priceRange) * 100;
              const width = 15;
              
              let path = `M ${startX} ${startY}`;
              
              forecast.forEach((price, idx) => {
                const x = startX + ((idx + 1) / forecast.length) * width;
                const y = ((maxPrice - price) / priceRange) * 100;
                path += ` L ${x} ${y}`;
              });
              
              return path;
            })()}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.7"
          />
        )}
      </svg>
      
      <div className="absolute top-2 right-2 text-xs text-muted-foreground flex items-center gap-2">
        <span>Last 30 candles</span>
        <span className="text-secondary">+ Forecast</span>
      </div>
    </div>
  );
};

export default CandlestickChart;
