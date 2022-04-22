import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import BasicModal from "components/BasicModal";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

import { Draggable } from "react-beautiful-dnd";
const Item = ({
  taskId,
  uniqueId,
  taskName,
  taskOrder,
  editData,
  deleteData,
  submittingStatus,
  index,
  delStatus,
}) => {
  const draggableId = uniqueId.toString();
  const [open, setOpen] = useState(false);
  //   function deleteItem() {
  //     delStatus.current = uniqueId;
  //     setCards(function (prev) {
  //       return prev.filter((item) => item.taskId !== taskId);
  //     });
  //   }
  const styles = {
    fontFamily: "sans-serif",
    textAlign: "center",
    top: "30%",
  };

  function onOpenModal() {
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
        >
          <MDBox
            m="auto"
            my={2}
            bgColor="secondary"
            className="item"
            onClick={onOpenModal}
          >
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              wrap="nowrap"
            >
              <Grid item xs={9}>
                <MDTypography variant="h6" color="white">
                  {taskName}
                </MDTypography>
              </Grid>
              <Grid item xs={3}>
                <MDButton variant="primary" color="secondary" size="small">
                  x
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
          <BasicModal
            open={open}
            setOpen={setOpen}
            onCloseModal={onCloseModal}
            taskName={taskName}
          />
        </div>
      )}
    </Draggable>
  );
};

export default Item;
