import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Icon from "@mui/material/Icon";
import draftToHtml from "draftjs-to-html";
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
import MDTypography from "components/MDTypography";
import { Link } from "react-router-dom";
import { fetchData, fetchSetData } from "utils/fetch";

const Meeting = ({ meetingTitle, src, transcript }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [bullets, setBullets] = useState([]);

  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(ContentState.createFromText("hi"))
  );

  const editor = useRef(null);
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
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
    marginLeft: "20px",
    color: "#41BFB3",
  };

  const scriptStyle = {
    fontSize: "0.8rem",
    color: "#495361",
  };

  const url = `https://s3.ap-southeast-1.amazonaws.com/verazon.online/${src}`;

  useEffect(() => {
    if (!transcript) {
      return;
    }
    fetchData("http://localhost:5000/api/1.0/kanban/1/meeting/1650882217").then(
      (data) => {
        setNotes(data);
      }
    );
  }, []);

  function sendEmail() {
    const emailHtml = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    const data = {
      from: "vera.zhen63@gmail.com",
      to: "vera.zhen63@gmail.com",
      subject: "test",
      html: emailHtml,
    };
    fetchSetData(
      "http://localhost:5000/api/1.0/kanban/1/meeting/1650882217/email",
      data
    );
  }

  function onEditorStateChange(editorState) {
    setEditorState(editorState);
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
            <Grid item>
              <video height="530px" controls>
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Grid>
            <Grid item xs={4}>
              <Typography style={scriptTitleStyle}>Transcription</Typography>
              <div style={scriptDivStyle} className="transcript">
                {notes.map(({ start_time, content }) => (
                  <Grid container direction="column">
                    <Grid item>
                      <Typography style={scriptStyle}>
                        {start_time}: {content}
                      </Typography>
                    </Grid>
                  </Grid>
                ))}
              </div>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Editor
              editorState={editorState}
              toolbarClassName="editorToolbar"
              wrapperClassName="editorWrapper"
              editorClassName="noteEditor"
              onEditorStateChange={onEditorStateChange}
            />
          </Grid>
          <Grid item xs={12}>
            <MDButton
              variant="gradient"
              color="secondary"
              fullWidth
              onClick={sendEmail}
            >
              Send Email
            </MDButton>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </MDBox>
  );
};

export default Meeting;
