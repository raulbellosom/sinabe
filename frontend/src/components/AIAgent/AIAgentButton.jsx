import React from 'react';
import { Button, Tooltip } from 'flowbite-react';
import { HiSparkles, HiExclamationCircle } from 'react-icons/hi';
import { useAIAgent } from '../../context/AIAgentContext.jsx';

const AIAgentButton = ({ className = '' }) => {
  const { openModal, isHealthy, isLoading } = useAIAgent();

  const getButtonColor = () => {
    if (!isHealthy) return 'failure';
    if (isLoading) return 'warning';
    return 'purple';
  };

  const getTooltipText = () => {
    if (!isHealthy) return 'Servicio de IA no disponible';
    if (isLoading) return 'IA procesando...';
    return 'Buscar con Inteligencia Artificial';
  };

  const getIcon = () => {
    if (!isHealthy) return <HiExclamationCircle className="w-5 h-5" />;
    return <HiSparkles className="w-5 h-5" />;
  };

  return (
    <Tooltip content={getTooltipText()} placement="bottom">
      <Button
        color={getButtonColor()}
        size="sm"
        onClick={openModal}
        disabled={!isHealthy || isLoading}
        className={`
          h-10 w-10 
          flex items-center justify-center 
          rounded-lg 
          transition-all duration-200 
          hover:scale-105 
          focus:ring-2 focus:ring-purple-300
          ${!isHealthy ? 'opacity-50 cursor-not-allowed' : ''}
          ${isLoading ? 'animate-pulse' : ''}
          ${className}
        `}
        style={{
          borderStyle: 'none',
          minWidth: '40px',
          padding: '8px',
        }}
      >
        <div className="flex items-center justify-center w-full h-full">
          {getIcon()}
        </div>
      </Button>
    </Tooltip>
  );
};

export default AIAgentButton;
