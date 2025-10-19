import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Event } from './types';
import { getEventBadgeVariant } from './utils';

interface EventsFeedProps {
  events: Event[];
}

const EventsFeed = ({ events }: EventsFeedProps) => {
  return (
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
  );
};

export default EventsFeed;
