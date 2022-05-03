import { useState } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import KanbanMenu from "examples/Tables/KanbanMenu";

// Data
import data from "layouts/authentication/components/Projects/data";
import { useEffect } from "react";
import { fetchData, fetchSetData } from "utils/fetch";
import { API_HOST } from "utils/constants";

function Projects() {
  const [kanbans, setKanbans] = useState([]);
  // const columns, rows ;
  useEffect(() => {
    fetchData(`${API_HOST}/kanbans`).then((kanbans) => {
      setKanbans(kanbans);
    });
  }, []);

  const style = {
    borderBottom: "1px dashed lightgrey",
  };

  const { columns, rows } = data(kanbans);
  const [menu, setMenu] = useState(null);

  const openMenu = ({ currentTarget }) => setMenu(currentTarget);
  const closeMenu = () => setMenu(null);

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
      <MenuItem onClick={closeMenu}>add a kanban</MenuItem>
      <MenuItem onClick={closeMenu}>edit a kanban</MenuItem>
      <MenuItem onClick={closeMenu}>delete a kanban</MenuItem>
    </Menu>
  );

  return (
    <Card>
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={3}
      >
        <MDBox>
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
        </MDBox>
        <MDBox color="text" px={2}>
          <Icon
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            fontSize="small"
            onClick={openMenu}
          >
            more_vert
          </Icon>
        </MDBox>
        {renderMenu}
      </MDBox>
      <MDBox>
        {kanbans.map(({ kanban_id, title }) => (
          <Grid container>
            <Grid item xs={12} m={3} style={style}>
              <MDTypography variant="h5">
                <Link to={`/project/${kanban_id}/kanban`}>{title}</Link>
              </MDTypography>
            </Grid>
          </Grid>
        ))}
      </MDBox>
    </Card>
  );
}

export default Projects;
