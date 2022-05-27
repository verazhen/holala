// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import Container from "@mui/material/Container";
import MDTypography from "components/MDTypography";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import { navbarIconButton } from "elements/Navbars/DashboardNavbar/styles";
import bgImage from "assets/images/group.png";

import PageLayout from "elements/LayoutContainers/PageLayout";
// Authentication pages components
import Footer from "layouts/authentication/components/Footer";

function IndexLayout({ image, children, user }) {
  return (
    <PageLayout>
      <MDBox
        position="absolute"
        width="100%"
        m={0}
        minHeight="100vh"
        sx={{
          backgroundImage: ({
            functions: { linearGradient, rgba },
            palette: { gradients },
          }) =>
            image &&
            `${linearGradient(
              rgba(gradients.dark.main, 0.6),
              rgba(gradients.dark.state, 0.6)
            )}, url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <img src={bgImage} style={{ width: "100vw", top: "-2800px" }} />
      <MDBox px={1} width="85%" height="75vh" m="auto">
        <Grid
          container
          spacing={1}
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Grid item xs={8.5}>
            <Container>
              <MDBox
                py={1}
                px={{ xs: 4 }}
                borderRadius="lg"
                shadow={"md"}
                color={"dark"}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                style={{ backgroundColor: "white" }}
              >
                <Grid
                  container
                  direction="row"
                  spacing={1}
                  wrap="nowrap"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <MDTypography variant="h2" fontWeight="bold" color={"dark"}>
                      Hi! {user ? user.name : ""}
                    </MDTypography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      size="medium"
                      disableRipple
                      color="inherit"
                      sx={navbarIconButton}
                      onClick={() => {
                        window.localStorage.removeItem("access_token");
                        window.location.href = "/authentication/sign-in";
                      }}
                    >
                      <Icon>logout</Icon>
                      <div
                        style={{
                          fontSize: "17px",
                          color: "gray",
                          marginLeft: "2px",
                        }}
                      >
                        Log Out
                      </div>
                    </IconButton>
                  </Grid>
                </Grid>
              </MDBox>

              {children}
            </Container>
          </Grid>
        </Grid>
      </MDBox>
    </PageLayout>
  );
}

// Typechecking props for the BasicLayout
IndexLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default IndexLayout;
