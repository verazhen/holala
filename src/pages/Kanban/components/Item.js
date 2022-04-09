import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
const Item = ({
  id,
  note,
  date,
  time,
  editData,
  deleteData,
  submittingStatus,
}) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function deleteItem() {
    submittingStatus.current = true;
    deleteData(function (prev) {
      return prev.filter((item) => item.id !== id);
    });
  }

  return (
    <Container>
        <Row className="item">
          <Col xs={8}>
            <p className="item-name">Task Name</p>
          </Col>
          <Col>
          <Button onClick={handleShow} className="edit">
            edit
          </Button>
          </Col>
          <Col>
          <Button onClick={deleteItem} className="remove">
            del
          </Button>
          </Col>
          <Modal show={show} onHide={handleClose} animation={false}>
            <Modal.Header closeButton>
              <Modal.Title>Task Name</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Assignee</Form.Label>
                  <Form.Control type="text" placeholder="Vera" autoFocus />
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control type="date" />
                </Form.Group>
                <Form.Group
                  className="mb-3"
                  controlId="exampleForm.ControlTextarea1"
                >
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </Row>
    </Container>
  );
};

export default Item;
