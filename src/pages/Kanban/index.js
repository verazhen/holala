import React from "react";
import { API_GET_DATA } from "../../global/constants";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import List from "./components/List";
import Header from "./components/Header";
import "./index.css";

const data = [
  {
    listName: "List",
  },
];

const Kanban = () => {
  const [lists, setLists] = useState(data);
  function addItem() {
    setLists(function (prevData) {
      return [
        ...prevData,
        {
          listName: "List",
        },
      ];
    });
  }
  return (
    <Container>
    <Row>
      <Col className="chat-room">
      </Col>
      <Col className="kanban">
        <Header />
        <Row className="list-kanban">
          {lists.map((list) => (
            <Col>
              <List listName={list.listName} />
            </Col>
          ))}
          <Col>
            <Button onClick={addItem}>Add List</Button>
          </Col>
        </Row>
      </Col>
      </Row>
    </Container>
  );
};

export default Kanban;
