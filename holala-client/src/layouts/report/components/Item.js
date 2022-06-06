import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import ClearIcon from "@mui/icons-material/Clear";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import BasicModal from "components/BasicModal";
import BasicModalEditor from "components/BasicModalEditor";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { API_HOST } from "utils/constants";
import Avatar from "@mui/material/Avatar";

import { Draggable } from "react-beautiful-dnd";
const Item = ({
  taskId,
  uniqueId,
  taskName,
  taskOrder,
  submittingStatus,
  index,
  delStatus,
  lists,
  listIndex,
  setLists,
  deleteDt,
  kanbanId,
  listId,
  task,
  tags,
  blockTasks,
  setTags,
  members,
  user,
  ws,
  editingRef,
  taskUpdateQue,
  setTaskUpdateQue,
  editor,
}) => {
  const draggableId = `${taskId}`;
  const [open, setOpen] = useState(false);
  const isBlocked = useRef(false);
  const isEditor = useRef(false);

  function deleteItem() {
    if (blockTasks.current[listId]) {
      const blocked = blockTasks.current[listId].some(({ block }) => {
        return block === taskId;
      });

      if (blocked) {
        alert("the item is blocked");
        return;
      }
    }

    const list = lists[listIndex];
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[listIndex].tasks[index].delete_dt = 1;
    setLists(newLists);
    const tasks = {
      kanbanId,
      tasks: newLists,
    };
    ws.emit("task update", tasks);

    const data = { delete_dt: 1, title: task.title };
    fetchPutData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}`,
      data
    );
  }
  const styles = {
    fontFamily: "sans-serif",
    textAlign: "center",
    top: "30%",
  };

  function onOpenModal(e) {
    //check if clicking delete btn
    if (
      e.target.nodeName == "BUTTON" ||
      e.target.nodeName == "svg" ||
      e.target.nodeName == "path"
    ) {
      return;
    }

    if (blockTasks.current[listId]) {
      isBlocked.current = blockTasks.current[listId].some(({ block }) => {
        return block === taskId;
      });
    } else {
      isBlocked.current = false;
    }

    setOpen(true);
    editingRef.current = true;

    //emit to block the task
    if (user.role_id > 1 || isBlocked.current) {
      return;
    }
    ws.emit("task block", { toBlock: true, taskId });
  }

  function startEdit(e) {
    onOpenModal(e);
  }

  function onCloseModal() {
    setOpen(false);
    editingRef.current = false;

    if (user.role_id > 1 || isBlocked.current) {
      return;
    }

    if (blockTasks.current[listId]) {
      blockTasks.current[listId] = blockTasks.current[listId].filter(
        ({ block }) => {
          return block !== taskId;
        }
      );
    }
    ws.emit("task block", { toBlock: false, taskId });
  }

  return (
    <Draggable key={taskId} draggableId={draggableId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          id="task"
          onClick={(e) => startEdit(e)}
        >
          <MDBox m="auto" my={2} bgColor="secondary" className="item">
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              wrap="nowrap"
            >
              <Grid item xs={9}>
                <div className="item-text">{taskName}</div>
              </Grid>
              {user.role_id > 1 ? (
                <Grid item xs={3}></Grid>
              ) : (
                <Grid item xs={3}>
                  <MDButton
                    variant="primary"
                    color="secondary"
                    size="small"
                    style={{ width: "100%", padding: "5px" }}
                    onClick={deleteItem}
                  >
                    <ClearIcon />
                  </MDButton>
                </Grid>
              )}
            </Grid>
            {editor ? (
              <Avatar
                src={`https://avatars.dicebear.com/api/micah/${editor}.svg`}
                sx={{ width: 20, height: 20 }}
              ></Avatar>
            ) : (
              <></>
            )}
          </MDBox>
          {user.role_id > 1 || isBlocked.current ? (
            <BasicModal
              open={open}
              setOpen={setOpen}
              onCloseModal={onCloseModal}
              taskName={taskName}
              taskIndex={index}
              setLists={setLists}
              lists={lists}
              listIndex={listIndex}
              submittingStatus={submittingStatus}
              kanbanId={kanbanId}
              listId={listId}
              taskId={taskId}
              task={task}
              hashtags={tags}
              setTags={setTags}
              memberList={members}
              user={user}
              taskUpdateQue={taskUpdateQue}
              setTaskUpdateQue={setTaskUpdateQue}
            />
          ) : (
            <BasicModalEditor
              open={open}
              setOpen={setOpen}
              onCloseModal={onCloseModal}
              taskName={taskName}
              taskIndex={index}
              setLists={setLists}
              lists={lists}
              listIndex={listIndex}
              submittingStatus={submittingStatus}
              kanbanId={kanbanId}
              listId={listId}
              taskId={taskId}
              task={task}
              hashtags={tags}
              setTags={setTags}
              memberList={members}
              user={user}
              taskUpdateQue={taskUpdateQue}
              setTaskUpdateQue={setTaskUpdateQue}
              ws={ws}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Item;
