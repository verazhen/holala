import { useState, useEffect, useRef } from "react";
import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import webSocket from "socket.io-client";

const Chat = ({ messages, setMessages }) => {
  const [ws, setWs] = useState(null);
  const [input, setInput] = useState(null);
  function inputChange(e) {
    setInput(e.target.value);
  }

  const listenMessage = () => {
    ws.emit("kanban", "1");
    ws.on("getMessage", ({ uid, sender, message }) => {
      setMessages(function (prevData) {
        let me;
        if (uid == 1) {
          me = "me";
        } else {
          me = "notMe";
        }
        return [...prevData, { uid, sender, me, message }];
      });
    });
  };
  const sendMessage = () => {
    const uid = localStorage.getItem("uid");
    let sender;
    if (uid == 1) {
      sender = "Vera";
    } else {
      sender = "Shane";
    }
    const message = input;
    ws.emit("getMessage", { uid, sender, message });
  };

  useEffect(() => {
    setWs(webSocket("http://localhost:3100"));
    const uid = window.prompt("userid", "1");
    localStorage.setItem("uid", uid);
  }, []);

  useEffect(() => {
    if (ws) {
      listenMessage();
    }
  }, [ws]);

  return (
    <div>
      <h1>Chat Room</h1>
      <div className="chat-space">
        {messages.map(({ sender, me, message }) => (
          <p className={me}>{sender + ": " + message}</p>
        ))}
      </div>
      <Form>
        <input type="text" value={input} onChange={inputChange} />
        <Button className="edit">Online</Button>
        <Button className="edit" onClick={sendMessage}>
          Send
        </Button>
      </Form>
    </div>
  );
};

export default Chat;
