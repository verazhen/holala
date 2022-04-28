import { useEffect, useState, useRef } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Form from "react-bootstrap/Form";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MixedChart from "examples/Charts/MixedChart";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

const inputStyle = {
  height: "50px",
  width: "100%",
  border: 0,
  borderRadius: "5px",
  boxShadow:
    "-0.01px -0.01px 0.5px 0.01px lightgrey,0.5px 0.5px 3px 0.5px lightgrey",
  padding: "2px 20px",
  color: "grey",
};

function Dashboard() {
  const [age, setAge] = useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="assignment"
                title="Total Tasks"
                count={281}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "than lask week",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="check_circle"
                title="Finished Tasks"
                count="2,300"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "than last month",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="check_circle_outline"
                title="Unfinished Tasks"
                count="34k"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="groups"
                title="Meetings"
                count="+91"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Just updated",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <Grid container spacing={3} wrap="nowrap">
                  <Grid item alignSelf="center">
                    <MDTypography
                      variant="h6"
                      style={{ verticalAlign: "middle" }}
                    >
                      Interval:{" "}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={11}>
                    <Form.Select style={inputStyle} className="no-outline">
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </Form.Select>
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox mb={3}>
                <MixedChart
                  icon={{ color: "info", component: "leaderboard" }}
                  title="Tasks Status"
                  description="Tasks finished/unfinished by time"
                  chart={{
                    labels: [
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ],
                    datasets: [
                      {
                        chartType: "bar",
                        label: "Finished Tasks",
                        color: "dark",
                        data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
                      },
                      {
                        chartType: "thin-bar",
                        label: "unFinished Tasks",
                        color: "primary",
                        data: [60, 30, 300, 220, 500, 250, 400, 230, 500],
                      },
                      {
                        chartType: "gradient-line",
                        label: "Total Tasks",
                        color: "secondary",
                        data: [30, 90, 40, 140, 290, 290, 340, 230, 400],
                      },
                    ],
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={3}>
                <Grid container spacing={3} wrap="nowrap">
                  <Grid item alignSelf="center">
                    <MDTypography
                      variant="h6"
                      style={{ verticalAlign: "middle" }}
                    >
                      Range:{" "}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={11}>
                    <Form.Select style={inputStyle} className="no-outline">
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>This Quarter</option>
                    </Form.Select>
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox mb={3}>
                <MixedChart
                  icon={{ color: "info", component: "leaderboard" }}
                  title="Tasks Status"
                  description="Tasks finished/unfinished by members"
                  chart={{
                    labels: [
                      "Member1",
                      "Member2",
                      "Member3",
                      "Member4",
                      "Member5",
                    ],
                    datasets: [
                      {
                        chartType: "bar",
                        label: "Finished Tasks",
                        color: "primary",
                        data: [60, 30, 300, 220, 500],
                      },
                      {
                        chartType: "thin-bar",
                        label: "unFinished Tasks",
                        color: "primary",
                        data: [60, 30, 300, 220, 500],
                      },
                    ],
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default Dashboard;
