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

// Data
// import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/report/data/projectsTableData";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchData, fetchSetData } from "utils/fetch";

function Tables() {
  const [lists, setLists] = useState([]);
  const submittingStatus = useRef(false);
  const { id } = useParams();

  function addItem() {
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
    fetchData(`http://localhost:5000/api/1.0/task/${id}`).then((lists) => {
      //sort the lists data
      lists.sort((a, b) => {
        return a.orders - b.orders;
      });
      //sort the tasks data
      //       lists.forEach(({ tasks }) => {
      //         tasks.sort((a, b) => {
      //           return a.orders - b.orders;
      //         });
      //       });
      setLists(lists);
    });
  }, []);

  //   post data
  useEffect(() => {
    //預防data在網頁 第一次render時被清掉
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(lists, "http://localhost:5000/api/1.0/task").then((lists) => {
      submittingStatus.current = false;
    });
  }, [lists]);

  const { columns: pColumns, rows: pRows } = projectsTableData();
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
            <Grid item xs={3}>
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
                    {title}
                  </MDTypography>
                </MDBox>
                <MDBox pt={3}>
                  <DataTable
                    table={{ columns: pColumns, rows: pRows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
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
              onClick={addItem}
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
