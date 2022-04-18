import Item from "./Item";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useState } from "react";

const Card = ({
  cards,
  setCards,
  submittingStatus /* editData, deleteData, , */,
}) => {
  function handleOnDragEnd(result) {
    const items = Array.from(cards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    if (result.destination.index != 0) {
      items[result.destination.index].taskOrder =
        items[result.destination.index - 1].taskOrder + 1;
    } else {
      items[result.destination.index].taskOrder =
        items[result.destination.index + 1].taskOrder - 1;
    }
    submittingStatus.current = true;
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
            {cards.map(({ taskName, taskId, taskOrder, uniqueId }, index) => {
              return (
                <Item
                  key={taskId}
                  taskId={taskId}
                  uniqueId={uniqueId}
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
