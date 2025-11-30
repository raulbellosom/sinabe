import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Checkbox } from 'flowbite-react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../DragAndDrop/StrictModeDroppable';
import { MdDragIndicator, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { FaSave, FaUndo } from 'react-icons/fa';
import classNames from 'classnames';

const ColumnCustomizationModal = ({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  columnOrder,
  onSave,
}) => {
  // Initialize with proper defaults
  const defaultColumnOrder = useMemo(
    () => columns.map((col) => col.key),
    [columns],
  );
  const defaultVisibleColumns = useMemo(
    () => columns.map((col) => col.key),
    [columns],
  );

  const [localVisibleColumns, setLocalVisibleColumns] = useState(
    visibleColumns.length > 0 ? [...visibleColumns] : defaultVisibleColumns,
  );
  const [localColumnOrder, setLocalColumnOrder] = useState(
    columnOrder.length > 0 ? [...columnOrder] : defaultColumnOrder,
  );

  // Add a mounted state to prevent rendering issues
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure Modal is fully rendered
      const timer = setTimeout(() => {
        setIsMounted(true);
        const newVisibleColumns =
          visibleColumns.length > 0
            ? [...visibleColumns]
            : defaultVisibleColumns;
        const newColumnOrder =
          columnOrder.length > 0 ? [...columnOrder] : defaultColumnOrder;

        setLocalVisibleColumns(newVisibleColumns);
        setLocalColumnOrder(newColumnOrder);
      }, 50);

      return () => {
        clearTimeout(timer);
        setIsMounted(false);
      };
    } else {
      setIsMounted(false);
    }
  }, [
    isOpen,
    visibleColumns,
    columnOrder,
    defaultVisibleColumns,
    defaultColumnOrder,
  ]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(localColumnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalColumnOrder(items);
  };

  const handleToggleColumn = (columnKey) => {
    setLocalVisibleColumns((prev) => {
      if (prev.includes(columnKey)) {
        return prev.filter((key) => key !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  const handleSelectAll = () => {
    setLocalVisibleColumns(columns.map((col) => col.key));
  };

  const handleDeselectAll = () => {
    // Keep only essential columns (images, actions)
    setLocalVisibleColumns(['images', 'actions']);
  };

  const handleReset = () => {
    setLocalColumnOrder(defaultColumnOrder);
    setLocalVisibleColumns(defaultVisibleColumns);
  };

  const handleSave = () => {
    onSave(localVisibleColumns, localColumnOrder);
    onClose();
  };

  const getColumnLabel = (columnKey) => {
    const column = columns.find((col) => col.key === columnKey);
    return column?.title || columnKey;
  };

  return (
    <Modal
      show={isOpen}
      onClose={onClose}
      size="2xl"
      className="p-0"
      theme={{
        root: {
          base: 'fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-hidden md:inset-0 md:h-full',
        },
      }}
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <span className="text-lg md:text-xl font-semibold">
          Personalizar Columnas
        </span>
      </Modal.Header>
      <Modal.Body className="p-3 md:p-6" style={{ overflow: 'hidden' }}>
        <div className="space-y-3 md:space-y-4">
          {/* Quick Actions - Responsive Stack */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-3 md:pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 flex-wrap">
              <Button
                size="xs"
                color="gray"
                onClick={handleSelectAll}
                className="flex-1 sm:flex-none"
              >
                <span className="text-xs">Seleccionar Todo</span>
              </Button>
              <Button
                size="xs"
                color="gray"
                onClick={handleDeselectAll}
                className="flex-1 sm:flex-none"
              >
                <span className="text-xs">Deseleccionar</span>
              </Button>
            </div>
            <Button
              size="xs"
              color="failure"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              <FaUndo className="mr-1 h-3 w-3" />
              <span className="text-xs">Restablecer</span>
            </Button>
          </div>

          {/* Summary - Mobile First */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-2 md:p-3 rounded-md">
            <p className="text-xs md:text-sm text-purple-800 dark:text-purple-200 font-medium">
              {localVisibleColumns.length} de {columns.length} columnas visibles
            </p>
          </div>

          {/* Instructions - Collapsible on Mobile */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 md:p-3 rounded-md">
            <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
              <strong className="hidden md:inline">Instrucciones: </strong>
              <span className="md:hidden">💡 </span>
              Arrastra para reordenar. Marca/desmarca para mostrar/ocultar.
            </p>
          </div>

          {/* Drag & Drop List - Optimized for Mobile */}
          <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1">
            {isMounted && localColumnOrder.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <StrictModeDroppable droppableId="columns">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={classNames('space-y-1.5 md:space-y-2', {
                        'bg-gray-50 dark:bg-gray-800 rounded-md p-1':
                          snapshot.isDraggingOver,
                      })}
                    >
                      {localColumnOrder
                        .filter((columnKey) => {
                          // Only render columns that exist in the columns array
                          return columns.some((col) => col.key === columnKey);
                        })
                        .map((columnKey, index) => {
                          const isVisible =
                            localVisibleColumns.includes(columnKey);
                          const isEssential =
                            columnKey === 'images' || columnKey === 'actions';

                          return (
                            <Draggable
                              key={columnKey}
                              draggableId={columnKey}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={classNames(
                                    'flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-all touch-manipulation',
                                    {
                                      'shadow-lg scale-[1.02] md:scale-105 z-50 bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600':
                                        snapshot.isDragging,
                                      'opacity-50':
                                        !isVisible && !snapshot.isDragging,
                                    },
                                  )}
                                >
                                  {/* Drag Handle - Larger touch target on mobile */}
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 -ml-1 touch-manipulation"
                                  >
                                    <MdDragIndicator
                                      size={20}
                                      className="md:w-6 md:h-6"
                                    />
                                  </div>

                                  {/* Checkbox - Larger on mobile */}
                                  <div className="flex-shrink-0">
                                    <Checkbox
                                      checked={isVisible}
                                      onChange={() =>
                                        handleToggleColumn(columnKey)
                                      }
                                      disabled={isEssential}
                                      className="cursor-pointer w-4 h-4 md:w-5 md:h-5"
                                    />
                                  </div>

                                  {/* Column Label - Responsive text */}
                                  <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="font-medium text-sm md:text-base text-gray-700 dark:text-gray-200 truncate">
                                        {getColumnLabel(columnKey)}
                                      </span>
                                      {isEssential && (
                                        <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                                          Esencial
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Visibility Icon - Smaller on mobile */}
                                  <div className="text-gray-400 flex-shrink-0">
                                    {isVisible ? (
                                      <MdVisibility
                                        size={18}
                                        className="md:w-5 md:h-5"
                                      />
                                    ) : (
                                      <MdVisibilityOff
                                        size={18}
                                        className="md:w-5 md:h-5"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </DragDropContext>
            ) : (
              <div className="text-center p-4 text-gray-500">
                Cargando columnas...
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="flex flex-col-reverse sm:flex-row gap-2 border-t border-gray-200 dark:border-gray-700">
        <Button color="gray" onClick={onClose} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="purple"
          className="w-full sm:w-auto"
        >
          <FaSave className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ColumnCustomizationModal;
