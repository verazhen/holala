import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { Link } from "react-router-dom";
import { fetchData, fetchSetData } from "utils/fetch";
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
      <Grid container direction="row">
        <Grid item xs={6}>
          <Grid container>
            <Grid item xs={12}>
              <MDTypography variant="h4">會議記錄：{meetingTitle}</MDTypography>
            </Grid>
            <Grid item xs={12}>
              <MDTypography variant="h6">開始時間：{meetingTitle}</MDTypography>
            </Grid>
            <Grid item xs={6}>
              <video width="500" controls>
                <source src={url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container>
            <Grid mb={10} item xs={12}>
              <MDButton
                //               component={Link}
                //               to={action.route}
                variant="gradient"
                color="secondary"
                //               color={action.color}
              >
                Edit Meeting Notes
              </MDButton>
            </Grid>
            <Grid item xs={12}>
              <Link
                to="#"
                onClick={(e) => {
                  window.open(`mailto:no-reply@example.com;mailto:no-reply2@example.com?subject=Mail To Syntax with
                  Samples&body=Hi, in this article you will find samples about how to use MailTo in HTML`);
                  e.preventDefault();
                }}
              >
                send Email
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MDBox>
  );
};

export default Meeting;
