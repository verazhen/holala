import React from "react";
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

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center",
  top: "30%",
};
const formStyle = {
  width: "50vw",
  height: "80vh",
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

  return (
    <div style={styles}>
      <Modal open={open} onClose={onCloseModal}>
        <h2>Task Detail</h2>
        <MDInput
          type="text"
          label="Task Name"
          value={title}
          style={titleStyle}
          onChange={(e) => handleChange(e, title, setTitle)}
        />
        <form style={formStyle}>
          <div class="input-group input-group-static mb-4">
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
      </Modal>
    </div>
  );
}

export default BasicModal;
