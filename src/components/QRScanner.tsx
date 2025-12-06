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
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass-panel w-full max-w-md mx-auto overflow-hidden rounded-2xl border border-cyan-500/20 shadow-cyan-500/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Camera className="w-5 h-5" />
            <h3 className="text-lg font-semibold text-slate-100">Scan QR Code</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {permissionDenied ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-rose-500/10 rounded-full p-4 mb-4 border border-rose-500/20">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-2">Camera Access Required</h3>
              <p className="text-slate-400 text-center mb-6 text-sm">
                Please allow camera access to scan QR codes.
              </p>
              <div className="flex space-x-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  className="flex-1 glass-button-primary flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 glass-button-secondary"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700/50">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" />

                {/* Scanner Overlay UI */}
                <div className="absolute inset-0 border-[40px] border-slate-950/60 pointer-events-none">
                  <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.3)]"></div>
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-[scan_2s_linear_infinite]" />
                </div>

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                {hasFlash ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={toggleFlash}
                    className={`flex-1 glass-button ${flashOn ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' : 'bg-slate-800/50 text-slate-400 border-slate-700'}`}
                  >
                    {flashOn ? 'Flash On' : 'Flash Off'}
                  </motion.button>
                ) : <div className="flex-1" />}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 glass-button-secondary"
                >
                  Cancel
                </motion.button>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs text-center">
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