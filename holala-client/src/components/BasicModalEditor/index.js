import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useEffect, useState, useRef, useContext } from "react";
import MDInput from "components/MDInput";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MDButton from "components/MDButton";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import FormGroup from "@mui/material/FormGroup";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Avatar from "@mui/material/Avatar";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import Paper from "@mui/material/Paper";
import MDProgress from "components/MDProgress";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { API_HOST } from "utils/constants";

const ResultArea = styled.div`
  width: 100%;
  height: 100%;
  border: none;
  font-size: 17px;
`;

function getFullDate(targetDate) {
  var D, y, m, d;
  if (targetDate) {
    D = new Date(targetDate);
    y = D.getFullYear();
    m = D.getMonth() + 1;
    d = D.getDate();
  } else {
    return null;
  }
  m = m > 9 ? m : "0" + m;
  d = d > 9 ? d : "0" + d;

  return y + "-" + m + "-" + d;
}

function BasicModal({
  open,
  setOpen,
  onCloseModal,
  taskName,
  submittingStatus,
  lists,
  setLists,
  taskIndex,
  listIndex,
  kanbanId,
  listId,
  taskId,
  task,
  hashtags,
  setTags,
  memberList,
  user,
  taskUpdateQue,
  setTaskUpdateQue,
  ws,
}) {
  const [title, setTitle] = useState(taskName);
  const [checked, setChecked] = useState(task.checked ? true : false);
  const [due, setDue] = useState(getFullDate(task.due_dt));
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState([]);
  const [myComment, setMyComment] = useState("");
  const [progress, setProgress] = useState(0);
  const [editStatus, setEditStatus] = useState(false);
  const [markdownText, setMarkdownText] = useState(
    task.description ? task.description : ""
  );
  const [openTagModal, setOpenTagModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [members, setMembers] = useState([]);
  const editor = useRef(null);
  const [assignee, setAssignee] = useState(task.name ? task.name : "");
  const [todos, setTodos] = useState([]);
  const [chipData, setChipData] = useState([]);
  const [kanbanChip, setKanbanChip] = useState([]);
  const initialization = useRef(null);
  const updateChips = useRef(null);
  const updateTodos = useRef(null);

  useEffect(() => {
    if (!initialization.current) {
      return;
    }
    const customTags = JSON.parse(JSON.stringify(hashtags));
    for (let i = 0; i < customTags.length; i++) {
      const test = chipData.some((chip) => chip.label === customTags[i].label);
      if (test) {
        customTags[i].checked = true;
      }
    }

    setKanbanChip(customTags);
    initialization.current = false;
  }, [hashtags, chipData]);

  useEffect(() => {
    setMembers(memberList);
  }, [memberList]);

  useEffect(() => {
    //getTaskDetails
    fetchData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}`,
      false
    ).then(({ todos, comments, images, tags }) => {
      const newTodos = todos.map((todo, i, arr) => {
        arr[i].key = i;
        arr[i].checked = arr[i].checked ? true : false;
        return arr[i];
      });
      setTodos(newTodos);
      setComments(comments);
      const newFiles = images.map((file, i, arr) => {
        arr[i].key = i;
        arr[i].src = file.url;
        arr[i].name = file.create_dt;
        return arr[i];
      });
      setFiles(newFiles);

      const newTags = tags.map((tag, i, arr) => {
        arr[i].key = i;
        return arr[i];
      });
      setChipData(newTags);
      initialization.current = true;
    });
  }, []);

  function leaveComment() {
    const newComment = {
      name: user.name,
      content: myComment,
    };
    fetchSetData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}/comment`,
      newComment
    );

    setComments((prev) => {
      return [newComment, ...prev];
    });
    setMyComment("");
  }

  function onSaveModal() {
    let assigneeId;
    for (let i = 0; i < memberList.length; i++) {
      if (memberList[i].name === assignee) {
        assigneeId = memberList[i].uid;
        break;
      }
    }
    let newLists;

    //check if taskUpdateQue is empty
    if (taskUpdateQue) {
      newLists = JSON.parse(JSON.stringify(taskUpdateQue));
      setTaskUpdateQue(null);
    } else {
      newLists = JSON.parse(JSON.stringify(lists));
    }
    newLists[listIndex].tasks[taskIndex].title = title;
    newLists[listIndex].tasks[taskIndex].assignee = assigneeId;
    newLists[listIndex].tasks[taskIndex].due = due;
    newLists[listIndex].tasks[taskIndex].checked = checked;
    newLists[listIndex].tasks[taskIndex].description = markdownText;
    setLists(newLists);
    const tasks = {
      kanbanId,
      tasks: newLists,
    };
    ws.emit("task update", tasks);

    const newTask = {
      title,
      assignee: assigneeId,
      due_dt: due,
      checked,
      description: markdownText,
    };
    fetchPutData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}`,
      newTask
    );
    onCloseModal();
  }

  function cancelBtn() {
    //check if taskUpdateQue is empty
    if (taskUpdateQue) {
      setTaskUpdateQue(null);
      const newLists = JSON.parse(JSON.stringify(taskUpdateQue));
      setLists(newLists);
    }
    onCloseModal();
  }

  function handleChange(e, data, setData) {
    setData(e.target.value);
  }

  async function uploadFile(e) {
    const url = await fetchData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}/imageUrl`,
      false
    );

    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: e.target.files[0],
    });

    const imageUrl = url.split("?")[0];

    setFiles((prev) => {
      return [
        ...prev,
        {
          key: prev.length,
          src: imageUrl,
          name: e.target.files[0].name,
        },
      ];
    });
  }

  useEffect(() => {
    setProgress(
      (todos.filter((todo) => {
        return todo.checked === true;
      }).length /
        todos.length) *
        100
    );

    if (updateTodos.current) {
      fetchPutData(
        `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}/todo`,
        todos
      ).then(() => {
        updateTodos.current = false;
      });
    }
  }, [todos]);

  useEffect(() => {
    if (!updateChips.current) {
      return;
    }
    fetchPutData(
      `${API_HOST}/kanban/${kanbanId}/list/${listId}/task/${taskId}/tag`,
      chipData
    ).then(() => {
      updateChips.current = false;
    });
  }, [chipData]);

  function updateTodoChecked(e, data) {
    setTodos((prev) => {
      const newArr = [...prev];
      newArr[data.key].checked = e.target.checked;
      return newArr;
    });
    updateTodos.current = true;
  }

  function editTodo(e, data) {
    setTodos((prev) => {
      const newArr = [...prev];
      newArr[data.key].title = e.target.value;
      return newArr;
    });
    updateTodos.current = true;
  }

  function addTodo() {
    const newTodo = {
      title: "",
      label: "add new task",
      checked: false,
      parent_id: taskId,
    };

    fetchSetData(`${API_HOST}/kanban/${kanbanId}/list/${listId}/task`, newTodo);

    setTodos((prev) => {
      newTodo.key = prev.length;
      const newArr = [...prev, newTodo];
      return newArr;
    });
  }

  function Myform({ data }) {
    return (
      <FormControlLabel
        control={
          <Checkbox
            key={data.key}
            checked={data.checked}
            onChange={(e) => {
              setKanbanChip((prev) => {
                const newArr = [...prev];
                newArr[data.key].checked = e.target.checked;
                return newArr;
              });
              setChipData(() => {
                const newChips = kanbanChip.filter((chip) => {
                  return chip.checked === 1 || chip.checked === true;
                });
                return newChips;
              });
              updateChips.current = true;
            }}
          />
        }
        label={data.label}
      />
    );
  }

  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      closeOnOverlayClick="true"
      onOverlayClick={() => {
        onCloseModal();
      }}
      closeIcon={<></>}
      classNames={{
        modal: "basicModal",
      }}
    >
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Grid
            container
            spacing={3}
            direction="row"
            wrap="nowrap"
            mb={3}
            style={{ width: "100%" }}
          >
            <Grid item mr="auto" xs={11}>
              <input
                type="text"
                value={title}
                className="title"
                onChange={(e) => setTitle(e.target.value)}
              ></input>
            </Grid>
            <Grid item>
              <MDButton onClick={onSaveModal}>Save</MDButton>
            </Grid>
            <Grid item>
              <MDButton onClick={cancelBtn}>Cancel</MDButton>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container spacing={3} direction="row" wrap="nowrap">
              <Grid item>
                <label className="modal-label">Assignee</label>
                <Grid
                  container
                  spacing={1}
                  direction="row"
                  wrap="nowrap"
                  mt={0.3}
                >
                  <Grid item>
                    <Avatar>{assignee ? assignee.charAt(0) : "null"}</Avatar>
                  </Grid>
                  <Grid item>
                    <MDButton onClick={() => setOpenMemberModal(true)}>
                      Change
                    </MDButton>
                    <Modal
                      open={openMemberModal}
                      onClose={() => setOpenMemberModal(false)}
                      classNames={{
                        overlay: "customOverlay",
                        modal: "customModal",
                      }}
                    >
                      <Typography variant="h5">Choose a Member</Typography>
                      <hr style={{ margin: "5px 0", color: "lightgrey" }} />
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        defaultValue="female"
                        name="radio-buttons-group"
                        onChange={(e) => {
                          setAssignee(e.target.value);
                        }}
                      >
                        {members.map((member) => {
                          return (
                            <FormControlLabel
                              value={member.name ? member.name : ""}
                              control={<Radio />}
                              label={member.name ? member.name : ""}
                            />
                          );
                        })}
                      </RadioGroup>
                    </Modal>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <label className="modal-label">Status</label>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  wrap="nowrap"
                  mt={-0.5}
                >
                  <Grid item>
                    <Checkbox
                      checked={checked}
                      color="primary"
                      sx={{
                        transform: "scale(1.2)",
                      }}
                      className="checked"
                      onChange={(e) => setChecked(!checked)}
                    />
                  </Grid>{" "}
                </Grid>
              </Grid>
              <Grid item>
                <label className="modal-label">Due</label>
                <MDInput
                  type="date"
                  value={due}
                  style={{ width: "100%" }}
                  onChange={(e) => setDue(e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid item mt={1.5}>
              <label className="modal-label">Tags</label>
              <Grid container direction="row" mt={1}>
                {chipData.map((data) => {
                  return (
                    <Grid item mr={1}>
                      <Chip label={data.label} />
                    </Grid>
                  );
                })}
                <Chip
                  label="Add Tag"
                  style={{
                    backgroundColor: "#45C4B0",
                    color: "white",
                    fontWeight: "bold",
                  }}
                  onClick={() => setOpenTagModal(true)}
                />
              </Grid>
              <Modal
                open={openTagModal}
                onClose={() => setOpenTagModal(false)}
                classNames={{
                  overlay: "customOverlay",
                  modal: "customTagModal",
                }}
              >
                <Grid container spacing={2} direction="row" wrap="nowrap">
                  <Grid item>
                    <TextField
                      variant="outlined"
                      placeholder="Enter a tag name"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                    />
                  </Grid>
                  <Grid item>
                    <MDButton
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        setKanbanChip((prev) => {
                          const newArr = [
                            ...prev,
                            {
                              key: prev.length,
                              label: tagInput,
                              checked: false,
                            },
                          ];
                          return newArr;
                        })
                      }
                    >
                      ADD Tag
                    </MDButton>
                  </Grid>
                </Grid>
                {kanbanChip.map((data) => {
                  return <Myform data={data} />;
                })}
              </Modal>
            </Grid>
          </Grid>
        </Grid>
        <Grid item style={{ width: "100%" }}>
          <label className="modal-label" style={{ marginRight: "10px" }}>
            Description
          </label>
          {editStatus === true ? (
            <textarea
              className="description"
              ref={editor}
              placeholder={"say Something in markdown about this task..."}
              value={notes ? notes : ""}
              onChange={(e) => {
                setNotes(e.target.value);
                setMarkdownText(e.currentTarget.value);
              }}
              style={{ height: "200px", overflow: "auto" }}
              onBlur={() => setEditStatus(false)}
            ></textarea>
          ) : (
            <>
              <MDButton
                variant="contained"
                color="secondary"
                ml={5}
                style={{
                  maxWidth: "65px",
                  maxHeight: "30px",
                  minWidth: "65px",
                  minHeight: "30px",
                }}
                onClick={() => {
                  setEditStatus(true);
                  editor.current.focus();
                }}
              >
                Edit
              </MDButton>
              <div
                style={{
                  color: "dimgrey",
                  fontSize: "1.2rem",
                  lineHeight: "2.3rem",
                  paddingLeft: "1rem",
                  marginTop: "0.5rem",
                }}
              >
                <ReactMarkdown>{markdownText}</ReactMarkdown>
              </div>
            </>
          )}
        </Grid>
        <Grid item style={{ width: "100%" }}>
          <label className="modal-label">To-Do List</label>
          <MDProgress value={progress} mt={1} color="secondary" />
          <Grid container spacing={0.5} direction="column" wrap="nowrap" mt={1}>
            {todos.map((data) => {
              return (
                <Grid item>
                  <Checkbox
                    key={data.key}
                    checked={data.checked}
                    onChange={(e) => updateTodoChecked(e, data)}
                  />

                  <input
                    type="text"
                    value={data.title ? data.title : ""}
                    placeholder={data.label ? data.label : "add new task"}
                    className="todo"
                    onChange={(e) => editTodo(e, data)}
                  ></input>
                </Grid>
              );
            })}
            <MDButton
              variant="contained"
              className="label-button"
              style={{
                marginTop: "5px",
                marginLeft: "10px",
                maxWidth: "80px",
                maxHeight: "35px",
                minWidth: "80px",
                minHeight: "35px",
                padding: 0,
              }}
              onClick={addTodo}
            >
              ADD ToDo
            </MDButton>
          </Grid>
        </Grid>
        <Grid item>
          <label className="modal-label">Attachments</label>
          <input type="file" onChange={uploadFile} />
          {files.map((file) => {
            return (
              <Grid container spacing={2} direction="row" wrap="nowrap" my={2}>
                <Grid item>
                  <img src={file.src} width="80px" />
                </Grid>
                <Grid item xs={8}>
                  <input
                    type="text"
                    value={file.name ? file.name : ""}
                    className="file-name"
                    onChange={(e) =>
                      setFiles((prev) => {
                        const newArr = [...prev];
                        newArr[file.key].name = e.target.value;
                        return newArr;
                      })
                    }
                  ></input>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        <Grid item style={{ width: "100%" }}>
          <label className="modal-label">Comment</label>
          {comments.map((comment) => {
            return (
              <Grid container spacing={2} direction="row" wrap="nowrap" my={2}>
                <Grid item>
                  <Avatar>
                    {comment.name ? comment.name.charAt(0) : "null"}
                  </Avatar>
                </Grid>
                <Grid item xs={11}>
                  <Paper
                    variant="outlined"
                    style={{
                      borderRadius: "10px",
                      width: "100%",
                    }}
                  >
                    <Typography
                      m={1}
                      style={{
                        fontSize: "1rem",
                        color: "dimgrey",
                        width: "97%",
                        overflowWrap: "break-word",
                      }}
                    >
                      {comment.content}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            );
          })}
          <Grid
            container
            spacing={2}
            direction="row"
            wrap="nowrap"
            my={2}
            style={{ width: "100%" }}
          >
            <Grid item xs={9.3} style={{ width: "100%" }}>
              <input
                type="text"
                value={myComment}
                className="leave-comment"
                onChange={(e) => setMyComment(e.target.value)}
              ></input>
            </Grid>
            <Grid item>
              <MDButton
                variant="contained"
                color="secondary"
                onClick={leaveComment}
              >
                Leave Comment
              </MDButton>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            direction="row"
            wrap="nowrap"
            my={2}
            style={{ width: "100%" }}
          >
            <Grid item mr="auto"></Grid>
            <Grid item>
              <MDButton onClick={onSaveModal}>Save</MDButton>
            </Grid>
            <Grid item>
              <MDButton onClick={() => onCloseModal()}>Cancel</MDButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
}

export default BasicModal;
