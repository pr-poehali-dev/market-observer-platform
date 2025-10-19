import { Candle } from './types';

interface VolumeChartProps {
  candles: Candle[];
}

const VolumeChart = ({ candles }: VolumeChartProps) => {
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

export default VolumeChart;
