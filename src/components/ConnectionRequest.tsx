
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

interface ConnectionRequestProps {
  peerId: string;
  username?: string;
  onAccept: () => void;
  onReject: () => void;
}

export const ConnectionRequest: React.FC<ConnectionRequestProps> = ({
  peerId,
  username,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-sm perspective-1000"
      >
        <div className="bg-card p-6 rounded-xl border border-border shadow-2xl relative overflow-hidden group">
          {/* Animated Glow */}
          <div className="absolute top-0 right-0 p-16 bg-primary/20 blur-3xl opacity-20 bg-blend-screen rounded-full pointer-events-none group-hover:opacity-40 transition-opacity" />

          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="bg-primary/20 rounded-full p-3 flex-shrink-0 animate-pulse border border-primary/30">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>

            <div className="w-full">
              <h3 className="font-semibold text-lg text-foreground">Incoming Connection</h3>
              <p className="text-muted-foreground mt-2">
                {username ? (
                  <>
                    <span className="text-primary font-medium text-lg">{username}</span>
                    <span className="block text-sm opacity-70 mt-1">({peerId})</span>
                  </>
                ) : (
                  <span className="font-mono text-sm">{peerId}</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                wants to connect using P2P.
              </p>

              <div className="flex space-x-3 mt-6 w-full">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onReject}
                  className="flex-1 py-2.5 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg border border-transparent hover:border-destructive/20 transition-colors text-sm"
                >
                  Reject
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAccept}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-colors text-sm"
                >
                  Accept
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};