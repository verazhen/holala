/**
=========================================================
* Material Dashboard 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
// import Footer from "examples/Footer";
import DataTable from "examples/Tables/KanbanList";

import List from "./components/List";

// Data
// import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/report/data/projectsTableData";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchData, fetchSetData } from "utils/fetch";

function Tables() {
  const [lists, setLists] = useState([]);
  const submittingStatus = useRef(false);
  const { kanbanId } = useParams();

  function addList() {
    submittingStatus.current = true;
    const newList = {
      title: "List untitled",
      tasks: [],
    };
    setLists(function (prevData) {
      return [...prevData, newList];
    });
  }

  useEffect(() => {
    fetchData(`http://localhost:5000/api/1.0/task/${kanbanId}`).then(
      (listsData) => {
        //sort the lists data
        listsData.sort((a, b) => {
          return a.orders - b.orders;
        });
        //sort the tasks data
        listsData.forEach(({ tasks }) => {
          tasks.sort((a, b) => {
            return a.orders - b.orders;
          });
        });
        setLists(listsData);
      }
    );
  }, []);

  //   post data
  useEffect(() => {
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(`http://localhost:5000/api/1.0/task/${kanbanId}`, lists).then(
      (lists) => {
        submittingStatus.current = false;
      }
    );
  }, [lists]);

  const style = {
    overflowY: "hidden",
    overflow: "scroll",
    height: "90vh",
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} wrap="nowrap" style={style}>
          {lists.map(({ id, title, tasks }) => (
            <Grid item xs={6}>
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
                  <MDTypography variant="h5" color="white">
                    {title}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <List
                    kanbanId={kanbanId}
                    listId={id}
                    listName={title}
                    tasks={tasks}
                  />
                </MDBox>
              </Card>
            </Grid>
          ))}
          <Grid item xs={3}>
            <MDButton
              //               component={Link}
              //               to={action.route}
              variant="gradient"
              color="secondary"
              fullWidth
              onClick={addList}
              //               color={action.color}
            >
              Add List
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
