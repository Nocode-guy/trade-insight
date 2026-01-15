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

interface FileData {
  name: string;
  content: string;
}

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (csvText: string) => number;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFiles = useCallback((fileList: FileList) => {
    const csvFiles = Array.from(fileList).filter(
      file => file.type === 'text/csv' || file.name.endsWith('.csv')
    );

    csvFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFiles(prev => {
          // Don't add duplicate files
          if (prev.some(f => f.name === file.name)) return prev;
          return [...prev, { name: file.name, content: e.target?.result as string }];
        });
      };
      reader.readAsText(file);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const handleImport = () => {
    if (files.length === 0) return;

    let totalCount = 0;
    files.forEach(file => {
      const count = onImport(file.content);
      totalCount += count;
    });

    toast.success(`Successfully imported ${totalCount} trades from ${files.length} file${files.length > 1 ? 's' : ''}`);
    setFiles([]);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFiles([]);
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
            `}
          >
            <input
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">
              Drop your CSV files here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (select multiple)
            </p>
          </div>

          {/* Selected files list */}
          {files.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground truncate max-w-[280px]">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFile(file.name)}
                    className="h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* CSV Format info */}
          <div className="bg-secondary/50 rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">Supported formats:</p>
            <p className="text-xs text-muted-foreground">
              Robinhood exports, or custom CSV with columns: date_open, date_close, symbol, side, qty, entry_price, exit_price
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={files.length === 0}
              className="flex-1 gap-2"
            >
              <Check className="w-4 h-4" />
              Import {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'Trades'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
