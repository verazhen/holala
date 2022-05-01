import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/KanbanList";
import projectsTableData from "layouts/report/data/projectsTableData";
import { fetchData, fetchSetData } from "utils/fetch";
import { v4 } from "uuid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Item from "./Item";

const List = ({
  kanbanId,
  listId,
  tasks,
  listIndex,
  lists,
  setLists,
  submitTask,
  tags,
  setTags,
}) => {
  const droppableId = `${listIndex}`;
  const delStatus = useRef(false);

  useEffect(() => {
    if (!submitTask.current) {
      return;
    }
    console.log("useEffect Task");
    console.log(tasks);
    fetchSetData(
      `http://localhost:5000/api/1.0/kanban/${kanbanId}/list/${listId}`,
      tasks
    ).then((lists) => (submitTask.current = false));
  }, [tasks]);

  //   delete data;
  //   useEffect(() => {
  //     //     預防data在網頁 第一次render時被清掉
  //     if (!delStatus.current) {
  //       return;
  //     }
  //     fetchDelData(listName, cards, listId, delStatus.current).then(
  //       (lists) => (delStatus.current = false)
  //     );
  //   }, [tasks]);

  function addTask() {
    submitTask.current = true;
    const title = "Task Untitled";
    const list = lists[listIndex];
    const newTasks = [
      ...list.tasks,
      { list_id: listId, unique_id: v4(), title, checked: 0 },
    ];
    const newList = JSON.parse(JSON.stringify(lists));
    newList[listIndex].tasks = newTasks;

    setLists(newList);
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

      <Droppable droppableId={droppableId} index={listIndex}>
        {(provided) => (
          <div
            className="list"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map((task, index) => {
              if (!task.delete_dt) {
                return (
                  <Item
                    key={task.id}
                    taskId={task.id}
                    uniqueId={task.unique_id}
                    task={task}
                    taskName={task.title}
                    taskOrder={task.orders}
                    index={index}
                    submittingStatus={submitTask}
                    delStatus={delStatus}
                    lists={lists}
                    listIndex={listIndex}
                    setLists={setLists}
                    deleteDt={task.delete_dt}
                    kanbanId={kanbanId}
                    listId={listId}
                    tags={tags}
                    setTags={setTags}
                  />
                );
              } else {
                <></>;
              }
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default List;
