import React from 'react';
import { MdOutlinePushPin, MdPushPin } from 'react-icons/md';

const PinIcon = ({ isPinned, onToggle, isPinMode, className = '' }) => {
  if (!isPinMode) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`
        p-1 rounded-full transition-all duration-200 
        ${
          isPinned
            ? 'text-green-600 bg-green-100 hover:bg-green-200'
            : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
        }
        ${className}
      `}
      title={isPinned ? 'Desfijar campo' : 'Fijar campo'}
    >
      {isPinned ? (
        <MdPushPin className="w-4 h-4" />
      ) : (
        <MdOutlinePushPin className="w-4 h-4" />
      )}
    </button>
  );
};

export default PinIcon;
