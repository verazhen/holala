import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = () => {
  return (
    <Container className="header">
      <Row>
        <Col>
          <h1>Project Name</h1>
        </Col>
        <Col>
          <p>Last update : 4/03/2022 17:51:01</p>
        </Col>
        <Col>
          <Button className="sync-kanban">Sync Kanban</Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <h2>Kanban</h2>
        </Col>
        <Col>
          <h2>Meeting Minute</h2>
        </Col>
        <Col>
          <h2>Report</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
