import { useState, useEffect, useRef } from "react";
import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import webSocket from "socket.io-client";

const Chat = () => {
  const [messages, setMessages] = useState([
    { uid: 1,me:"me", message: "對話訊息DEMO" },
    { uid: 2,me:"notMe", message: "對話訊息DEMO" },
  ]);
  //   const [ws, setWs] = useState(null);
  //
  //   const listenMessage = () => {
  //     ws.emit("kanban", "1");
  //     ws.on("getMessage", ({ uid,message }) => {
  //       setMessages(function (prevData) {
  //         return [...prevData, message];
  //       });
  //     });
  //   };
  //   const sendMessage = () => {
  //     const uid = localStorage.getItem("uid");
  //     ws.emit("getMessage", { uid, message: "對話訊息DEMO" });
  //   };
  //
  //   useEffect(() => {
  //     setWs(webSocket("http://localhost:3100"));
  //     const uid = window.prompt("userid", "1");
  //     localStorage.setItem("uid", uid);
  //   }, []);
  //
  //   useEffect(() => {
  //     if (ws) {
  //       listenMessage();
  //     }
  //   }, [ws]);

  return (
    <div>
      <h1>Chat Room</h1>
      <div className="chat-space">
        {messages.map(({ uid, me, message }) => (
          <p className={me}>{uid + ": " + message}</p>
        ))}
      </div>
      <Button className="edit">Connect</Button>
      <Button className="edit" /* onClick={sendMessage} */>Send</Button>
    </div>
  );
};

export default Chat;
