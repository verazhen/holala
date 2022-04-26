import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
const boxStyle = {
  margin: "0 50px 10px 50px",
  borderBottom: "1px solid grey",
  paddingBottom: "10px",
  marginTop: "10px",
};

const Meeting = ({ meetingTitle, src, transcript }) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState([]);
  const [bullets, setBullets] = useState([]);
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  const url = `https://s3.ap-southeast-1.amazonaws.com/verazon.online/${src}`;
  const jsonFile = `https://s3.ap-southeast-1.amazonaws.com/verazon.online/${transcript}.json`;

  useEffect(() => {
    if (!transcript) {
      return;
    }
    fetch(jsonFile)
      .then((response) => response.json())
      .then(({ results }) => {
        let textArr = [];
        let text = " ";
        let counter = 0;
        let start_time;
        results.items.map((item) => {
          if (item.start_time) {
            if (counter === 0) {
              start_time = item.start_time;
            }
            text = text.concat(item.alternatives[0].content, " ");
            console.log(text);
            counter++;
          } else {
            const content = text.trim();
            content.concat(".");
            textArr.push({ start_time, content });
            counter = 0;
            text = " ";
          }
        });
        setNotes(textArr);
      });
  }, []);

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
          <video width="800" controls>
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {notes.map(({ start_time, content }) => (
            <Typography>
              {start_time}: {content}
            </Typography>
          ))}
        </AccordionDetails>
      </Accordion>
    </MDBox>
  );
};

export default Meeting;
