import { useState, useEffect, useMemo, useRef, useContext } from "react";
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
import Grid from "@mui/material/Grid";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

//Peer
import Peer from "simple-peer";
import webSocket from "socket.io-client";
import { SOCKET_HOST } from "utils/constants";
import { SocketProvider } from "examples/LayoutContainers/DashboardLayout/socket_context";
import SocketContext from "examples/LayoutContainers/DashboardLayout/socket_context";
import { getLocalStorage } from "utils/utils";
import styled from "styled-components";
const containerStyle = {
  padding: "0 20px",
  width: "80vw",
  height: "30vh",
  margin: "auto",
  position: "absolute",
  zIndex: 99,
  left: "16vw",
  bottom: "0px",
  overflowX: "auto",
};

const videoStyle = {
  height: "210px",
  width: "290px",
  margin: "0 20px",
  borderRadius: "15px",
};

const style = {
  position: "fixed",
  bottom: "40px",
  right: "40px",
  zIndex: 999,
};

function DashboardLayout({ children, videoOpen, setVideoOpen }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();
  const [roomBtn, setRoomBtn] = useState("START MEETING");
  const [roomBtnColor, setRoomBtnColor] = useState("primary");
  const [roomStatus, setRoomStatus] = useState(null);
  const [rtc, setRtc] = useState(null);
  const [stream, setStream] = useState(true);
  const [screen, setScreen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [roomID, setRoomID] = useState(null);
  const ws = useContext(SocketContext);
  const [peers, setPeers] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomRef = useRef(false);
  const recordUrlRef = useRef(null);
  const streamRef = useRef(false);
  const [user, setUser] = useState({});
  const kanbanId = getLocalStorage("kanbanId");

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  useEffect(() => {
    const kanbanId = getLocalStorage("kanbanId");
    fetchData(`${API_HOST}/kanban/${kanbanId}/tasks`, true).then(
      ({ account }) => {
        setUser(account);
        localStorage.setItem("uid", account.id);
      }
    );
  }, []);

  function changeMeetingState() {
    setVideoOpen(!videoOpen);

    if (!videoOpen) {
      setRoomBtn("Connecting...");
      window.initRtc();
      setRoomBtn("STOP MEETING");
    } else {
      setRoomBtn("START MEETING");
      setRoomBtnColor("primary");
      window.closeRtc();
      roomRef.current = false;
    }
  }

  useEffect(() => {
    if (localStream) {
      setRoomBtn("LEAVE THE ROOM");
      setRoomBtnColor("dark");
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

  return (
    <>
      <SocketProvider>
        <Sidenav ws={ws} user={user} />

        <Box sx={{ "& > :not(style)": { m: 1 } }} style={style}>
          <Fab
            color={roomBtnColor}
            variant="extended"
            aria-label="add"
            onClick={changeMeetingState}
            style={{ width: "200px", height: "60px" }}
          >
            <Grid container direction="column">
              <Grid item>
                <h6 style={{ fontSize: "1rem", color: "white" }}>{roomBtn}</h6>
              </Grid>
              <Grid item>
                <p
                  style={{
                    fontSize: "0.8rem",
                    textAlign: "center",
                    color: "white",
                  }}
                >
                  {roomStatus}
                </p>
              </Grid>
            </Grid>
          </Fab>
        </Box>

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
      </SocketProvider>
    </>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
