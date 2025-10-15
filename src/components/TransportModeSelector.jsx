import React from 'react';
import { TRANSPORT_MODES } from '../config/map';

const TransportModeSelector = ({ selectedMode, onModeSelect, showLabel = true }) => {
  return (
    <div>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Transport Mode
        </label>
      )}
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {TRANSPORT_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onModeSelect(mode.id)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200
              ${selectedMode === mode.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
            title={mode.label}
          >
            <span className="text-xl mb-1">{mode.icon}</span>
            <span className="text-xs font-medium text-center leading-tight">
              {mode.label.replace(/^[^\s]+ /, '')} {/* Remove emoji from label */}
            </span>
          </button>
        ))}
      </div>
      
      {selectedMode && (
        <div className="mt-2 text-sm text-gray-600">
          Selected: {TRANSPORT_MODES.find(mode => mode.id === selectedMode)?.label}
        </div>
      )}
    </div>
  );
};

export default TransportModeSelector;