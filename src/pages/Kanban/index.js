import React from "react";
import { API_GET_DATA } from "../../global/constants";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import List from "./components/List";
import Chat from "./components/Chat";
import Header from "./components/Header";
import "./index.css";

//get data
async function fetchData(setData, url) {
  const res = await fetch(url);
  const { data } = await res.json();
  setData(data);
}

async function fetchSetData(data, url) {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

const Kanban = () => {
  const [lists, setLists] = useState([]);
  const [messages, setMessages] = useState([]);
  const submittingStatus = useRef(false);
  const chatStatus = useRef(false);
  const newList = {
    listName: "List",
    tasks: [],
  };
  function addItem() {
    submittingStatus.current = true;
    setLists(function (prevData) {
      return [...prevData, newList];
    });
  }

  function isMyMessage() {
    setMessages((prevData) => {
      const data = prevData.map(({ uid, sender, kanbanId, message }) => {
        if (uid == 1) {
          return { uid, sender, kanbanId, message, me: "me" };
        } else {
          return { uid, sender, kanbanId, message, me: "notMe" };
        }
      });
      return data;
    });
  }

  //第一次render, get data
  useEffect(() => {
    fetchData(setLists, "http://localhost:5000/api/1.0/task");
    fetchData(setMessages, "http://localhost:5000/api/1.0/chat").then(() =>

      isMyMessage()
    );
  }, []);

  //   post data
  useEffect(() => {
    //預防data在網頁 第一次render時被清掉
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(lists, "http://localhost:5000/api/1.0/task").then(
      (lists) => (submittingStatus.current = false)
    );
  }, [lists]);

  return (
    <Container>
      <Row>
        <Col className="chat-room">
          <Chat messages={messages} setMessages={setMessages} />
        </Col>
        <Col className="kanban">
          <Header />
          <Row className="list-kanban">
            {lists.map(({ listId, listName, tasks }) => (
              <Col>
                <List listId={listId} listName={listName} tasks={tasks} />
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
