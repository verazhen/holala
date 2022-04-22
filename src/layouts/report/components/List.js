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
const List = ({
  kanbanId,
  listId,
  tasks,
  listIndex,
  lists,
  setLists,
  submitTask,
}) => {
  const droppableId = `${listIndex}`;
  const delStatus = useRef(false);

  //   const submittingStatus = useRef(false);
  //   const delStatus = useRef(false);

  useEffect(() => {
    if (!submitTask.current) {
      return;
    }
    console.log("useEffect tasks, listId=> ",listId);
    fetchSetData(
      `http://localhost:5000/api/1.0/kanban/${kanbanId}/list/${listId}`,
      tasks
    ).then((lists) => (submitTask.current = false));
  }, [tasks]);
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
    submitTask.current = true;
    const title = "Task Untitled";
    const list = lists[listIndex];
    const newTasks = [...list.tasks, { unique_id: v4(), title, checked: 0 }];
    const newList = JSON.parse(JSON.stringify(lists));
    newList[listIndex].tasks = newTasks;

    setLists(newList);
  }

  //   function handleOnDragEnd(result) {
  //     const items = Array.from(cards);
  //     const [reorderedItem] = items.splice(result.source.index, 1);
  //     items.splice(result.destination.index, 0, reorderedItem);
  //
  //     if (result.destination.index != 0) {
  //       items[result.destination.index].orders =
  //         items[result.destination.index - 1].orders + 1;
  //     } else {
  //       items[result.destination.index].orders =
  //         items[result.destination.index + 1].orders - 1;
  //     }
  //     submittingStatus.current = true;
  //     setCards(items);
  //   }

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

      <Droppable droppableId={droppableId} index={listIndex}>
        {(provided) => (
          <div
            className="list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map(({ title, id, orders, unique_id }, index) => {
              return (
                <Item
                  key={id}
                  taskId={id}
                  uniqueId={unique_id}
                  taskName={title}
                  taskOrder={orders}
                  index={index}
                  submittingStatus={submitTask}
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
    </div>
  );
};

export default List;
