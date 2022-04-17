import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Header = ({ stream, setStream, ws, setWs, video, setVideo }) => {
  function changeStreamState() {
    if (stream) {
      setStream(false);
    } else {
      setStream(true);
    }
  }

  return (
    <Container className="header">
      <Row>
        <Col xs={3}>
          <h1>Project Name</h1>
        </Col>
        <Col xs={7}>
          <p>Last update : 4/03/2022 17:51:01</p>
        </Col>
        <Col xs={2}>
          <Button className="sync-kanban" onClick={changeStreamState}>
            Sync Kanban
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={1}>
          <h2>Kanban</h2>
        </Col >
        <Col xs={2}>
          <h2>Meeting Minute</h2>
        </Col>
        <Col xs={2}>
          <h2>Report</h2>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
