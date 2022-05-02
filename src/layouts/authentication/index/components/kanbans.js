import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import KanbanMenu from "examples/Tables/KanbanMenu";

// Data
import data from "layouts/authentication/components/Projects/data";
import { fetchData, fetchSetData } from "utils/fetch";

function Projects({ setUser }) {
  const [kanbans, setKanbans] = useState([]);

  useEffect(() => {
    fetchData("http://localhost:5000/api/1.0/kanbans", true).then(
      ({ user, data }) => {
        setUser(user);
        setKanbans(data);
      }
    );
  }, []);

  const style = {
    borderBottom: "1px dashed lightgrey",
  };

  const { columns, rows } = data(kanbans);
  const [menu, setMenu] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEdit, setEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

  function addKanban() {
    console.log(newTitle);
    //post new kanban with newtitle and get kanban id
    //render kanban with kanban id & title
    setOpenDialog(false);
  }

  function saveEdit() {
    closeMenu();
    setEdit(false);
    const index = editIndex;
    const newKanbans = JSON.parse(JSON.stringify(kanbans));
    const kanbanId = kanbans[index].id;
    newKanbans[index].title = newTitle;
    setKanbans(newKanbans);
  }

  function editKanban() {
    const index = Number(menu.classList[4].split("-")[1]);
    closeMenu();
    setEdit(true);
    setNewTitle(kanbans[index].title);
    setEditIndex(index);
  }

  function delKanban() {
    const index = Number(menu.classList[4].split("-")[1]);
    const newKanbans = JSON.parse(JSON.stringify(kanbans));
    const kanbanId = kanbans[index].id;
    const kanbanTitle = kanbans[index].title;
    newKanbans[index].delete_dt = 1;
    setKanbans(newKanbans);
    closeMenu();
  }

  const renderMenu = (
    <Menu
      id="simple-menu"
      anchorEl={menu}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={Boolean(menu)}
      onClose={closeMenu}
    >
      <MenuItem onClick={editKanban}>edit kanban</MenuItem>
      <MenuItem onClick={delKanban}>delete kanban</MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center">
        <Grid container direction="row" alignItems="center" m={3} wrap="nowrap">
          <Grid item xs={11}>
            <MDTypography variant="h4" gutterBottom>
              KANBANs
            </MDTypography>
            <MDBox display="flex" alignItems="center" lineHeight={0}>
              <Icon
                sx={{
                  fontWeight: "bold",
                  color: ({ palette: { info } }) => info.main,
                  mt: -0.5,
                }}
              >
                done
              </Icon>
              <MDTypography variant="button" fontWeight="regular" color="text">
                &nbsp;<strong>{kanbans.length} </strong> kanbans
              </MDTypography>
            </MDBox>
          </Grid>
          <Grid item>
            <MDButton
              variant="contained"
              color="secondary"
              onClick={() => {
                setNewTitle("");
                setOpenDialog(!openDialog);
              }}
            >
              Add Kanban
            </MDButton>
            <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(!openDialog)}
            >
              <DialogTitle>Create New Kanban</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Please name your new kanban.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Kanban Title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  fullWidth
                  variant="standard"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(!openDialog)}>
                  Cancel
                </Button>
                <Button onClick={addKanban}>Save</Button>
              </DialogActions>
            </Dialog>
            <Dialog open={openEdit} onClose={() => setEdit(!openEdit)}>
              <DialogTitle>Edit Kanban</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Please rename your kanban.
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Kanban Title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  fullWidth
                  variant="standard"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEdit(!openEdit)}>Cancel</Button>
                <Button onClick={saveEdit}>Save</Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </MDBox>
      <MDBox>
        {kanbans.map(({ kanban_id, title, delete_dt }, index) => {
          if (!delete_dt) {
            return (
              <Grid container direction="row" alignItems="center" m={3}>
                <Grid item xs={11} style={style}>
                  <MDTypography variant="h5">
                    <Link to={`/project/${kanban_id}/kanban`}>{title}</Link>
                  </MDTypography>
                </Grid>
                <Grid item>
                  <MDBox color="text" px={2}>
                    <Icon
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                      fontSize="small"
                      onClick={openMenu}
                      className={`index-${index}`}
                    >
                      more_vert
                    </Icon>
                  </MDBox>
                  {renderMenu}
                </Grid>
              </Grid>
            );
          }
        })}
      </MDBox>
    </Card>
  );
}

export default Projects;
