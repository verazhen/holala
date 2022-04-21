// @mui material components
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Images
import logoXD from "assets/images/small-logos/logo-xd.svg";
import logoAtlassian from "assets/images/small-logos/logo-atlassian.svg";
import logoSlack from "assets/images/small-logos/logo-slack.svg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import logoJira from "assets/images/small-logos/logo-jira.svg";
import logoInvesion from "assets/images/small-logos/logo-invision.svg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data(kanbans) {
  const avatars = (members) =>
    members.map(([image, name]) => (
      <Tooltip key={name} title={name} placeholder="bottom">
        <MDAvatar
          src={image}
          alt="name"
          size="xs"
          sx={{
            border: ({ borders: { borderWidth }, palette: { white } }) =>
              `${borderWidth[2]} solid ${white.main}`,
            cursor: "pointer",
            position: "relative",

            "&:not(:first-of-type)": {
              ml: -1.25,
            },

            "&:hover, &:focus": {
              zIndex: "10",
            },
          }}
        />
      </Tooltip>
    ));

  const Kanban = ({ name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  if (!kanbans) {
    return {
      columns: [
        { Header: "kanbans", accessor: "kanban", width: "45%", align: "left" },
      ],
      rows: [
        {
          kanban: <Kanban name="Material UI XD Version" />,
        },
      ],
    };
  }


  return {
    columns: [
      { Header: "kanbans", accessor: "kanban", width: "45%", align: "left" },
      //       { Header: "members", accessor: "members", width: "10%", align: "left" },
    ],

    //     rows: [
    //       {
    //         kanbans: <Kanban image={logoXD} name="Material UI XD Version" />,
    //         members: (
    //           <MDBox display="flex" py={1}>
    //             {avatars([
    //               [team1, "Ryan Tompson"],
    //               [team2, "Romina Hadid"],
    //               [team3, "Alexander Smith"],
    //               [team4, "Jessica Doe"],
    //             ])}
    //           </MDBox>
    //         ),
    //       },
    //     ],

    rows: kanbans.map(({ title }) => {
      const kanban = <Kanban name={title} />;
      return { kanban };
    }),
  };
}
