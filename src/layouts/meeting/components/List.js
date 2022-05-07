import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import IconButton from "@mui/material/IconButton";
import { Editor as Editor2 } from "react-draft-wysiwyg";
import Skeleton from "@mui/material/Skeleton";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import { Global } from "@emotion/react";
import {
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
  ContentState,
} from "draft-js";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Icon from "@mui/material/Icon";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import { API_HOST } from "utils/constants";
import { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Card,
  Collapse,
} from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";
import { Link } from "react-router-dom";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { grey } from "@mui/material/colors";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

const drawerBleeding = 56;

const Root = styled("div")(({ theme }) => ({
  height: "100%",
  backgroundColor:
    theme.palette.mode === "light"
      ? grey[100]
      : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "light" ? "#fff" : grey[800],
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.mode === "light" ? grey[300] : grey[900],
  borderRadius: 3,
  position: "absolute",
  top: 8,
  left: "calc(50% - 15px)",
}));

const boxStyle = {
  width: "95%",
  margin: "0 auto 10px",
  paddingBottom: "10px",
  marginTop: "10px",
  borderRaduis: "5px",
};

const scriptDivStyle = {
  overflowY: "auto",
  height: "387px",
  backgroundColor: "#f0f0f0",
  borderRadius: "10px",
};

const scriptTitleStyle = {
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#41BFB3",
};

