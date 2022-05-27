// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "elements/LayoutContainers/DashboardLayout";
import Footer from "elements/Footer";

import Meeting from "./components/List";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchData, fetchSetData } from "utils/fetch";
import { API_HOST } from "utils/constants";

function Tables() {
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const { kanbanId } = useParams();

  useEffect(() => {
    fetchData(`${API_HOST}/kanban/${kanbanId}/meetings`, true).then(
      ({ data, user }) => {
        console.log(data, user);
        setMembers(user);
        setMeetings(data);
      }
    );
  }, []);

  return (
    <DashboardLayout>
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Meeting Minutes
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {meetings.map((meeting) => (
                  <Meeting
                    id={meeting.id}
                    meetingTitle={meeting.start_dt}
                    record={meeting.record}
                    members={members}
                  />
                ))}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
