import { useState, useCallback } from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (csvText: string) => number;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      processFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvText(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!csvText) return;
    
    const count = onImport(csvText);
    toast.success(`Successfully imported ${count} trades`);
    setCsvText('');
    setFileName('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setCsvText('');
    setFileName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Import Trades</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}
              ${fileName ? 'border-primary bg-primary/5' : ''}
            `}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted-foreground">Ready to import</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCsvText('');
                    setFileName('');
                  }}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">
                  Drop your CSV file here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to browse
                </p>
              </>
            )}
          </div>

          {/* CSV Format info */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">Expected CSV columns:</p>
            <p className="text-xs text-muted-foreground font-mono">
              date_open, time_open, date_close, time_close, symbol, side, qty, entry_price, exit_price, fees, strategy_tag, notes
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!csvText}
              className="flex-1 gap-2"
            >
              <Check className="w-4 h-4" />
              Import Trades
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
