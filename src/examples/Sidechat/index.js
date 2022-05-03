import { useEffect, useState } from "react";

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

function Sidenav({ ws, setWs, color, brand, brandName, ...rest }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(null);
  function inputChange(e) {
    setInput(e.target.value);
  }
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } =
    controller;
  const location = useLocation();
  //   const collapseName = location.pathname.replace("/", "");

  const listenMessage = () => {
    ws.emit("kanban", { kanbanId: 1, uid: localStorage.getItem("uid") });
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
    setInput("");
  };

  useEffect(() => {
    if (ws) {
      listenMessage();
    }
  }, [ws]);

  useEffect(() => {
    fetchData(`${API_HOST}/chat`).then((messages) => setMessages(messages));
    //       .then(() => isMyMessage());
    //     const uid = window.prompt("userid", "1");
    //     localStorage.setItem("uid", uid);
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

  const closeSidenav = () => setMiniSidenav(dispatch, true);
  const style = {
    height: "72%",
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
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && (
            <MDBox component="img" src={brand} alt="Brand" width="2rem" />
          )}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography
              component="h6"
              variant="button"
              fontWeight="bold"
              color={textColor}
            >
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <div style={style}>
        <Grid container direction="column" alignItems="space-evenly" px={3}>
          {messages.map(({ sender, message }) => {
            return (
              <Grid item xs={6} md={6} lg={10} mt={1}>
                <MDTypography variant="h6" color="white">
                  {sender}: {message}
                </MDTypography>
              </Grid>
            );
          })}
        </Grid>
      </div>

      <Grid container direction="row" justifyContent="space-evenly">
        <Grid item xs={6} md={6} lg={10} mt={1}>
          <MDInput type="text" value={input} onChange={inputChange} />
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
      <Grid container direction="row" justifyContent="space-evenly">
        <Grid item xs={6} md={6} lg={4}>
          <MDButton variant="gradient" color="dark" fullWidth>
            Status
          </MDButton>
        </Grid>
        <Grid item xs={6} md={6} lg={4}>
          <MDButton variant="gradient" color="dark" fullWidth>
            Chat
          </MDButton>
        </Grid>
      </Grid>
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
