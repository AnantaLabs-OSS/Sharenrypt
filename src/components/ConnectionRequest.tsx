
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
    <motion.div
      initial={{ opacity: 0, y: -20, rotateX: 20 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: -20 }}
      className="fixed top-4 right-4 z-50 w-full max-w-sm mx-auto px-4 sm:px-0 perspective-1000"
    >
      <div className="bg-card p-4 rounded-xl border border-border shadow-2xl relative overflow-hidden group">
        {/* Animated Glow */}
        <div className="absolute top-0 right-0 p-12 bg-primary/20 blur-3xl opacity-20 bg-blend-screen rounded-full pointer-events-none group-hover:opacity-40 transition-opacity" />

        <div className="flex items-start space-x-4 relative z-10">
          <div className="bg-primary/20 rounded-full p-2 flex-shrink-0 animate-pulse border border-primary/30">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">Incoming Connection</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {username ? (
                <>
                  <span className="text-primary font-medium">{username}</span>
                  <span className="block text-xs opacity-70">({peerId})</span>
                </>
              ) : (
                <span className="font-mono">{peerId}</span>
              )}
              <br />
              wants to connect using P2P.
            </p>
            <p className="text-sm font-mono bg-muted/50 border border-border p-2 rounded mt-2 select-all break-all text-foreground shadow-sm">
              {peerId}
            </p>
            <div className="flex space-x-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAccept}
                className="flex-1 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-colors text-sm"
              >
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReject}
                className="flex-1 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium rounded-lg border border-transparent hover:border-destructive/20 transition-colors text-sm"
              >
                Reject
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};