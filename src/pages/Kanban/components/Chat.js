import { useState, useEffect, useRef } from "react";
import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";

const Chat = ({ messages, setMessages, ws, setWs }) => {

  const [input, setInput] = useState(null);
  function inputChange(e) {
    setInput(e.target.value);
  }

  const listenMessage = () => {
    ws.emit("kanban", {kanbanId:1,uid:localStorage.getItem("uid")});
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
      sender = "ME";
    } else {
      sender = "Vera";
    }
    const message = input;
    ws.emit("getMessage", { uid, sender, message });
  };

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
        <Button className="edit" id="online">Online</Button>
        <Button className="edit" id="send" onClick={sendMessage}>
          Send
        </Button>
      </Form>
    </div>
  );
};

export default Chat;
