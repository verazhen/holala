/// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "elements/LayoutContainers/DashboardLayout";

import List from "./components/List";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { addLocalStorage, getLocalStorage } from "utils/utils";
import { API_HOST } from "utils/constants";
import SocketContext from "elements/LayoutContainers/DashboardLayout/socket_context";

function Tables(props) {
  const [lists, setLists] = useState([]);
  const [videoOpen, setVideoOpen] = useState(false);
  const [taskUpdateQue, setTaskUpdateQue] = useState(null);
  const [tags, setTags] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [user, setUser] = useState({});
  const [members, setMembers] = useState([]);
  const submittingStatus = useRef(false);
  const submitTask = useRef(false);
  const { kanbanId } = useParams();
  const [menu, setMenu] = useState(null);
  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);
  const listsRef = useRef([]);
  const blockTasks = useRef({});
  const editingRef = useRef(false);
  const ws = useContext(SocketContext);

  function addList() {
    const newList = {
      title: "",
      tasks: [],
    };

    fetchSetData(`${API_HOST}/kanban/${kanbanId}/tasks`, newList).then(
      ({ data }) => {
        setLists(function (prevData) {
          newList.id = data.listId;
          const newLists = [...prevData, newList];
          const tasks = {
            kanbanId,
            tasks: newLists,
          };
          ws.emit("task update", tasks);
          return newLists;
        });
      }
    );
  }

  function delList() {
    closeMenu();
    const delItem = Number(menu.classList[4].split("-")[1]);
    const newLists = JSON.parse(JSON.stringify(lists));
    const listId = lists[delItem].id;
    const listTitle = lists[delItem].title;
    newLists[delItem].delete_dt = 1;
    setLists(newLists);
    const tasks = {
      kanbanId,
      tasks: newLists,
    };
    ws.emit("task update", tasks);
    //put list api
    fetchPutData(`${API_HOST}/kanban/${kanbanId}/list/${listId}/detail`, {
      delete_dt: 1,
      title: listTitle,
    });
  }

  function editList(e, index) {
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[index].title = e.target.value;
    setLists(newLists);
    const tasks = {
      kanbanId,
      tasks: newLists,
    };
    ws.emit("task update", tasks);
  }

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const taskId = result.draggableId;
    const listId = columns[source.droppableId].id;
    if (blockTasks.current[listId]) {
      if (
        blockTasks.current[listId].some(({ block }) => {
          return block == taskId;
        })
      ) {
        alert("the task is temporarily blocked by other user");
        return;
      }
    }

    if (source.droppableId !== destination.droppableId) {
      //if not the same list
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.tasks];
      const destItems = [...destColumn.tasks];
      const [removed] = sourceItems.splice(source.index, 1);

      destItems.splice(destination.index, 0, removed);
      if (destColumn.tasks.length === 0) {
        destItems[destination.index].list_id =
          columns[destination.droppableId].id;
      } else if (destination.index != 0) {
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

      if (user.role_id > 1) {
        return;
      }

      const newList = JSON.parse(JSON.stringify(lists));
      newList[source.droppableId].tasks = sourceItems;
      newList[destination.droppableId].tasks = destItems;
      submitTask.current = destItems[0].list_id;

      setLists(newList);
      const tasks = {
        kanbanId,
        tasks: newList,
      };
      ws.emit("task update", tasks);
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

      if (user.role_id > 1) {
        return;
      }
      const newList = JSON.parse(JSON.stringify(lists));
      newList[source.droppableId].tasks = copiedItems;
      submitTask.current = copiedItems[0].list_id;
      setLists(newList);
      const tasks = {
        kanbanId,
        tasks: newList,
      };
      ws.emit("task update", tasks);
    }
  };

  useEffect(() => {
    addLocalStorage("kanbanId", kanbanId);
    fetchData(`${API_HOST}/kanban/${kanbanId}/tasks`, true).then(
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
    ws.on("task update", (tasks) => {
      if (editingRef.current) {
        setTaskUpdateQue(tasks);
        return;
      }
      setLists(tasks);
    });
    ws.on("task block", (tasks) => {
      blockTasks.current = tasks;
      setBlocks(tasks);
    });
  }, []);

  //   post data
  useEffect(() => {
    listsRef.current = listsRef.current.slice(0, lists.length);
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(`${API_HOST}/kanban/${kanbanId}/tasks`, lists).then(
      (lists) => {
        submittingStatus.current = false;
      }
    );
  }, [lists]);

  const style = {
    overflowY: "hidden",
    overflowX: "scroll",
    height: "85vh",
  };
  return (
    <DashboardLayout videoOpen={videoOpen} setVideoOpen={setVideoOpen}>
      <MDBox id="kanban-container" pt={6} pb={3} style={style}>
        <Grid container spacing={6} wrap="nowrap">
          <DragDropContext
            onDragEnd={(result) => onDragEnd(result, lists, setLists)}
          >
            {lists.map((list, index) => {
              const { id, title, tasks, delete_dt } = list;
              if (!delete_dt) {
                return (
                  <Grid item xs={6} style={{ minWidth: "19vw" }}>
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
                              placeholder={title ? "" : "untitled"}
                              value={title ? title : ""}
                              className="list-title"
                              ref={(el) => (listsRef.current[index] = el)}
                              onChange={(e) => editList(e, index)}
                              onBlur={() =>
                                fetchPutData(
                                  `${API_HOST}/kanban/${kanbanId}/list/${id}/detail`,
                                  { title }
                                )
                              }
                            />
                          </Grid>
                          {user.role_id > 1 ? (
                            <></>
                          ) : (
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
                                <MenuItem
                                  onClick={delList}
                                  style={{ padding: "0px" }}
                                >
                                  <DeleteOutlineIcon
                                    style={{ marginRight: "7px" }}
                                  />{" "}
                                  delete the list
                                </MenuItem>
                              </Menu>
                            </Grid>
                          )}
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
                          ws={ws}
                          editingRef={editingRef}
                          taskUpdateQue={taskUpdateQue}
                          setTaskUpdateQue={setTaskUpdateQue}
                          blockTasks={blockTasks}
                          blocks={blocks[id]}
                          videoOpen={videoOpen}
                          setVideoOpen={setVideoOpen}
                        />
                      </MDBox>
                    </Card>
                  </Grid>
                );
              }
            })}
          </DragDropContext>
          {user.role_id > 1 ? (
            <></>
          ) : (
            <Grid item xs={3} style={{ minWidth: "20vw" }}>
              <MDButton
                variant="gradient"
                color="secondary"
                fullWidth
                onClick={addList}
              >
                Add List
              </MDButton>
            </Grid>
          )}
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Tables;
