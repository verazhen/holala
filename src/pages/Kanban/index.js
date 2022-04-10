import React from "react";
import { API_GET_DATA } from "../../global/constants";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import List from "./components/List";
import Header from "./components/Header";
import "./index.css";

//get data
async function fetchData(setData) {
  const res = await fetch("http://localhost:5000/api/1.0/task");
  const { data } = await res.json();
  setData(data);
}


const Kanban = () => {
  const [lists, setLists] = useState([]);
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

  //第一次render, get data
  useEffect(() => {
    fetchData(setLists);
  }, []);

  return (
    <Container>
      <Row>
        <Col className="chat-room"></Col>
        <Col className="kanban">
          <Header />
          <Row className="list-kanban">
            {lists.map(({listName,tasks}) => (
              <Col>
                <List listName={listName} tasks={tasks} />
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
