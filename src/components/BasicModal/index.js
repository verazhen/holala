import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useEffect, useState, useRef } from "react";
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

// const styles = {
//   fontFamily: "sans-serif",
//   textAlign: "center",
//   position: "absolute",
//   width: "100vw",
//   top: "50%",
// };

// (e) =>
//               setChipData((prev) => {
//                 return [...prev, { key: prev.length, label: "New Task" }];
//               })

const formStyle = {
  width: "50vw",
  height: "30vh",
};
const inputStyle = {
  margin: "1%",
  width: "70%",
};

const titleStyle = {
  margin: "1%",
  width: "70%",
  fontSize: "30px",
};

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
}) {
  const [title, setTitle] = useState(taskName);
  const [tagInput, setTagInput] = useState("");
  const [openTagModal, setOpenTagModal] = useState(false);
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

  useEffect(() => console.log(kanbanChip), [kanbanChip]);

  return (
    <Modal
      open={open}
      onClose={onCloseModal}
      //       style={formStyle}
    >
      <div>
        <h2>Task Detail</h2>
        <MDInput
          type="text"
          label="Task Name"
          value={title}
          style={titleStyle}
          onChange={(e) => handleChange(e, title, setTitle)}
        />
        <Grid container direction="row">
          {chipData.map((data) => {
            return (
              <Grid item>
                <Chip
                  label={data.label}
                  onDelete={
                    data.label === "React" ? undefined : handleDelete(data)
                  }
                />
              </Grid>
            );
          })}
          <Chip label="Add Tag" onClick={() => setOpenTagModal(true)} />
          <Modal open={openTagModal} onClose={() => setOpenTagModal(false)}>
            <FormGroup>
              <FormGroup row>
                <TextField
                  variant="outlined"
                  placeholder="Enter a tag name"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <MDButton
                  variant="contained"
                  disableElevation
                  onClick={() =>
                    setKanbanChip((prev) => {
                      const newArr = [
                        ...prev,
                        { key: prev.length, label: tagInput, checked: false },
                      ];
                      return newArr;
                    })
                  }
                >
                  ADD Tag
                </MDButton>
              </FormGroup>
              {kanbanChip.map((data) => {
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
              })}
            </FormGroup>
          </Modal>
        </Grid>
        <form>
          <div className="input-group input-group-static mb-4">
            <label>Assignee</label>
            <br />
            <FormControl style={inputStyle}>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                //                 value={age}
                label="Age"
                //                 onChange={handleChange}
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div class="input-group input-group-static my-3">
            <label>Due</label>
            <br />
            <MDInput
              type="date"
              label="Date"
              value="2018-11-23"
              style={inputStyle}
            />
          </div>
        </form>
        <MDButton onClick={onSaveModal}>Save</MDButton>
      </div>
    </Modal>
  );
}

export default BasicModal;
