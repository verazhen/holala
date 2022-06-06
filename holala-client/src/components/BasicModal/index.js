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
}) {
  const [title, setTitle] = useState(taskName);
  const [checked, setChecked] = useState(task.checked ? true : false);
  const [due, setDue] = useState(getFullDate(task.due_dt));
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("say Something about this task...");
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

  function cancelBtn() {
    //check if taskUpdateQue is empty
    if (taskUpdateQue) {
      setTaskUpdateQue(null);
      const newLists = JSON.parse(JSON.stringify(taskUpdateQue));
      setLists(newLists);
    }
    onCloseModal();
  }

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

  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      closeIcon={<></>}
      classNames={{
        modal: "basicModal",
      }}
    >
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Grid container spacing={3} direction="row" wrap="nowrap" mb={3}>
            <Grid item xs={11}>
              <input type="text" value={title} className="title"></input>
            </Grid>
            <Grid item>
              <MDButton onClick={cancelBtn}>Close</MDButton>
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
                  <Grid item></Grid>
                </Grid>
              </Grid>
              <Grid item>
                <label className="modal-label">Due</label>
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
                    />
                  </Grid>{" "}
                  <Grid item>
                    <MDInput
                      type="date"
                      value={due}
                      style={{ width: "100%" }}
                    />
                  </Grid>
                </Grid>
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
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <label className="modal-label" style={{ marginRight: "10px" }}>
            Description
          </label>
          {editStatus === true ? (
            <textarea
              className="description"
              ref={editor}
              value={notes}
              style={{ height: "200px" }}
              onBlur={() => setEditStatus(false)}
            ></textarea>
          ) : (
            <>
              <ReactMarkdown>{markdownText}</ReactMarkdown>
            </>
          )}
        </Grid>
        <Grid item>
          <label className="modal-label">To-Do List</label>
          <MDProgress value={progress} mt={1} color="secondary" />
          <Grid container spacing={0.5} direction="column" wrap="nowrap" mt={1}>
            {todos.map((data) => {
              return (
                <Grid item>
                  <Checkbox key={data.key} checked={data.checked} />
                  <input
                    type="text"
                    value={data.title}
                    className="todo"
                  ></input>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
        <Grid item>
          <label className="modal-label">Attachments</label>
          {files.map((file) => {
            return (
              <Grid container spacing={2} direction="row" wrap="nowrap" my={2}>
                <Grid item>
                  <img src={file.src} width="80px" />
                </Grid>
                <Grid item xs={8}>
                  <div
                    type="text"
                    value={file.name ? file.name : ""}
                    className="file-name"
                  ></div>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
        <Grid item>
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
                      height: "2.5rem",
                      width: "100%",
                      borderRadius: "10px",
                    }}
                  >
                    <Typography
                      m={1}
                      style={{ fontSize: "1rem", color: "dimgrey" }}
                    >
                      {comment.content}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            );
          })}
          <Grid container spacing={2} direction="row" wrap="nowrap" my={2}>
            <Grid item xs={9.3}>
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
        </Grid>
      </Grid>
    </Modal>
  );
}

export default BasicModal;
