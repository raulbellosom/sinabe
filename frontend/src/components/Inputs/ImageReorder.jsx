import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ImageViewer from '../ImageViewer/ImageViewer';

// Reordenar el array al mover los elementos
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const ImageReorder = ({ images, setImages }) => {
  // Manejador del evento de fin de arrastre
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedImages = reorder(
      images,
      result.source.index,
      result.destination.index,
    );

    setImages(reorderedImages); // Actualizar el estado con las imágenes reordenadas
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '10px',
            }}
          >
            {images.map((image, index) => (
              <Draggable key={image.id} draggableId={image.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      userSelect: 'none',
                      padding: '10px',
                      margin: '0 0 10px 0',
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      ...provided.draggableProps.style,
                    }}
                  >
                    <ImageViewer
                      src={image.src}
                      alt={`Imagen ${index + 1}`}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '5px',
                      }}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ImageReorder;
