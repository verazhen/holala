import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { fetchData, fetchSetData } from "utils/fetch";
import { v4 } from "uuid";
import ReactPlayer from "react-player";
const style = {
  margin: "0 50px 10px 50px",
  borderBottom: "1px solid grey",
  paddingBottom: "10px",
  marginTop: "10px",
};

const Meeting = ({ meetingTitle, src }) => {
  const url = `https://s3.ap-southeast-1.amazonaws.com/verazon.online/${src}`;
  console.log(url);
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
          <video width="500"  controls>
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default Meeting;
