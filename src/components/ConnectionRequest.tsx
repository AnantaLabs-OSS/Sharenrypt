import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

interface ConnectionRequestProps {
  peerId: string;
  onAccept: () => void;
  onReject: () => void;
}

export const ConnectionRequest: React.FC<ConnectionRequestProps> = ({
  peerId,
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
      <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-cyan-500/10 shadow-2xl relative overflow-hidden group">
        {/* Animated Glow */}
        <div className="absolute top-0 right-0 p-12 bg-cyan-500/20 blur-3xl opacity-20 bg-blend-screen rounded-full pointer-events-none group-hover:opacity-40 transition-opacity" />

        <div className="flex items-start space-x-4 relative z-10">
          <div className="bg-cyan-500/20 rounded-full p-2 flex-shrink-0 animate-pulse border border-cyan-500/30">
            <UserPlus className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 text-glow">Incoming Connection</h3>
            <p className="text-sm text-slate-400 mt-1">
              A peer wants to connect:
            </p>
            <p className="text-sm font-mono bg-slate-950/50 border border-slate-700 p-2 rounded mt-2 select-all break-all text-cyan-200 shadow-inner">
              {peerId}
            </p>
            <div className="flex space-x-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAccept}
                className="flex-1 glass-button-primary"
              >
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onReject}
                className="flex-1 glass-button-danger"
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