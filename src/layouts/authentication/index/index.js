import { useState, useEffect } from "react";
// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import IndexLayout from "layouts/authentication/components/IndexLayout";
import Footer from "examples/Footer";

// Dashboard components
import Projects from "layouts/authentication/index/components/kanbans";
// import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Index() {
  const [user, setUser] = useState({name:""});

  return (
    <IndexLayout user={user}>
      <MDBox py={3}>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <Projects setUser={setUser} />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </IndexLayout>
  );
}

export default Index;
