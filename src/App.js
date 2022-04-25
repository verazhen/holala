import { useState, useEffect, useMemo, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";

// react-router components
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// @mui material components
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import Sidenav from "examples/Sidechat";
import Configurator from "examples/Configurator";

// Material Dashboard 2 React themes
import theme from "assets/theme";

// Material Dashboard 2 React Dark Mode themes
import themeDark from "assets/theme-dark";

// Material Dashboard 2 React routes
import routes from "routes";

// Material Dashboard 2 React contexts
import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

// Images
import brandWhite from "assets/images/logo-ct.png";
import brandDark from "assets/images/logo-ct-dark.png";

//Peer
import Peer from "simple-peer";
import webSocket from "socket.io-client";
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

const Video2 = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, []);

  return <StyledVideo playsInline autoPlay ref={ref} />;
};

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  let kanbanId = 1;
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const [roomBtn, setRoomBtn] = useState("START MEETING");
  const [room, setRoom] = useState(false);
  const [stream, setStream] = useState(false);
  const [screen, setScreen] = useState(false);
  const [ws, setWs] = useState(null);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomRef = useRef(false);
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ screen: true, audio: true, video: false });

  let roomID;

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
    setWs(webSocket("http://localhost:3400"));
    const uid = window.prompt("userid", "1");
    localStorage.setItem("uid", uid);
  }, []);

  useEffect(() => {
    console.log("peers");
    console.log(peers);
  }, [peers]);

  useEffect(() => {
    if (room) {
      console.log("創建房間");
      setRoomBtn("LEAVE THE ROOM")
      const uid = getLocalStorage("uid");
      const kanbanId = getLocalStorage("kanbanId");
      roomRef.current = true;
      ws.emit("get room", { uid, kanbanId });
      ws.on("get room", (id) => {
        roomID = id;
        console.log(`you are inside a meeting room: `, roomID);
      });
      startRecording();
    } else {
      if (!roomRef.current) {
        return;
      }
      console.log("停止會議");
      setRoomBtn("LEAVE THE ROOM")
      setRoomBtn("START MEETING")
      const uid = getLocalStorage("uid");
      const kanbanId = getLocalStorage("kanbanId");
      stopRecording();
      const url = mediaBlobUrl;
      ws.emit("leave room", { uid, kanbanId, url });
      ws.on("leave room", (msg) => {
        console.log(msg);
      });
      roomRef.current = false;
    }
  }, [room]);

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
            console.log(`there're: ${users} in the room now`);
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

  useEffect(() => {
    console.log("useEffect screen");
    if (screen) {
      console.log("螢幕分享");
      const constraints = {
        frameRate: 15,
        width: 640,
        height: 360,
      };
      navigator.mediaDevices.getDisplayMedia(constraints).then((stream) => {
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
      console.log("關閉螢幕分享");
    }
  }, [screen]);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={route.component}
            key={route.key}
          />
        );
      }

      return null;
    });

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  function changeMeetingState() {
    if (room) {
      setRoom(false);
    } else {
      setRoom(true);
    }
  }

  function changeStreamState() {
    if (stream) {
      setStream(false);
    } else {
      setStream(true);
    }
  }

  function changeScreenState() {
    if (screen) {
      setScreen(false);
    } else {
      setScreen(true);
    }
  }

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      {layout === "dashboard" && (
        <>
          <MDButton
            variant="gradient"
            color="info"
            fullWidth
            onClick={changeMeetingState}
          >
            {roomBtn}
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            fullWidth
            onClick={changeStreamState}
          >
            Sync Kanban
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            fullWidth
            onClick={changeScreenState}
          >
            ScreenSharing
          </MDButton>
          <Sidenav
            ws={ws}
            setWs={setWs}
            color={sidenavColor}
            brand={
              (transparentSidenav && !darkMode) || whiteSidenav
                ? brandDark
                : brandWhite
            }
            brandName="Vera Yang"
            //             routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />

          <Container2>
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
            {peers.map((peer, index) => {
              return <Video2 key={index} peer={peer} class="video-peer" />;
            })}
          </Container2>
          <Configurator />

          {configsButton}
        </>
      )}
      {layout === "vr" && <Configurator />}
      <Routes>
        {getRoutes(routes)}
        <Route path="*" element={<Navigate to="/index" />} />
      </Routes>
    </ThemeProvider>
  );
}
