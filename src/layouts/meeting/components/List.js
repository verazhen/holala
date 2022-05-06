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
import { Editor as Editor2 } from "react-draft-wysiwyg";
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
  const [transcription, setTranscription] = useState();
  const transcriptionRef = useRef(null);
  const videoRef = useRef(null);

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
        setTranscription(data);
        transcriptionRef.current = data;
      }
    );
  }, []);

  function addNote(e) {
    if (document.activeElement !== editor.current) {
      focusEditor();
    }
    setNotes((prev) => prev.concat("\n", e.target.innerText));
  }

  function sendEmail() {
    const emailHtml = draftToHtml(
      convertToRaw(editor2State.getCurrentContent())
    );
    const data = {
      from: "vera.zhen63@gmail.com",
      to: "vera.zhen63@gmail.com",
      subject: "test",
      html: emailHtml,
    };
    const kanbanId = localStorage.getItem("kanbanId");
    fetchSetData(
      `${API_HOST}/kanban/${kanbanId}/meeting/1650882217/email`,
      data
    );
  }

  function saveNote() {
    const data = {
      notes,
      actions,
    };
    const kanbanId = localStorage.getItem("kanbanId");
    fetchPutData(`${API_HOST}/kanban/${kanbanId}/meeting/${id}`, data);
  }

  function onEditor2StateChange(editor2State) {
    setEditor2State(editor2State);
  }

  return (
    <MDBox m="auto" my={2} bgColor="transparent" style={boxStyle}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Grid container direction="row">
            <Grid item>
              <Grid container direction="column" alignItems="flex-start">
                <Grid item mb={1}>
                  <MDTypography variant="h5">
                    會議記錄：{meetingTitle}
                  </MDTypography>
                </Grid>
                <Grid item mb={1}>
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
                  <MDTypography variant="h6">
                    開始時間：{meetingTitle}
                  </MDTypography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="column">
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
            <Grid item xs={12}>
              <Box sx={{ width: "100%" }}>
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
                    <Grid item xs={6} mx={2}>
                      <Typography variant="h5">Highlight</Typography>
                      <textarea
                        className="text-area"
                        ref={editor}
                        onChange={(e) => setNotes(e.target.value)}
                        value={notes}
                      ></textarea>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h5">Action Plan</Typography>
                      <textarea
                        className="text-area"
                        label="list your action plan"
                        value={actions}
                        onChange={(e) => setActions(e.target.value)}
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
                    color="secondary"
                    fullWidth
                    onClick={sendEmail}
                  >
                    Send Email
                  </MDButton>
                </TabPanel>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </MDBox>
  );
};

export default Meeting;
