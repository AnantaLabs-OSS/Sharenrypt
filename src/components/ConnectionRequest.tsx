            </p >
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
          </div >
        </div >
      </div >
    </motion.div >
  );
};