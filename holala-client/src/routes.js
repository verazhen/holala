// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/report";
import Meeting from "layouts/meeting";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Index from "layouts/authentication/index";
import None from "layouts/authentication/none";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "None",
    key: "none",
    icon: <Icon fontSize="small">index</Icon>,
    route: "/",
    component: <None />,
  },
  {
    type: "collapse",
    name: "Index",
    key: "index",
    icon: <Icon fontSize="small">index</Icon>,
    route: "/index",
    component: <Index />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },

  {
    type: "collapse",
    name: "Kanban",
    key: "kanban",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: `/project/:kanbanId/kanban`,
    component: <Tables />,
  },
  {
    type: "collapse",
    name: "Report",
    key: "report",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/project/:kanbanId/report",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "MeetingMinute",
    key: "meetingMinute",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/project/:kanbanId/meeting-minute",
    component: <Meeting />,
  },
];

export default routes;
