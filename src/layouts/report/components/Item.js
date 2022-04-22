import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
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
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const draggableId = uniqueId.toString();
//   function deleteItem() {
//     delStatus.current = uniqueId;
//     setCards(function (prev) {
//       return prev.filter((item) => item.taskId !== taskId);
//     });
//   }

  return (
    <Draggable key={taskId} draggableId={draggableId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          id="task"
        >
          <MDBox mx={0} mt={0} bgColor="transparent" className="item">
            <Grid container direction="row"  justifyContent="flex-start" wrap="nowrap">
              <Grid item xs={6}>
              <MDTypography variant="h6">
                {taskName}
                </MDTypography>
              </Grid>
              <Grid item xs={3}>
                <MDButton variant="gradient" color="secondary" size="small">
                  EDIT
                </MDButton>
              </Grid>
              <Grid item xs={3}>
                <MDButton variant="gradient" color="secondary" size="small">
                  DELETE
                </MDButton>
              </Grid>
            </Grid>
          </MDBox>
        </div>
      )}
    </Draggable>
  );
};

export default Item;
