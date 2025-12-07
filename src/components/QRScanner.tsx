
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (peerId: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeScanner = async () => {
      try {
        if (!mounted) return;
        setIsLoading(true);
        setError('');

        const hasPermissions = await QrScanner.hasCamera();
        if (!mounted) return;

        if (!hasPermissions) {
          setPermissionDenied(true);
          setError('No camera found or permission denied');
          setIsLoading(false);
          return;
        }

        if (!videoRef.current) return;

        // Cleanup existing instance if any (double-safety)
        if (scannerRef.current) {
          scannerRef.current.destroy();
        }

        scannerRef.current = new QrScanner(
          videoRef.current,
          (result) => { if (mounted && result.data) onScan(result.data); },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment',
          }
        );

        const hasFlashAvailable = await scannerRef.current.hasFlash();
        if (!mounted) {
          scannerRef.current.destroy();
          return;
        }
        setHasFlash(hasFlashAvailable);

        await scannerRef.current.start();
        if (mounted) setIsLoading(false);

      } catch (err) {
        console.error('Scanner error:', err);
        if (mounted) {
          setError('Failed to initialize camera.');
          setIsLoading(false);
          setPermissionDenied(true);
        }
      }
    };

    initializeScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  const handleRetry = async () => {
    setPermissionDenied(false);
    setIsLoading(true);
    setError('');
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      if (scannerRef.current) await scannerRef.current.start();
      setIsLoading(false);
    } catch (err) {
      setPermissionDenied(true);
      setError('Camera access denied.');
      setIsLoading(false);
    }
  };

  const toggleFlash = async () => {
    if (!scannerRef.current || !hasFlash) return;
    try {
      if (flashOn) await scannerRef.current.turnFlashOff();
      else await scannerRef.current.turnFlashOn();
      setFlashOn(!flashOn);
    } catch (err) { console.error('Flash toggle failed:', err); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-muted/20 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2 text-primary">
            <Camera className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-foreground">Scan QR Code</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {permissionDenied ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-destructive/10 rounded-full p-4 mb-4 border border-destructive/20">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Camera Access Required</h3>
              <p className="text-muted-foreground text-center mb-6 text-sm">
                Please allow camera access to scan QR codes.
              </p>
              <div className="flex space-x-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  className="flex-1 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg border border-border"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-black rounded-xl overflow-hidden border border-border">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />

                {/* Scanner Overlay UI */}
                <div className="absolute inset-0 border-[40px] border-black/60 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.3)]"></div>
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_10px_rgba(var(--primary))] animate-[scan_2s_linear_infinite]" />
                </div>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                {hasFlash ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleFlash}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${flashOn ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30 dark:text-yellow-300' : 'bg-muted/50 text-muted-foreground border-border'}`}
                  >
                    {flashOn ? 'Flash On' : 'Flash Off'}
                  </motion.button>
                ) : <div className="flex-1" />}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-lg border border-border"
                >
                  Cancel
                </motion.button>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs text-center">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};