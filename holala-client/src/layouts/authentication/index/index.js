import { useState, useEffect } from "react";
// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import IndexLayout from "layouts/authentication/components/IndexLayout";
import Footer from "elements/Footer";

// Dashboard components
import Projects from "layouts/authentication/index/components/kanbans";


function Index() {
  const [user, setUser] = useState({ name: "" });

  return (
    <IndexLayout user={user} >
      <MDBox py={3}>
        <MDBox>
          <Grid container spacing={1} direction="row" wrap="nowrap">
            <Grid item xs={8} mr="auto">
              <Projects
                setUser={setUser}
              />
            </Grid>
            <Grid item >
              <Card style={{ borderRadius: "3px" }}>
                <img
                  className="kanban"
                  style={{ borderRadius: "3px" }}
                  src="https://cdn.dribbble.com/users/472667/screenshots/15522562/media/92eb48276be12667fcbec8c5d6105a87.gif"
                />
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </IndexLayout>
  );
}

export default Index;
