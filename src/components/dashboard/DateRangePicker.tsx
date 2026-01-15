import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from '@/types/trade';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  customDateRange?: { start: Date; end: Date } | null;
  onCustomDateChange?: (range: { start: Date; end: Date }) => void;
}

const options: { value: DateRange; label: string }[] = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: 'custom', label: 'Custom' },
];

export function DateRangePicker({
  value,
  onChange,
  customDateRange,
  onCustomDateChange
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: customDateRange?.start,
    to: customDateRange?.end,
  });

  const handleOptionClick = (optionValue: DateRange) => {
    if (optionValue === 'custom') {
      setIsOpen(true);
    } else {
      onChange(optionValue);
    }
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to && onCustomDateChange) {
      onCustomDateChange({ start: tempRange.from, end: tempRange.to });
      onChange('custom');
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-secondary/50 rounded-lg p-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOptionClick(option.value)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
              value === option.value
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Show date range when custom is selected */}
      {value === 'custom' && customDateRange && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <CalendarIcon className="w-4 h-4" />
              {format(customDateRange.start, 'MMM d')} - {format(customDateRange.end, 'MMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={tempRange.from}
                    onSelect={(date) => setTempRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date</p>
                  <Calendar
                    mode="single"
                    selected={tempRange.to}
                    onSelect={(date) => setTempRange(prev => ({ ...prev, to: date }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply} disabled={!tempRange.from || !tempRange.to}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Custom date picker popover when first selecting custom */}
      {value !== 'custom' && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <span />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Start Date</p>
                  <Calendar
                    mode="single"
                    selected={tempRange.from}
                    onSelect={(date) => setTempRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">End Date</p>
                  <Calendar
                    mode="single"
                    selected={tempRange.to}
                    onSelect={(date) => setTempRange(prev => ({ ...prev, to: date }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply} disabled={!tempRange.from || !tempRange.to}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
