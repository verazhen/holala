import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import MDButton from "components/MDButton";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { v4 } from "uuid";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import Item from "./Item";
import { API_HOST } from "utils/constants";

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
  members,
  user,
  ws,
  blockTasks,
  editingRef,
  taskUpdateQue,
  setTaskUpdateQue,
  videoOpen,
  setVideoOpen,
}) => {
  const droppableId = `${listIndex}`;
  const delStatus = useRef(false);

  useEffect(() => {
    if (tasks.length === 0 || submitTask.current !== tasks[0].list_id) {
      return;
    }

    console.log("----------------");
    console.log(tasks);

    fetchPutData(`${API_HOST}/kanban/${kanbanId}/list/${listId}`, tasks).then(
      () => {
        submitTask.current = null;
      }
    );
  }, [tasks]);

  function addTask() {
    const title = "Task Untitled";
    const list = lists[listIndex];
    const newTask = { unique_id: v4(), title, checked: 0 };
    fetchSetData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/addTest`,
      newTask
    ).then(({ id }) => {
      newTask.id = id;
      const newTasks = [...list.tasks, newTask];
      const newList = JSON.parse(JSON.stringify(lists));
      newList[listIndex].tasks = newTasks;

      setLists(newList);

      const tasks = {
        kanbanId,
        tasks: newList,
      };
      ws.emit("task update", tasks);
    });
  }
  const listStyle = { maxHeight: "70vh", overflow: "auto" };
  const listStyleMeeting = { maxHeight: "40vh", overflow: "auto" };

  return (
    <div className="list" style={videoOpen ? listStyleMeeting : listStyle}>
      {user.role_id > 1 ? (
        <></>
      ) : (
        <MDButton
          variant="primary"
          color="secondary"
          fullWidth
          onClick={addTask}
        >
          Add Task
        </MDButton>
      )}

      <Droppable droppableId={droppableId} index={listIndex}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {tasks.length === 0 ? (
              <div style={{ height: "10px" }}></div>
            ) : (
              <></>
            )}
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
                    members={members}
                    user={user}
                    ws={ws}
                    blockTasks={blockTasks}
                    editingRef={editingRef}
                    taskUpdateQue={taskUpdateQue}
                    setTaskUpdateQue={setTaskUpdateQue}
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
