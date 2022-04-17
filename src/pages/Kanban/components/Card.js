import Item from "./Item";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useState } from "react";

const Card = ({
  cards,
  setCards /* editData, deleteData, submittingStatus, */,
}) => {
  function handleOnDragEnd(result) {
    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCards(items);
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <div
            className="list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {cards.map(({ taskName, taskId, taskOrder }, index) => {
              return (
                <Item
                  key={taskId}
                  id={taskId}
                  taskName={taskName}
                  taskOrder={taskOrder}
                  index={index}
                  //                       editData={editData}
                  //                       deleteData={deleteData}
                  //                       submittingStatus={submittingStatus}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Card;
