import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
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
}) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const draggableId = uniqueId.toString();
  function deleteItem() {
    submittingStatus.current = true;
    deleteData(function (prev) {
      return prev.filter((item) => item.taskId !== taskId);
    });
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
          <Container>
            <Row className="item">
              <Col xs={6}>
                <p className="item-name">{taskName}</p>
              </Col>
              {/*               <Col> */}
              {/*                 <Button onClick={handleShow} className="edit"> */}
              {/*                   edit */}
              {/*                 </Button> */}
              {/*               </Col> */}
              {/*               <Col> */}
              {/*                 <Button onClick={deleteItem} className="remove"> */}
              {/*                   del */}
              {/*                 </Button> */}
              {/*               </Col> */}
              {/*               <Modal show={show} onHide={handleClose} animation={false}> */}
              {/*                 <Modal.Header closeButton> */}
              {/*                   <Modal.Title>Task Name</Modal.Title> */}
              {/*                 </Modal.Header> */}
              {/*                 <Modal.Body> */}
              {/*                   <Form> */}
              {/*                     <Form.Group */}
              {/*                       className="mb-3" */}
              {/*                       controlId="exampleForm.ControlInput1" */}
              {/*                     > */}
              {/*                       <Form.Label>Assignee</Form.Label> */}
              {/*                       <Form.Control type="text" placeholder="Vera" autoFocus /> */}
              {/*                       <Form.Label>Due Date</Form.Label> */}
              {/*                       <Form.Control type="date" /> */}
              {/*                     </Form.Group> */}
              {/*                     <Form.Group */}
              {/*                       className="mb-3" */}
              {/*                       controlId="exampleForm.ControlTextarea1" */}
              {/*                     > */}
              {/*                       <Form.Label>Description</Form.Label> */}
              {/*                       <Form.Control as="textarea" rows={3} /> */}
              {/*                     </Form.Group> */}
              {/*                   </Form> */}
              {/*                 </Modal.Body> */}
              {/*                 <Modal.Footer> */}
              {/*                   <Button variant="secondary" onClick={handleClose}> */}
              {/*                     Close */}
              {/*                   </Button> */}
              {/*                   <Button variant="primary" onClick={handleClose}> */}
              {/*                     Save Changes */}
              {/*                   </Button> */}
              {/*                 </Modal.Footer> */}
              {/*               </Modal> */}
            </Row>
          </Container>
        </div>
      )}
    </Draggable>
  );
};

export default Item;
