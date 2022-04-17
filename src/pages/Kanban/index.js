import React from "react";
import { API_GET_DATA } from "../../global/constants";
import { init } from "../../util/webrtc";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Video } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import List from "./components/List";
import Chat from "./components/Chat";
import Header from "./components/Header";
import "./index.css";
import webSocket from "socket.io-client";

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

const Kanban = () => {
  const [lists, setLists] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stream, setStream] = useState(false); //是否開啟video room
  const [video, setVideo] = useState();
  const [remoteVideos, setRemoteVideos] = useState([]);
  const userVideo = useRef();
  const remoteVideoRef1 = useRef();
  const remoteVideoRef2 = useRef();
  const remoteVideoRef3 = useRef();
  const submittingStatus = useRef(false);
  const chatStatus = useRef(false);
  const [ws, setWs] = useState(null);
  let UserVideo;
  if (video) {
    UserVideo = (
      <video playsInline muted ref={userVideo} autoPlay id="my-video" />
    );
  }
  let RemoteVideo1;
  if (remoteVideos[0]) {
    console.log("RemoteVideo1");
    RemoteVideo1 = (
      <video
        playsInline
        muted
        ref={remoteVideoRef1}
        autoPlay
        id="remote-1"
        className="remote-video"
      ></video>
    );
  }
  //
  let RemoteVideo2;
  if (remoteVideos[1]) {
    RemoteVideo2 = (
      <video
        playsInline
        muted
        ref={remoteVideoRef2}
        autoPlay
        id="remote-2"
        className="remote-video"
      ></video>
    );
  }
  let RemoteVideo3;
  //     if (remoteVideos[2]) {
  //       RemoteVideo3 = (
  //         <video muted ref={remoteVideoRef3} autoPlay className="remote-video" videoHeight={480} videoWidth={600} ></video>
  //       );
  //     }

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
    fetchData(setMessages, "http://localhost:5000/api/1.0/chat").then(messages=>
        setMessages(messages)
    ).then(() =>
      isMyMessage()
    );
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
      init(
        setVideo,
        userVideo,
        ws,
        remoteVideos,
        setRemoteVideos,
        remoteVideoRef1,
        remoteVideoRef2
      );
    } else {
      console.log("關閉視訊");
    }
  }, [stream]);

  useEffect(() => {
    console.log("useEffect remoteVideos");
    //       if (remoteVideos.length === 0) {
    //         return;
    //       }
    //       const { broadcaster, stream } = remoteVideos[0];
    //       console.log("新stream傳入.....", broadcaster);
    //   //     remoteUserRef[broadcaster] = useRef();
    //
    //       if (remoteUserRef[broadcaster].current) {
    //         remoteUserRef[broadcaster].current.srcObject = stream;
    //       }
    if (remoteVideos.length === 0) {
      return;
    }
    const { stream } = remoteVideos[0];
    console.log(`第${remoteVideos.length}個stream傳入.....`);
    console.log(stream);

    if (remoteVideos.length === 1) {
      if (remoteVideoRef1.current) {
        console.log(remoteVideoRef1.current);
        remoteVideoRef1.current.srcObject = stream;
      }
    } else if (remoteVideos.length === 2) {
      if (remoteVideoRef2.current) {
        console.log(remoteVideoRef2.current);
        remoteVideoRef2.current.srcObject = stream;
      }
    } else if (remoteVideos.length === 3) {
      if (remoteVideoRef3.current) {
        console.log(remoteVideoRef3.current);
        remoteVideoRef3.current.srcObject = stream;
      }
    }
  }, [remoteVideos]);

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
          {UserVideo}
          {RemoteVideo1}
          {RemoteVideo2}
          {RemoteVideo3}
          {/*           {remoteVideos.map(({ broadcaster }) => { */}
          {/*             return ( */}
          {/*               <video */}
          {/*                 playsInline */}
          {/*                 muted */}
          {/*                 ref={remoteUserRef[broadcaster]} */}
          {/*                 autoPlay */}
          {/*                 className="remote-video" */}
          {/*               /> */}
          {/*             ); */}
          {/*           })} */}
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
