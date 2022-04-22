import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/KanbanList";
import projectsTableData from "layouts/report/data/projectsTableData";
import { fetchData, fetchSetData } from "utils/fetch";
import { v4 } from "uuid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Item from "./Item";
//post data
// async function fetchSetData(listName, tasks, listId) {
//   await fetch(`http://localhost:5000/api/1.0/task?list=${listId}`, {
//     method: "POST",
//     headers: {
//       "Content-type": "application/json",
//     },
//     body: JSON.stringify({ listId, listName, tasks }),
//   });
// }
//
// async function fetchDelData(listName, tasks, listId, uniqueId) {
//   await fetch(
//     `http://localhost:5000/api/1.0/task?list=${listId}&uniqueId=${uniqueId}`,
//     {
//       method: "delete",
//       headers: {
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ listId, listName, tasks }),
//     }
//   );
// }
//
const List = ({ kanbanId, listId, tasks }) => {
  const [cards, setCards] = useState(tasks);
  const submittingStatus = useRef(false);
  const delStatus = useRef(false);

  const { columns: pColumns, rows: pRows } = projectsTableData(cards);
  //   const submittingStatus = useRef(false);
  //   const delStatus = useRef(false);

  //post data
  useEffect(() => {
    //     預防data在網頁 第一次render時被清掉
    if (!submittingStatus.current) {
      return;
    }

    fetchSetData(
      `http://localhost:5000/api/1.0/kanban/${kanbanId}/list/${listId}`,
      cards
    ).then((lists) => (submittingStatus.current = false));
  }, [cards]);

  //delete data
  //   useEffect(() => {
  //     //     預防data在網頁 第一次render時被清掉
  //     if (!delStatus.current) {
  //       return;
  //     }
  //     fetchDelData(listName, cards, listId, delStatus.current).then(
  //       (lists) => (delStatus.current = false)
  //     );
  //   }, [cards]);
  function addTask() {
    submittingStatus.current = true;
    const title = "Task Untitled";
    setCards(function (prevData) {
      return [
        ...prevData,
        {
          unique_id: v4(),
          title,
          checked: 0,
        },
      ];
    });
  }

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
    <div>
      <MDButton
        //               component={Link}
        //               to={action.route}
        variant="primary"
        color="secondary"
        fullWidth
        onClick={addTask}
        //               color={action.color}
      >
        Add Task
      </MDButton>
      <DragDropContext  onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="list">
          {(provided) => (
            <div
              className="list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {cards.map(({ title, id, orders, unique_id }, index) => {
                return (
                  <Item
                    key={id}
                    taskId={id}
                    uniqueId={unique_id}
                    taskName={title}
                    taskOrder={orders}
                    index={index}
                    setCards={setCards}
                    submittingStatus={submittingStatus}
                    delStatus={delStatus}
                    //                       editData={editData}
                    //                       submittingStatus={submittingStatus}
                  />
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default List;
