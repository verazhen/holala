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
import { DragDropContext, Droppable } from "react-beautiful-dnd";

// Data
// import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/report/data/projectsTableData";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchData, fetchSetData } from "utils/fetch";
import { addLocalStorage, getLocalStorage } from "utils/utils";

function Tables() {
  const [lists, setLists] = useState([]);
  const submittingStatus = useRef(false);
  const submitTask = useRef(false);
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

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      //if not the same list
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.tasks];
      const destItems = [...destColumn.tasks];
      const [removed] = sourceItems.splice(source.index, 1);

      destItems.splice(destination.index, 0, removed);

      if (destination.index != 0) {
        destItems[destination.index].orders =
          destItems[destination.index - 1].orders + 1;
        destItems[destination.index].list_id =
          destItems[destination.index - 1].list_id;
      } else {
        destItems[destination.index].orders =
          destItems[destination.index + 1].orders - 1;
        destItems[destination.index].list_id =
          destItems[destination.index + 1].list_id;
      }

      const newList = JSON.parse(JSON.stringify(lists));
      newList[source.droppableId].tasks = sourceItems;
      newList[destination.droppableId].tasks = destItems;
      submitTask.current = true;
      setLists(newList);
    } else {
      const list = lists[source.droppableId];
      const copiedItems = [...list.tasks];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      if (destination.index != 0) {
        copiedItems[destination.index].orders =
          copiedItems[destination.index - 1].orders + 1;
      } else {
        copiedItems[destination.index].orders =
          copiedItems[destination.index + 1].orders - 1;
      }
      const newList = JSON.parse(JSON.stringify(lists));
      newList[source.droppableId].tasks = copiedItems;
      submitTask.current = true;
      setLists(newList);
    }
  };

  useEffect(() => {
    addLocalStorage("kanbanId", kanbanId);
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
    console.log("useEffect lists");
    console.log(lists);
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
          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, lists, setLists)}
          >
            {lists.map(({ id, title, tasks }, index) => (
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
                      listIndex={index}
                      lists={lists}
                      setLists={setLists}
                      submitTask={submitTask}
                    />
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </DragDropContext>
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
