import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/sounds';

export const SoundToggle: React.FC = () => {
    const [enabled, setEnabled] = useState(isSoundEnabled());

    const toggleSound = () => {
        const newState = !enabled;
        setEnabled(newState);
        setSoundEnabled(newState);
    };

    return (
        <button
            onClick={toggleSound}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-cyan-400"
            title={enabled ? 'Mute Sounds' : 'Enable Sounds'}
        >
            {enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
    );
};
