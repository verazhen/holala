import { useEffect, useState, useRef } from "react";
import { fetchData, fetchSetData } from "utils/fetch";
import { useParams } from "react-router-dom";
// @mui material components
import Grid from "@mui/material/Grid";
import Form from "react-bootstrap/Form";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MixedChart from "examples/Charts/MixedChart";
import { API_HOST } from "utils/constants";

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
  const defaultTask = {
    taskAmount: 0,
    taskAmountCompared: 0,
  };
  const [totalTasks, setTotalTasks] = useState(defaultTask);
  const [finishedTasks, setFinishedTasks] = useState(defaultTask);
  const [unfinishedTasks, setUnfinishedTasks] = useState(defaultTask);
  const [range, setRange] = useState(7);
  const [interval, setInterval] = useState(1);
  const { kanbanId } = useParams();
  const [intervalTags, setIntervalTags] = useState([
    "d1",
    "d2",
    "d3",
    "d4",
    "d5",
  ]);
  const [finishedTaskSet, setFinishedTaskSet] = useState([1, 2, 3, 5, 5]);
  const [remainingTaskSet, setRemainingTaskSet] = useState([5, 5, 5, 3, 2, 1]);
  const [idealTaskSet, setIdealTaskSet] = useState([5, 5, 4, 3, 2, 1]);

  useEffect(() => {
    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskAmount/all?range=${range}`,
      true
    ).then(({ data }) => {
      const newTask = JSON.parse(JSON.stringify(totalTasks));
      newTask.taskAmount = data.taskAmount;
      newTask.taskAmountCompared = data.taskAmountCompared;
      setTotalTasks(newTask);
    });

    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskAmount/finishedByRange?range=${range}`,
      true
    ).then(({ data }) => {
      const newTask = JSON.parse(JSON.stringify(finishedTasks));
      newTask.taskAmount = data.taskAmount;
      newTask.taskAmountCompared = data.taskAmountCompared;
      setFinishedTasks(newTask);
    });

    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskAmount/unfinishedByRange?range=${range}`,
      true
    ).then(({ data }) => {
      const newTask = JSON.parse(JSON.stringify(unfinishedTasks));
      newTask.taskAmount = data.taskAmount;
      newTask.taskAmountCompared = data.taskAmountCompared;
      setUnfinishedTasks(newTask);
    });

    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskChart?range=${range}&interval=${interval}`,
      true
    ).then(({ data }) => {
      setIntervalTags(data.intervalTags);
      setFinishedTaskSet(data.finishedTaskSet);
      setRemainingTaskSet(data.remainingTaskSet);
      setIdealTaskSet(data.idealTaskSet);
    });
  }, []);

  useEffect(() => {
    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskAmount/all?range=${range}`,
      true
    ).then(({ data }) => {
      const newTask = JSON.parse(JSON.stringify(totalTasks));
      newTask.taskAmount = data.taskAmount;
      newTask.taskAmountCompared = data.taskAmountCompared;
      setTotalTasks(newTask);
    });

    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskAmount/finishedByRange?range=${range}`,
      true
    ).then(({ data }) => {
      const newTask = JSON.parse(JSON.stringify(finishedTasks));
      newTask.taskAmount = data.taskAmount;
      newTask.taskAmountCompared = data.taskAmountCompared;
      setFinishedTasks(newTask);
    });

    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskAmount/unfinishedByRange?range=${range}`,
      true
    ).then(({ data }) => {
      const newTask = JSON.parse(JSON.stringify(unfinishedTasks));
      newTask.taskAmount = data.taskAmount;
      newTask.taskAmountCompared = data.taskAmountCompared;
      setUnfinishedTasks(newTask);
    });

    fetchData(
      `${API_HOST}/kanban/${kanbanId}/report/taskChart?range=${range}&interval=${interval}`,
      true
    ).then(({ data }) => {
      setIntervalTags(data.intervalTags);
      setFinishedTaskSet(data.finishedTaskSet);
      setRemainingTaskSet(data.remainingTaskSet);
      setIdealTaskSet(data.idealTaskSet);
    });
  }, [range, interval]);

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  function compare(a, b) {
    if (b === 0) return `+999%`;
    const number = Math.floor((a / b - 1) * 10000) / 100;

    const percentage = a >= b ? `+${number}%` : `${number}%`;
    return percentage;
  }

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3} wrap="nowrap" direction="row">
            <Grid item xs={6}>
              <Grid container wrap="nowrap" direction="row">
                <Grid item alignSelf="center" mr="auto">
                  <MDTypography
                    variant="h6"
                    style={{ verticalAlign: "middle" }}
                  >
                    Range:{" "}
                  </MDTypography>
                </Grid>
                <Grid item xs={10.5} >
                  <Form.Select
                    style={inputStyle}
                    className="no-outline"
                    onChange={(e) => setRange(e.target.value)}

                  >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={365}>Last Year</option>
                  </Form.Select>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container wrap="nowrap" direction="row">
                <Grid item alignSelf="center" mr="auto">
                  <MDTypography
                    variant="h6"
                    style={{ verticalAlign: "middle" }}
                  >
                    Interval:{" "}
                  </MDTypography>
                </Grid>
                <Grid item  xs={10.5}>
                  <Form.Select
                    style={inputStyle}
                    className="no-outline"
                    onChange={(e) => setInterval(e.target.value)}
                  >
                    <option value={1}>Daily</option>
                    <option value={7}>Weekly</option>
                    <option value={30}>Monthly</option>
                  </Form.Select>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MDBox>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="assignment"
                title="Total Tasks Accumulated"
                count={totalTasks.taskAmount}
                percentage={{
                  color: "success",
                  amount: compare(
                    totalTasks.taskAmount,
                    totalTasks.taskAmountCompared
                  ),
                  label: `than last ${range} Days`,
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="check_circle"
                title="Finished Tasks by Range"
                count={finishedTasks.taskAmount}
                percentage={{
                  color: "success",
                  amount: compare(
                    finishedTasks.taskAmount,
                    finishedTasks.taskAmountCompared
                  ),
                  label: `than last ${range} Days`,
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="check_circle_outline"
                title="Unfinished Tasks by Range"
                count={unfinishedTasks.taskAmount}
                percentage={{
                  color: "success",
                  amount: compare(
                    unfinishedTasks.taskAmount,
                    unfinishedTasks.taskAmountCompared
                  ),
                  label: `than last ${range} Days`,
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
                <MixedChart
                  icon={{ color: "info", component: "leaderboard" }}
                  title="Burn Down Chart"
                  description="Tasks finished by time"
                  chart={{
                    labels: intervalTags,
                    datasets: [
                      {
                        chartType: "bar",
                        label: "Finished Tasks",
                        color: "black",
                        data: finishedTaskSet,
                      },
                      {
                        chartType: "gradient-line",
                        label: "Remaining Tasks",
                        color: "secondary",
                        data: remainingTaskSet,
                      },
                      {
                        chartType: "default-line",
                        label: "Ideal Burn-down",
                        color: "primary",
                        data: idealTaskSet,
                      },
                    ],
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
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
