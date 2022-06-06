import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

// react-router components
import { useLocation, Link } from "react-router-dom";
import { getLocalStorage } from "utils/utils";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";
import { Modal } from "react-responsive-modal";

// @material-ui core components
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import PersonIcon from "@mui/icons-material/Person";
import { blue } from "@mui/material/colors";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { API_HOST } from "utils/constants";

// Material Dashboard 2 React example components
import Breadcrumbs from "elements/Breadcrumbs";
import NotificationItem from "elements/Items/NotificationItem";
import DefaultNavbarLink from "elements/Navbars/DefaultNavbar/DefaultNavbarLink";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "elements/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setOpenConfigurator,
} from "context";

function DashboardNavbar({ absolute, light, isMini }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    transparentNavbar,
    fixedNavbar,
    openConfigurator,
    darkMode,
  } = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [account, setAccount] = useState({});
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [kanban, setKanban] = useState("");
  const [alert, setAlert] = useState({});
  const descriptionElementRef = useRef(null);
  const [scroll, setScroll] = useState("paper");
  const [email, setEmail] = useState("");
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);

  useEffect(() => {
    if (openDialog) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [openDialog]);

  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (fixedNavbar && window.scrollY === 0) || !fixedNavbar
      );
    }

    /**
     The event listener that's calling the handleTransparentNavbar function when
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleOpenMenu = (event) => setOpenMenu(event.currentTarget);
  const handleCloseMenu = () => setOpenMenu(false);

  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{ mt: 2 }}
    >
      <NotificationItem icon={<Icon>email</Icon>} title="Check new messages" />
      <NotificationItem
        icon={<Icon>podcasts</Icon>}
        title="Manage Podcast sessions"
      />
      <NotificationItem
        icon={<Icon>shopping_cart</Icon>}
        title="Payment successfully completed"
      />
    </Menu>
  );

  useEffect(() => {
    fetchData(`${API_HOST}/kanban/${kanbanId}/tasks`, true).then(
      ({ user, account }) => {
        setAccount(account);
        setMembers(user);
      }
    );
    fetchData(`${API_HOST}/roles`, false).then((data) => setRoles(data));
    fetchData(`${API_HOST}/users`, false).then((data) => {
      setUsers(data);
    });

    fetchData(`${API_HOST}/kanban/${kanbanId}`, false).then((data) => {
      setKanban(data.title);
    });
  }, []);

  function inviteMember() {
    //send email to server and get user name
    const [invitee] = users.filter((user) => {
      return user.email === email;
    });
    if (!invitee) {
      setAlert({ status: "warning", message: "The user is not existed" });
      setEmail("");
      return;
    }

    //check if member is existed
    const check = members.some((member) => {
      return member.uid === invitee.id;
    });

    if (check) {
      setAlert({ status: "warning", message: "The user is already existed" });
      setEmail("");
      return;
    }
    //     set members
    invitee.uid = invitee.id;
    invitee.role_id = 1;
    invitee.role_label = "editor";
    setMembers((prev) => {
      return [...prev, invitee];
    });
    setEmail("");
    setAlert({});
  }

  function onSaveMembers() {
    fetchPutData(`${API_HOST}/kanban/${kanbanId}/members`, {
      members,
    }).then((res) => {
      if (res.error) {
        window.alert("You cannot delete all the member in the kanban");
        fetchData(`${API_HOST}/kanban/${kanbanId}/tasks`, true).then(
          ({ user }) => {
            setMembers(user);
          }
        );
        return;
      } else {
        setOpenDialog(!openDialog);
      }
    });
  }

  // useEffect render get all role id,role name from server(new api)

  // Styles for the navbar icons
  const iconsStyle = ({
    palette: { dark, white, text },
    functions: { rgba },
  }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });
  const { kanbanId } = useParams();
  localStorage.setItem("kanbanId", kanbanId);

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) =>
        navbar(theme, { transparentNavbar, absolute, light, darkMode })
      }
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <Grid container lg={8}>
          <Grid item>
            <MDBox
              color="inherit"
              mb={{ xs: 1, md: 0 }}
              sx={(theme) => navbarRow(theme, { isMini })}
            >
              <MDTypography variant="h3">{kanban}</MDTypography>
            </MDBox>
          </Grid>
          <Grid item>
            <MDBox
              color="inherit"
              display={{ xs: "none", lg: "flex" }}
              m={0}
              p={0}
            >
              <DefaultNavbarLink
                icon="task_alt"
                name="KANBAN"
                route={`/project/${kanbanId}/kanban`}
                light={light}
              />
              <DefaultNavbarLink
                icon="groups"
                name="MEETING MINUTE"
                route={`/project/${kanbanId}/meeting-minute`}
                light={light}
              />
              <DefaultNavbarLink
                icon="assessment"
                name="REPORT"
                route={`/project/${kanbanId}/report`}
                light={light}
              />
            </MDBox>
          </Grid>
        </Grid>{" "}
        <MDBox sx={(theme) => navbarRow(theme, { isMini })}>
          <MDBox color={light ? "white" : "inherit"}>
            <IconButton
              size="small"
              disableRipple
              color="inherit"
              onClick={handleMiniSidenav}
            >
              <Icon sx={iconsStyle} fontSize="medium">
                {miniSidenav ? "menu_open" : "menu"}
              </Icon>
            </IconButton>
            <IconButton
              sx={navbarIconButton}
              size="large"
              disableRipple
              onClick={() => setOpenDialog(!openDialog)}
            >
              <Icon sx={iconsStyle}>group_add</Icon>
              <div
                style={{
                  fontSize: "17px",
                  color: "gray",
                  marginLeft: "2px",
                }}
              >
                Invite
              </div>
            </IconButton>
            <Dialog
              open={openDialog}
              onClose={() => setOpenDialog(!openDialog)}
              scroll={scroll}
              fullWidth
              maxWidth="xl"
              style={{ zIndex: 1700 }}
            >
              <DialogTitle>KANBAN Members</DialogTitle>
              <DialogContent dividers={scroll === "paper"}>
                <MDBox position="absolute" width="100%" minHeight="10vh">
                  <Stack sx={{ width: "50%" }} mt={-9.5} ml={73} spacing={2}>
                    {Object.keys(alert).length !== 0 ? (
                      <Alert severity={alert.status}>{alert.message}</Alert>
                    ) : (
                      <></>
                    )}
                  </Stack>
                </MDBox>

                {account.role_id > 1 ? (
                  <></>
                ) : (
                  <DialogContentText>
                    Check and invite member into this kanban
                  </DialogContentText>
                )}

                <Grid container direction="column">
                  {account.role_id > 1 ? (
                    <></>
                  ) : (
                    <Grid
                      container
                      alignItems="center"
                      direction="row"
                      wrap="nowrap"
                    >
                      <Grid item xs={11} mr="auto">
                        <TextField
                          autoFocus
                          margin="dense"
                          label="Email Address"
                          type="email"
                          fullWidth
                          variant="standard"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                      <Grid item>
                        <MDButton onClick={inviteMember}>Invite</MDButton>
                      </Grid>
                    </Grid>
                  )}

                  {members.map((member, index) => {
                    return (
                      <Grid item mt={3}>
                        <Grid
                          container
                          alignItems="center"
                          direction="row"
                          wrap="nowrap"
                          mb={2}
                        >
                          <Grid item mr={2}>
                            <Avatar>
                              {member.name ? member.name.charAt(0) : "N"}
                            </Avatar>
                          </Grid>
                          <Grid item mr="auto">
                            {member.name ? member.name : "user"}
                          </Grid>
                          <Grid item>
                            {account.role_id > 1 ? (
                              <MDButton>{member.role_label}</MDButton>
                            ) : (
                              <MDButton
                                onClick={() => {
                                  if (member.uid === account.id) {
                                    const answer = window.prompt(
                                      "Are you sure you want to modify your permission?(enter y to continued)"
                                    );
                                    if (answer === "y" || answer === "Y") {
                                      setOpenRoleModal(true);
                                      setSelectedValue(index);
                                    }
                                  } else {
                                    setOpenRoleModal(true);
                                    setSelectedValue(index);
                                  }
                                }}
                              >
                                {member.role_label}
                              </MDButton>
                            )}
                          </Grid>
                          {account.role_id > 1 ? (
                            <></>
                          ) : (
                            <Grid item>
                              <MDButton
                                onClick={() => {
                                  if (member.uid === account.id) {
                                    const answer = window.prompt(
                                      "Are you sure you want to remove yourself?(enter y)"
                                    );
                                    if (answer !== "y" && answer !== "Y")
                                      return;
                                  }
                                  let newMembers = JSON.parse(
                                    JSON.stringify(members)
                                  );
                                  newMembers = newMembers.filter(
                                    (newMember) => {
                                      return newMember.uid !== member.uid;
                                    }
                                  );
                                  setMembers(newMembers);
                                }}
                              >
                                Remove
                              </MDButton>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
              </DialogContent>
              <DialogActions>
                {account.role_id > 1 ? (
                  <Button onClick={() => setOpenDialog(false)}>Close</Button>
                ) : (
                  <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                )}

                {account.role_id > 1 ? (
                  <></>
                ) : (
                  <Button onClick={onSaveMembers}>Save</Button>
                )}
              </DialogActions>
            </Dialog>
            <Dialog
              onClose={() => setOpenRoleModal(false)}
              open={openRoleModal}
              style={{ zIndex: 1800 }}
              keepMounted
              PaperProps={{
                style: {
                  backgroundColor: "#E2EDE8",
                  padding: "10px 20px",
                },
              }}
              BackdropProps={{ invisible: true }}
            >
              <DialogTitle>Choose the role</DialogTitle>
              <List sx={{ pt: 0 }}>
                {roles.map((role) => (
                  <ListItem
                    button
                    key={role.id}
                    style={{ marginBottom: "20px" }}
                    onClick={() => {
                      setOpenRoleModal(false);
                      const index = selectedValue;
                      const newMembers = JSON.parse(JSON.stringify(members));
                      newMembers[index].role_label = role.label;
                      newMembers[index].role_id = role.id;
                      setMembers(newMembers);
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={role.label}
                      style={{ color: "grey" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Dialog>
            <IconButton
              size="medium"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              onClick={() => {
                window.location.href = "/index";
              }}
            >
              <Icon sx={iconsStyle}>home</Icon>
              <div
                style={{ fontSize: "17px", color: "gray", marginLeft: "2px" }}
              >
                Home
              </div>
            </IconButton>
            <IconButton
              size="medium"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              onClick={() => {
                window.localStorage.removeItem("access_token");
                window.location.href = "/authentication/sign-in";
              }}
            >
              <Icon sx={iconsStyle}>logout</Icon>
              <div
                style={{ fontSize: "17px", color: "gray", marginLeft: "2px" }}
              >
                Log Out
              </div>
            </IconButton>
            {renderMenu()}
          </MDBox>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Setting default values for the props of DashboardNavbar
DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
  isMini: false,
};

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
