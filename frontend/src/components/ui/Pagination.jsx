import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  className = '',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <Button
        variant="ghost"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
        Anterior
      </Button>
      <p className="text-sm text-[color:var(--foreground-muted)]">
        Página {currentPage} de {totalPages}
      </p>
      <Button
        variant="ghost"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
        <ChevronRight size={16} />
      </Button>
    </div>
  );
};

export default Pagination;
