import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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

const btnStyle = {
  border: "0px",
  backgroundColor: "transparent",
  textAlign: "left",
  marginRight: "5px",
};

const boxStyle = {
  width: "95%",
  margin: "0 auto 10px",
  paddingBottom: "10px",
  marginTop: "10px",
  borderRaduis: "5px",
};

const scriptDivStyle = {
  overflowY: "auto",
  height: "510px",
  marginLeft: "20px",
};

const scriptTitleStyle = {
  fontSize: "1.2rem",
  //   marginLeft: "20px",
  color: "#41BFB3",
};

const scriptStyle = {
  fontSize: "0.8rem",
  color: "#495361",
};

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

const Meeting = ({ id, meetingTitle, src, transcript }) => {
  const [expanded, setExpanded] = useState(false);
  const [transcription, setTranscription] = useState([]);

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

  const url = `https://s3.ap-southeast-1.amazonaws.com/verazon.online/${src}`;

  useEffect(() => {
    //     focusEditor();
    if (!transcript) {
      return;
    }
    fetchData(`${API_HOST}/kanban/1/meeting/1650882217`).then((data) => {
      setTranscription(data);
    });
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
    fetchSetData(`${API_HOST}/kanban/1/meeting/1650882217/email`, data);
  }

  function saveNote() {
    const data = {
      notes,
      actions,
    };
    fetchPutData(`${API_HOST}/kanban/1/meeting/${id}`, data);
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
            <Grid item xs={6}>
              <Grid container>
                <Grid item xs={12}>
                  <MDTypography variant="h4">
                    會議記錄：{meetingTitle}
                  </MDTypography>
                </Grid>
                <AvatarGroup total={24}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                  <Avatar
                    alt="Travis Howard"
                    src="/static/images/avatar/2.jpg"
                  />
                  <Avatar
                    alt="Agnes Walker"
                    src="/static/images/avatar/4.jpg"
                  />
                  <Avatar
                    alt="Trevor Henderson"
                    src="/static/images/avatar/5.jpg"
                  />
                </AvatarGroup>
                <Grid item xs={12}>
                  <MDTypography variant="h6">
                    開始時間：{meetingTitle}
                  </MDTypography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container direction="row">
            <Grid item xs={8}>
              <video height="530px" controls>
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Grid>
            <Grid item xs={4}>
              <Typography style={scriptTitleStyle}>Transcription</Typography>
              <div style={scriptDivStyle} className="transcript">
                {transcription.map(({ start_time, content }) => (
                  <Grid container direction="row" wrap="nowrap">
                    <Grid item>
                      <button style={btnStyle}>
                        <Typography style={scriptStyle}>
                          {start_time}:
                        </Typography>
                      </button>
                    </Grid>
                    <Grid item>
                      <button style={btnStyle} onClick={addNote}>
                        <Typography style={scriptStyle}>{content}</Typography>
                      </button>
                    </Grid>
                  </Grid>
                ))}
              </div>
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
