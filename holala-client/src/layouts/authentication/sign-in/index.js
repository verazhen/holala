import { useState } from "react";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import { fetchSetData } from "utils/fetch";
import { API_HOST } from "utils/constants";
// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";


function Basic() {
  const [rememberMe, setRememberMe] = useState(false);
  const [password, setPassword] = useState("123456");
  const [email, setEmail] = useState("vera@gmail.com");
  const [signInMsg, setSignInMsg] = useState({});

  function signIn() {
    const data = { password, email };
    fetchSetData(`${API_HOST}/user/signin`, data).then(
      ({ status_code, data, error }) => {
        if (status_code !== 200) {
          setSignInMsg({ status: "error", message: error });
        } else {
          localStorage.setItem("access_token", data.access_token);
          setSignInMsg({ status: "success", message: "Sign Up Success!" });
          window.location.href = "/index";
        }
      }
    );
  }

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  return (
    <BasicLayout notification={signInMsg}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton
                variant="gradient"
                color="info"
                fullWidth
                onClick={signIn}
              >
                sign in
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
