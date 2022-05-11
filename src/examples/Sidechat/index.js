import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
// import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
// import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Avatar from "@mui/material/Avatar";
// import MDInput from "components/MDInput";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React example components
// import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

import { fetchData, fetchSetData } from "utils/fetch";
import { API_HOST } from "utils/constants";
import webSocket from "socket.io-client";
// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ ws, setWs, color, brand, brandName, user, ...rest }) {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [input, setInput] = useState(null);
  function inputChange(e) {
    setInput(e.target.value);
  }
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } =
    controller;
  const location = useLocation();

  const listenMessage = () => {
    ws.emit("kanban", {
      kanbanId: localStorage.getItem("kanbanId"),
      uid: localStorage.getItem("uid"),
    });
    ws.on("getMessage", ({ uid, sender, message }) => {
      console.log(uid, sender, message);
      setMessages(function (prevData) {
        let myMsg;
        if (uid == localStorage.getItem("uid")) {
          myMsg = "myMsg";
        } else {
          myMsg = "";
        }
        return [...prevData, { uid, sender, message, myMsg }];
      });
    });
  };
  const sendMessage = () => {
    const message = input;
    ws.emit("getMessage", {
      uid: localStorage.getItem("uid"),
      sender: user.name,
      message,
      kanbanId: localStorage.getItem("kanbanId"),
    });
    setInput("");
  };

  useEffect(() => {
    if (ws) {
      listenMessage();
    }
  }, [ws]);

  useEffect(() => {
    fetchData(`${API_HOST}/chat/${localStorage.getItem("kanbanId")}`).then(
      (messages) => {
        const newMessages = messages.map((message) => {
          if (message.uid == localStorage.getItem("uid")) {
            message.myMsg = "myMsg";
          } else {
            message.myMsg = "";
          }
          return message;
        });
        setMessages(newMessages);
      }
    );
  }, []);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => {
    setMiniSidenav(dispatch, true);
  };

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : transparentSidenav
      );
      setWhiteSidenav(
        dispatch,
        window.innerWidth < 1200 ? false : whiteSidenav
      );
    }
    /**
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      {miniSidenav ? (
        <>
          <Grid
            mt={3}
            container
            direction="row"
            alignItems="center"
            justifyContent="center"
          >
            <Grid item>
              <Avatar
                src={`https://avatars.dicebear.com/api/micah/${
                  user ? user.name : "default"
                }.svg`}
                sx={{ width: 56, height: 56 }}
              ></Avatar>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <MDBox pt={3} pb={1} px={4} textAlign="center">
            <Grid container direction="row" alignItems="center">
              <Grid item mr={2}>
                <Avatar
                  src={`https://avatars.dicebear.com/api/micah/${
                    user ? user.name : "default"
                  }.svg`}
                  sx={{ width: 56, height: 56 }}
                ></Avatar>
              </Grid>
              <Grid item>
                <MDTypography variant="h4" fontWeight="bold" color={textColor}>
                  {user ? user.name : ""}
                </MDTypography>
              </Grid>
            </Grid>
          </MDBox>
          <Divider
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
          <div className="chat-body">
            <Grid
              container
              direction="column"
              alignItems="space-evenly"
              style={{ width: "100%" }}
              px={2}
            >
              {messages.map(({ uid, sender, message, myMsg }) => {
                return (
                  <Grid item mt={1} className={myMsg} style={{ width: "100%" }}>
                    <div
                      className="url-break"
                      style={{
                        display: "inline-block",
                        whiteSpace: "pre-line",
                        color: "white",
                        fontSize: "1rem",
                      }}
                    >
                      {sender}: {message}
                    </div>
                  </Grid>
                );
              })}
              <div ref={messagesEndRef}></div>
            </Grid>
          </div>

          <Grid container direction="row" justifyContent="space-evenly">
            <Grid item xs={6} md={6} lg={10} mt={3} mx={0}>
              <input
                type="text"
                value={input}
                onChange={inputChange}
                className="chat-input"
              />
            </Grid>
            <Grid item xs={6} md={6} lg={10} mt={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={sendMessage}
              >
                Send Message
              </MDButton>
            </Grid>
          </Grid>
          <Divider
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        </>
      )}
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "dark",
  ]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
};

export default Sidenav;
