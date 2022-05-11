import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import ClearIcon from '@mui/icons-material/Clear';
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import BasicModal from "components/BasicModal";
import BasicModalEditor from "components/BasicModalEditor";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { API_HOST } from "utils/constants";

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
  setTags,
  members,
  user,
  ws,
}) => {
  const draggableId = `${taskOrder}-${taskName}`;
  const [open, setOpen] = useState(false);

  function deleteItem() {
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
    ).then((res) => console.log(res));
  }
  const styles = {
    fontFamily: "sans-serif",
    textAlign: "center",
    top: "30%",
  };

  function onOpenModal(e) {
    if (e.target.nodeName == "BUTTON") {
      return;
    }
    setOpen(true);
  }

  function onCloseModal() {
    setOpen(false);
  }

  return (
    <Draggable key={taskId} draggableId={draggableId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          id="task"
          onClick={(e) => onOpenModal(e)}
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
                <></>
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
          </MDBox>
          {user.role_id > 1 ? (
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
            />
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Item;
