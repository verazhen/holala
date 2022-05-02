/// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";

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
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { addLocalStorage, getLocalStorage } from "utils/utils";

function Tables() {
  const [lists, setLists] = useState([]);
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState({});
  const [members, setMembers] = useState([]);
  const submittingStatus = useRef(false);
  const submitTask = useRef(false);
  const { kanbanId } = useParams();
  const [menu, setMenu] = useState(null);
  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);
  const listsRef = useRef([]);

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

  function delList() {
    const delItem = Number(menu.classList[4].split("-")[1]);
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[delItem].delete_dt = 1;
    setLists(newLists);
    //put list api
  }

  function editList(e, index) {
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[index].title = e.target.value;
    setLists(newLists);
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
    fetchData(`http://localhost:5000/api/1.0/task/${kanbanId}`, true).then(
      ({ user, data, tags, account }) => {
        //sort the lists data
        data.sort((a, b) => {
          return a.orders - b.orders;
        });
        //sort the tasks data
        data.forEach(({ tasks }) => {
          tasks.sort((a, b) => {
            return a.orders - b.orders;
          });
        });
        setLists(data);
        setMembers(user);
        setUser(account);

        const newTags = tags.map((tag, i, arr) => {
          arr[i].key = i;
          arr[i].checked = false;
          return arr[i];
        });
        setTags(newTags);
      }
    );
  }, []);

  //   post data
  useEffect(() => {
    listsRef.current = listsRef.current.slice(0, lists.length);
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
        <Grid
          container
          spacing={6}
          wrap="nowrap"
          style={style}
          className="kanban"
        >
          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, lists, setLists)}
          >
            {lists.map(({ id, title, tasks, delete_dt }, index) => {
              if (!delete_dt) {
                return (
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
                        ref={(el) => (listsRef.current[index] = el)}
                      >
                        <Grid
                          container
                          direction="row"
                          wrap="nowrap"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => editList(e, index)}
                            />
                          </Grid>
                          <Grid item>
                            <MDBox color="text" px={2}>
                              <Icon
                                sx={{ cursor: "pointer", fontWeight: "bold" }}
                                fontSize="small"
                                onClick={openMenu}
                                className={`list-${index}`}
                              >
                                more_vert
                              </Icon>
                            </MDBox>
                            <Menu
                              id="simple-menu"
                              style={{ marginTop: "10px" }}
                              anchorEl={menu}
                              anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "right",
                              }}
                              transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                              }}
                              open={Boolean(menu)}
                              onClose={closeMenu}
                            >
                              <MenuItem onClick={delList}>
                                delete the list
                              </MenuItem>
                            </Menu>
                          </Grid>
                        </Grid>
                      </MDBox>
                      <MDBox pt={3}>
                        <List
                          kanbanId={kanbanId}
                          listId={id}
                          listName={title}
                          tasks={tasks}
                          listIndex={index}
                          lists={lists}
                          tags={tags}
                          setTags={setTags}
                          setLists={setLists}
                          submitTask={submitTask}
                          members={members}
                          user={user}
                        />
                      </MDBox>
                    </Card>
                  </Grid>
                );
              }
            })}
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