const scriptStyle = {
  fontSize: "0.8rem",
  lineHeight: "1rem",
  color: "#495361",
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(1),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Meeting = ({ id, meetingTitle, record, members }) => {
  const [expanded, setExpanded] = useState(false);
  const [searched, setSearched] = useState("");
  const [sendLabel, setSendLabel] = useState("Send Email");
  const [sendLabelColor, setSendLabelColor] = useState("secondary");
  const [transcription, setTranscription] = useState();
  const transcriptionRef = useRef(null);
  const videoRef = useRef(null);
  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  // This is used only for the example
  const container = window.document.body;

  const requestSearch = (searchedVal) => {
    const filteredRows = transcriptionRef.current.filter((row) => {
      return row.content.toLowerCase().includes(searchedVal.toLowerCase());
    });
    setTranscription(filteredRows);
  };

  const [editor2State, setEditor2State] = useState(
    EditorState.createWithContent(ContentState.createFromText("hi"))
  );

  const [notes, setNotes] = useState("");
  const [actions, setActions] = useState("");

  const editor = useRef(null);
  const [value, setValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  function focusEditor() {
    editor.current.focus();
  }

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  useEffect(() => {
    const kanbanId = localStorage.getItem("kanbanId");
    fetchData(`${API_HOST}/kanban/${kanbanId}/meeting/${id}`, false).then(
      (data) => {
        setTranscription(data.transcription);
        setNotes(data.notes);
        transcriptionRef.current = data.transcription;
      }
    );
  }, []);

  function addNote(content) {
    if (document.activeElement !== editor.current) {
      focusEditor();
    }
    setNotes((prev) => prev.concat("\n", content));
  }

  function sendEmail() {
    const emailHtml = draftToHtml(
      convertToRaw(editor2State.getCurrentContent())
    );
    const data = {
      subject: `Meeting Minute: ${meetingTitle}`,
      html: emailHtml,
    };
    const kanbanId = localStorage.getItem("kanbanId");
    fetchSetData(
      `${API_HOST}/kanban/${kanbanId}/meeting/${id}/email`,
      data
    ).then(({ status_code }) => {
      if (status_code === 200) {
        console.log(123);
        setSendLabel("Successfully Send");
        setSendLabelColor("success");
      }
    });
  }

  function saveNote() {
    const data = notes;
    console.log(notes);
    console.log(id);
    const kanbanId = localStorage.getItem("kanbanId");
    fetchPutData(`${API_HOST}/kanban/${kanbanId}/meeting/${id}/note`, data);
  }

  function onEditor2StateChange(editor2State) {
    setEditor2State(editor2State);
  }

  return (
    <MDBox m="auto" my={2} bgColor="transparent" style={boxStyle}>
      <CssBaseline />
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            left: "100px",
            height: `600px`,
            bottom: "-20px",
            width: "900px",
            overflow: "visible",
          },
        }}
      />
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Grid
            container
            direction="column"
            alignItems="flex-start"
            wrap="nowrap"
          >
            <Grid item mb={1} xs={12}>
              <MDTypography variant="h5">會議記錄：{meetingTitle}</MDTypography>
            </Grid>
            <Grid item mb={1} xs={12}>
              <MDTypography variant="h6">開始時間：{meetingTitle}</MDTypography>
            </Grid>
            <Grid item xs={12} style={{ width: "100%" }}>
              <Grid container direction="row" wrap="nowrap" alignItems="center">
                <Grid item mr="auto">
                  <AvatarGroup total={members.length}>
                    members
                    {members.map((member) => {
                      return (
                        <Avatar
                          alt={member ? member.name : "unknown"}
                          src={`https://avatars.dicebear.com/api/micah/${
                            member ? member.name : "default"
                          }.svg`}
                        />
                      );
                    })}
                  </AvatarGroup>
                </Grid>
                <Grid item>
                  <button
                    className="editor-btn"
                    style={{ marginRight: "5px" }}
                    onClick={toggleDrawer(true)}
                  >
                    Note & Email
                  </button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="column">
            <hr
              style={{
                marginTop: "-10px",
                marginBottom: "10px",
                height: "1px",
                backgroundColor: "lightgrey",
                border: "none",
              }}
            />
            <Grid item>
              <Grid container direction="row" wrap="nowrap">
                <Grid item xs={8} mr={2} mb={3}>
                  <Typography style={scriptTitleStyle}>Recording</Typography>
                  <video
                    width="100%"
                    controls
                    ref={videoRef}
                    style={{ borderRadius: "10px" }}
                  >
                    <source src={record} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Grid>
                <Grid xs={4} item mb={3}>
                  <Typography style={scriptTitleStyle}>
                    Transcription
                  </Typography>
                  <Search className="search-transcription">
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <StyledInputBase
                      placeholder="Search…"
                      inputProps={{ "aria-label": "search" }}
                      style={{ padding: 0, fontSize: "0.8rem" }}
                      value={searched}
                      onChange={(e) => {
                        setSearched(e.target.value);
                        requestSearch(e.target.value);
                      }}
                    />
                  </Search>
                  <div style={scriptDivStyle} className="transcript">
                    {transcription ? (
                      transcription.map(
                        ({ start_time, timestamp, content }) => (
                          <Grid
                            container
                            direction="row"
                            wrap="nowrap"
                            className="transcription-btn"
                            onClick={() => {
                              console.log(videoRef.current.currentTime);
                              videoRef.current.currentTime = timestamp;
                            }}
                          >
                            <Grid item>
                              <button className="btnTimeStyle">
                                <Typography
                                  style={scriptStyle}
                                  className="transcriptionRow"
                                >
                                  {start_time}:
                                </Typography>
                              </button>
                            </Grid>
                            <Grid item>
                              <button className="btnContentStyle">
                                <Typography
                                  style={scriptStyle}
                                  className="transcriptionRow"
                                >
                                  {content}
                                  <IconButton
                                    size="small"
                                    onClick={() => addNote(content)}
                                  >
                                    <AddCircleOutlineIcon />
                                  </IconButton>
                                </Typography>
                              </button>
                            </Grid>
                          </Grid>
                        )
                      )
                    ) : (
                      <></>
                    )}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <SwipeableDrawer
        container={container}
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={drawerBleeding}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <StyledBox
          sx={{
            px: 2,
            pb: 2,
            height: "100%",
            overflow: "auto",
            borderTopLeftRadius: 100,
            borderTopRightRadius: 8,
          }}
        >
          <Grid item xs={12}>
            <Box sx={{ width: "100%", paddingTop: "20px" }}>
              <Typography variant="h5" style={{ textAlign: "center" }} mb={2}>
                {meetingTitle}
              </Typography>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={value}
                  onChange={handleTabChange}
                  textColor="secondary"
                  indicatorColor="secondary"
                  aria-label="secondary tabs example"
                >
                  <Tab label="Note Editor" {...a11yProps(0)} />
                  <Tab label="Send Email" {...a11yProps(1)} />
                </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                <Grid container direction="row" wrap="nowrap">
                  <Grid item xs={12} mx={2}>
                    <Typography variant="h5">MEETING KEY POINT</Typography>
                    <textarea
                      className="text-area"
                      ref={editor}
                      style={{
                        fontSize: "0.8rem",
                        lineHeight: "1rem",
                        color: "#495361",
                        height: "360px",
                      }}
                      onChange={(e) => setNotes(e.target.value)}
                      value={notes}
                    ></textarea>
                  </Grid>
                </Grid>
                <MDButton
                  variant="gradient"
                  color="secondary"
                  fullWidth
                  onClick={saveNote}
                >
                  Save
                </MDButton>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <Editor2
                  editorState={editor2State}
                  toolbarClassName="editorToolbar"
                  wrapperClassName="editorWrapper"
                  editorClassName="noteEditor"
                  onEditorStateChange={onEditor2StateChange}
                />
                <MDButton
                  variant="gradient"
                  color={sendLabelColor}
                  fullWidth
                  onClick={sendEmail}
                >
                  {sendLabel}
                </MDButton>
              </TabPanel>
            </Box>
          </Grid>
        </StyledBox>
      </SwipeableDrawer>
    </MDBox>
  );
};

export default Meeting;
