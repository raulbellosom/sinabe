import React from 'react';
import { Tooltip } from 'flowbite-react';
import { HiSparkles } from 'react-icons/hi';
import { useAIAgent } from '../../context/AIAgentContext.jsx';
import classNames from 'classnames';

const AIAgentButton = ({ className = '' }) => {
  const { openModal, isHealthy, isLoading } = useAIAgent();

  const getTooltipText = () => {
    if (!isHealthy) return 'Servicio de IA no disponible';
    if (isLoading) return 'IA procesando...';
    return 'Buscar con IA';
  };

  // Si no está disponible, ocultamos el botón completamente
  if (!isHealthy) {
    return null;
  }

  return (
    <Tooltip content={getTooltipText()} placement="bottom">
      <button
        type="button"
        onClick={openModal}
        disabled={isLoading}
        className={classNames(
          'p-2 rounded-full transition-all duration-200',
          isLoading
            ? 'text-purple-400 animate-pulse cursor-wait'
            : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50',
          className,
        )}
      >
        <HiSparkles className="w-6 h-6 sm:w-6 sm:h-6" />
      </button>
    </Tooltip>
  );
};

export default AIAgentButton;
