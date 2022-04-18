import React from "react";
import { API_GET_DATA } from "../../global/constants";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Video } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import List from "./components/List";
import Chat from "./components/Chat";
import Header from "./components/Header";
import "./index.css";
import webSocket from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";

const Container2 = styled.div`
  padding: 20px;
  width: 80vw;
  height: 30vh;
  border: 1px;
  margin: auto;
  flex-wrap: wrap;
  position: absolute;
  left: 500px;
  bottom: 0px;
`;

const StyledVideo = styled.video`
  height: 240px;
  width: 320px;
  margin: 20px;
`;


//get data
async function fetchData(setData, url) {
  console.log("fetchData in index");
  const res = await fetch(url);
  const { data } = await res.json();
  return data;
}

async function fetchSetData(data, url) {
  console.log("fetchSetData in index");
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

const Video2 = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const Kanban = () => {
  const [lists, setLists] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stream, setStream] = useState(false); //是否開啟video room
  const submittingStatus = useRef(false);
  const chatStatus = useRef(false);
  const [ws, setWs] = useState(null);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = 1;

  const config = {
    iceServers: [
      {
        urls: "stun:stun.stunprotocol.org",
      },
    ],
  };
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
  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      ws.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      ws.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }
  //第一次render, get data
  useEffect(() => {
    console.log("useEffect []");
    fetchData(setLists, "http://localhost:5000/api/1.0/task").then((lists) => {
      //sort the list data
      lists.forEach(({ tasks }) => {
        tasks.sort((a, b) => {
          return a.taskOrder - b.taskOrder;
        });
      });
      setLists(lists);
    });
    fetchData(setMessages, "http://localhost:5000/api/1.0/chat")
      .then((messages) => setMessages(messages))
      .then(() => isMyMessage());
    setWs(webSocket("http://localhost:3300"));
    const uid = window.prompt("userid", "1");
    localStorage.setItem("uid", uid);
  }, []);

  //   post data
  useEffect(() => {
    console.log("useEffect lists");
    //預防data在網頁 第一次render時被清掉
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(lists, "http://localhost:5000/api/1.0/task").then((lists) => {
      submittingStatus.current = false;
    });
  }, [lists]);



  useEffect(() => {
    console.log("useEffect stream");
    if (stream) {
      console.log("打開視訊");
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          userVideo.current.srcObject = stream;
         ws.emit("join room", roomID);
          ws.on("all users", (users) => {
            const peers = [];
            users.forEach((userID) => {
              const peer = createPeer(userID, ws.id, stream);
              peersRef.current.push({
                peerID: userID,
                peer,
              });
              peers.push(peer);
            });
            setPeers(peers);
          });

          ws.on("user joined", (payload) => {
            const peer = addPeer(payload.signal, payload.callerID, stream);
            peersRef.current.push({
              peerID: payload.callerID,
              peer,
            });

            setPeers((users) => [...users, peer]);
          });

          ws.on("receiving returned signal", (payload) => {
            const item = peersRef.current.find((p) => p.peerID === payload.id);
            item.peer.signal(payload.signal);
          });
        });
    } else {
      console.log("關閉視訊");
    }
  }, [stream]);

  return (
    <Container>
      <Row>
        <Col className="chat-room">
          <Chat
            messages={messages}
            setMessages={setMessages}
            ws={ws}
            setWs={setWs}
          />
        </Col>
        <Col className="kanban">
          <Header stream={stream} setStream={setStream} ws={ws} setWs={setWs} />
          <Container2>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
              return <Video2 key={index} peer={peer} class = "video-peer"/>;
            })}
          </Container2>
          <Row className="list-kanban">
            {lists.map(({ listId, listName, tasks }) => (
              <Col>
                <List listId={listId} listName={listName} tasks={tasks} />
              </Col>
            ))}
            <Col>
              <Button onClick={addItem} id="add-list">Add List</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Kanban;
