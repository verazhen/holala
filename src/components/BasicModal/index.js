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
import { fetchData, fetchSetData } from "utils/fetch";

const ResultArea = styled.div`
  width: 100%;
  height: 100%;
  border: none;
  font-size: 17px;
`;

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
}) {
  const [title, setTitle] = useState(taskName);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("say Something about this task...");
  const [files, setFiles] = useState([]);
  const [comments, setComments] = useState([
    { name: "Vera", content: "Hello World" },
    { name: "Vera", content: "Hello World2" },
  ]);
  const [myComment, setMyComment] = useState("");
  const [progress, setProgress] = useState(0);
  const [editStatus, setEditStatus] = useState(true);
  const [markdownText, setMarkdownText] = useState("");
  const [openTagModal, setOpenTagModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [members, setMembers] = useState(["Vera", "Shane", "Tony"]);
  const editor = useRef(null);
  const [assignee, setAssignee] = useState("");
  const [todos, setTodos] = useState([
    { key: 0, label: "task 1", checked: true },
    { key: 1, label: "task 2", checked: true },
    { key: 2, label: "task 3", checked: false },
  ]);
  const [chipData, setChipData] = useState([
    { key: 0, label: "Angular" },
    { key: 1, label: "jQuery" },
    { key: 2, label: "Polymer" },
  ]);
  const [kanbanChip, setKanbanChip] = useState([
    { key: 0, label: "Angular", checked: true },
    { key: 1, label: "jQuery", checked: true },
    { key: 2, label: "Polymer", checked: true },
    { key: 3, label: "Another", checked: false },
  ]);
  function onSaveModal() {
    submittingStatus.current = true;
    const newTitle = title;
    const newLists = JSON.parse(JSON.stringify(lists));
    newLists[listIndex].tasks[taskIndex].title = newTitle;
    setLists(newLists);
    onCloseModal();
  }

  function handleChange(e, data, setData) {
    setData(e.target.value);
  }
  const handleDelete = (chipToDelete) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    );
  };

  async function uploadFile(e) {
    const url = await fetchData(
      `http://localhost:5000/api/1.0/kanban/${kanbanId}/list/${listId}/task/${taskId}/imageUrl`,
      false
    );
    console.log(url);

    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: e.target.files[0],
    });

    const imageUrl = url.split("?")[0];
    console.log(imageUrl);

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
  }, [todos]);

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
                  return chip.checked === true;
                });
                return newChips;
              });
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
      classNames={{
        modal: "basicModal",
      }}
    >
      <Grid container spacing={3} direction="column">
        <Grid item>
          <Grid container spacing={3} direction="row" wrap="nowrap" mb={3}>
            <Grid item xs={10}>
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
                    <Avatar>{assignee.charAt(0)}</Avatar>
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
                        onChange={(e) => setAssignee(e.target.value)}
                      >
                        {members.map((member) => {
                          return (
                            <FormControlLabel
                              value={member}
                              control={<Radio />}
                              label={member}
                            />
                          );
                        })}
                      </RadioGroup>
                    </Modal>
                  </Grid>
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
                    <Checkbox sx={{ transform: "scale(1.2)" }} />
                  </Grid>{" "}
                  <Grid item>
                    <MDInput
                      type="date"
                      value="2018-11-23"
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
                      <Chip
                        label={data.label}
                        onDelete={
                          data.label === "React"
                            ? undefined
                            : handleDelete(data)
                        }
                      />
                    </Grid>
                  );
                })}
                <Chip label="Add Tag" onClick={() => setOpenTagModal(true)} />
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
        <Grid item>
          <label className="modal-label" style={{ marginRight: "10px" }}>
            Description
          </label>
          {editStatus === true ? (
            <textarea
              className="description"
              ref={editor}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setMarkdownText(e.currentTarget.value);
              }}
              style={{ height: "200px" }}
              onBlur={() => setEditStatus(false)}
            ></textarea>
          ) : (
            <>
              <MDButton
                variant="contained"
                color="secondary"
                ml={5}
                style={{ width: "8px", padding: 0 }}
                onClick={() => {
                  setEditStatus(true);
                  editor.current.focus();
                }}
              >
                Edit
              </MDButton>
              <ReactMarkdown>{markdownText}</ReactMarkdown>
            </>
          )}
        </Grid>
        <Grid item>
          <label className="modal-label">To-Do List</label>
          <MDProgress value={progress} mt={1} />
          <Grid container spacing={2} direction="column" wrap="nowrap">
            {todos.map((data) => {
              return (
                <Grid item>
                  <Checkbox
                    key={data.key}
                    checked={data.checked}
                    onChange={(e) => {
                      setTodos((prev) => {
                        const newArr = [...prev];
                        newArr[data.key].checked = e.target.checked;
                        return newArr;
                      });
                    }}
                  />

                  <input
                    type="text"
                    value={data.label}
                    className="todo"
                    onChange={(e) =>
                      setTodos((prev) => {
                        const newArr = [...prev];
                        newArr[data.key].label = e.target.value;
                        return newArr;
                      })
                    }
                  ></input>
                </Grid>
              );
            })}
            <MDButton
              variant="contained"
              color="secondary"
              onClick={() => {
                setTodos((prev) => {
                  const newArr = [
                    ...prev,
                    {
                      key: prev.length,
                      label: "Task ...",
                      checked: false,
                    },
                  ];
                  return newArr;
                });
              }}
            >
              ADD ToDo
            </MDButton>
          </Grid>
        </Grid>
        <Grid item>
          <label className="modal-label">Attachments</label>
          <MDButton variant="contained" component="label">
            Upload File
            <input type="file" onChange={uploadFile} hidden />
          </MDButton>
          {files.map((file) => {
            return (
              <Grid container spacing={2} direction="row" wrap="nowrap" my={2}>
                <Grid item>
                  <img src={file.src} width="80px" />
                </Grid>
                <Grid item xs={8}>
                  <input
                    type="text"
                    value={file.name}
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
        <Grid item>
          <label className="modal-label">Comment</label>
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
                onClick={() =>
                  setComments((prev) => {
                    return [
                      {
                        name: "Me",
                        content: myComment,
                      },
                      ...prev,
                    ];
                  })
                }
              >
                Leave Comment
              </MDButton>
            </Grid>
          </Grid>
          {comments.map((comment) => {
            return (
              <Grid container spacing={2} direction="row" wrap="nowrap" my={2}>
                <Grid item>
                  <Avatar>{comment.name.charAt(0)}</Avatar>
                </Grid>
                <Grid item xs={11}>
                  <Paper
                    variant="outlined"
                    style={{
                      height: "2.5rem",
                      width: "100%",
                    }}
                  >
                    <Typography m={1} style={{ fontSize: "1rem" }}>
                      {comment.content}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Modal>
  );
}

export default BasicModal;
