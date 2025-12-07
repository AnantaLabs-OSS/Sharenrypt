
import React from 'react';
import { motion } from 'framer-motion';
import { Users, X, Loader2, RefreshCw } from 'lucide-react';

interface ConnectionDialogProps {
  targetPeerId: string;
  setTargetPeerId: (id: string) => void;
  onConnect: () => void;
  onCancel: () => void;
  connectionStatus: 'idle' | 'connecting' | 'connected' | 'failed';
  onRetry: () => void;
}

export const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  targetPeerId,
  setTargetPeerId,
  onConnect,
  onCancel,
  connectionStatus,
  onRetry,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-primary">
            <Users className="w-6 h-6" />
            <h3 className="text-xl font-semibold text-foreground">Connect to Peer</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {connectionStatus === 'idle' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="peerId" className="block text-sm font-medium text-muted-foreground mb-2">
                  Enter Peer ID
                </label>
                <input
                  type="text"
                  id="peerId"
                  value={targetPeerId}
                  onChange={(e) => setTargetPeerId(e.target.value)}
                  className="w-full bg-background border border-input rounded-md px-4 py-3 text-foreground focus:ring-1 focus:ring-ring outline-none transition-all placeholder:text-muted-foreground/50"
                  placeholder="Paste peer ID here..."
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!targetPeerId.trim()}
                >
                  Connect
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-md transition-colors border border-border"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          )}

          {connectionStatus === 'connecting' && (
            <div className="py-8 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Connecting...</h3>
              <p className="text-muted-foreground text-center mb-6">
                Establishing secure encrypted channel
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="px-6 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-md transition-colors border border-border"
              >
                Cancel
              </motion.button>
            </div>
          )}

          {connectionStatus === 'failed' && (
            <div className="py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Connection Failed</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-[80%]">
                Unable to reach peer. Check the ID and network connection.
              </p>
              <div className="flex space-x-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-md flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-md border border-border"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};