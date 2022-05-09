import { useState, useEffect, useMemo, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { API_HOST } from "utils/constants";
// react-router-dom components
import { useLocation } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import Sidenav from "examples/Sidechat";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

//Peer
import Peer from "simple-peer";
import webSocket from "socket.io-client";
import { SOCKET_HOST } from "utils/constants";
import { getLocalStorage } from "utils/utils";
import styled from "styled-components";
const Container2 = styled.div`
  padding: 20px;
  width: 80vw;
  height: 30vh;
  margin: auto;
  position: absolute;
  z-index: 99;
  left: 500px;
  bottom: 100px;
`;

const StyledVideo = styled.video`
  height: 240px;
  width: 320px;
  margin: 20px;
`;

const Video2 = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

const style = {
  position: "fixed",
  bottom: "40px",
  right: "40px",
  zIndex: 999,
};

function DashboardLayout({ children }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();
  const [roomBtn, setRoomBtn] = useState("START MEETING");
  const [roomBtnColor, setRoomBtnColor] = useState("primary");
  const [room, setRoom] = useState(false);
  const [stream, setStream] = useState(true);
  const [screen, setScreen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [roomID, setRoomID] = useState(null);
  const [ws, setWs] = useState(null);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomRef = useRef(false);
  const recordUrlRef = useRef(null);
  const streamRef = useRef(false);
  const [user, setUser] = useState({});
  const kanbanId = getLocalStorage("kanbanId");
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      screen: true,
      audio: true,
      video: false,
      onStop: function (blobUrl, blob) {
        const uid = getLocalStorage("uid");
        //fetch s3 bucket with pre-signed url
        const url = recordUrlRef.current;
        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "video/mp4",
          },
          body: blob,
        });
      },
    });

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

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

  useEffect(() => {
    setWs(
      webSocket(`${SOCKET_HOST}`, {
        transports: ["websocket"],
      })
    );
    const kanbanId = getLocalStorage("kanbanId");
    fetchData(`${API_HOST}/task/${kanbanId}`, true).then(({ account }) => {
      setUser(account);
      localStorage.setItem("uid", account.id);
    });
  }, []);

  useEffect(() => {
    if (ws) {
      //listen while meeting is started
      ws.on("get room", (data) => {
        console.log(`a meeting is started: `, data.roomId);
        setRoomID(data.roomId);
        if (data.isNewRoom) {
          startRecording();
        }
      });

      ws.on("leave room", ({ message, result }) => {
        console.log(message);
        if (result) {
          recordUrlRef.current = result;
          stopRecording();
        }
      });
    }
  }, [ws]);

  useEffect(() => {
    if (room) {
      const uid = getLocalStorage("uid");
      roomRef.current = true;
      ws.emit("get room", { uid, kanbanId });

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
        });
    } else {
      if (!roomRef.current) {
        return;
      }
      setRoomBtn("START MEETING");
      setRoomBtnColor("primary");
      //if the room is created by the user stopRecording get the presigned url and
      const uid = getLocalStorage("uid");
      ws.emit("leave room", { uid, kanbanId });

      if (localStream && localStream.getTracks()) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      setLocalStream(null);

      ws.emit("leave meet", ws.id);

      ws.off("all users", (users) => {});

      ws.off("user joined", (payload) => {});

      ws.off("receiving returned signal", (payload) => {});
      ws.off("user left", (payload) => {});
      roomRef.current = false;
    }
  }, [room]);

  useEffect(() => {
    if (localStream) {
      userVideo.current.srcObject = localStream;
      ws.emit("join room", kanbanId);
      console.log(`you've joined a meeting room`);
      setRoomBtn("LEAVE THE ROOM");
      setRoomBtnColor("success");
      ws.on("all users", (users) => {
        const peers = [];
        users.forEach((userID) => {
          const peer = createPeer(userID, ws.id, localStream);
          peersRef.current.push({
            peerID: userID,
            peer,
          });
          peers.push({
            peerID: userID,
            peer,
          });
        });
        setPeers(peers);
      });

      ws.on("user joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, localStream);
        peersRef.current.push({
          peerID: payload.callerID,
          peer,
        });

        const peerObj = {
          peer,
          peerID: payload.callerID,
        };

        setPeers((users) => [...users, peerObj]);
      });

      ws.on("receiving returned signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });

      ws.on("user left", (id) => {
        const peerObj = peersRef.current.find((p) => p.peerID === id);
        if (peerObj) {
          peerObj.peer.destroy();
        }
        const peers = peersRef.current.filter((p) => p.peerID !== id);
        peersRef.current = peers;
        setPeers(peers);
      });
    }
  }, [localStream]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const style = {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    zIndex: 999,
  };

  function changeMeetingState() {
    if (room) {
      setRoom(false);
    } else {
      setRoom(true);
      setRoomBtn("Connecting...")
    }
  }

  function changeStreamState() {
    if (stream) {
      setStream(false);
    } else {
      setStream(true);
    }
    streamRef.current = true;
  }

  function changeScreenState() {
    if (screen) {
      setScreen(false);
    } else {
      setScreen(true);
    }
  }

  return (
    <>
      <Sidenav ws={ws} user={user} />

      <Box sx={{ "& > :not(style)": { m: 1 } }} style={style}>
        <Fab
          color={roomBtnColor}
          variant="extended"
          aria-label="add"
          onClick={changeMeetingState}
          style={{ width: "200px" }}
        >
          <h6 style={{ fontSize: "1rem", color: "white" }}>{roomBtn}</h6>
        </Fab>
      </Box>
      {room ? (
        <Container2>
          <StyledVideo muted ref={userVideo} autoPlay playsInline />
          {peers ? (
            peers.map((peer) => {
              if (peer.peer.readable) {
                return (
                  <Video2
                    key={peer.peerID}
                    peer={peer.peer}
                    class="video-peer"
                  />
                );
              }
            })
          ) : (
            <></>
          )}
        </Container2>
      ) : (
        <></>
      )}

      <MDBox
        sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
          p: 3,
          position: "relative",

          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
            transition: transitions.create(["margin-left", "margin-right"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        <DashboardNavbar />
        {children}
      </MDBox>
    </>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
