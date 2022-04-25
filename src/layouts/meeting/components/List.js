import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { fetchData, fetchSetData } from "utils/fetch";
import { v4 } from "uuid";
import "node_modules/video-react/dist/video-react.css";
import { Player } from "video-react";
const style = {
  margin: "0 50px 10px 50px",
  borderBottom: "1px solid grey",
  paddingBottom: "10px",
  marginTop: "10px",
};

const Meeting = ({ meetingTitle, src }) => {
  console.log(src);
  return (
    <MDBox m="auto" my={2} bgColor="transparent" style={style}>
      <Grid container>
        <Grid item xs={12}>
          <MDTypography variant="h4">會議記錄：{meetingTitle}</MDTypography>
        </Grid>
        <Grid item xs={12}>
          <MDTypography variant="h6">開始時間：{meetingTitle}</MDTypography>
        </Grid>
        <Grid item xs={6}>
          <Player
            playsInline
            fluid={false}
            width={300}
            src="https://storage.googleapis.com/holala-vera/Untitled.mov"
          />
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default Meeting;
