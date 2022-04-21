import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/KanbanList";
import projectsTableData from "layouts/report/data/projectsTableData";
import { fetchData, fetchSetData } from "utils/fetch";
//post data
// async function fetchSetData(listName, tasks, listId) {
//   await fetch(`http://localhost:5000/api/1.0/task?list=${listId}`, {
//     method: "POST",
//     headers: {
//       "Content-type": "application/json",
//     },
//     body: JSON.stringify({ listId, listName, tasks }),
//   });
// }
//
// async function fetchDelData(listName, tasks, listId, uniqueId) {
//   await fetch(
//     `http://localhost:5000/api/1.0/task?list=${listId}&uniqueId=${uniqueId}`,
//     {
//       method: "delete",
//       headers: {
//         "Content-type": "application/json",
//       },
//       body: JSON.stringify({ listId, listName, tasks }),
//     }
//   );
// }
//
const List = ({ tasks }) => {
  const [cards, setCards] = useState(tasks);

  const { columns: pColumns, rows: pRows } = projectsTableData(cards);
  //   const submittingStatus = useRef(false);
  //   const delStatus = useRef(false);

  //   //post data
  //   useEffect(() => {
  //     //     預防data在網頁 第一次render時被清掉
  //     if (!submittingStatus.current) {
  //       return;
  //     }
  //
  //     fetchSetData(listName, cards, listId).then(
  //       (lists) => (submittingStatus.current = false)
  //     );
  //   }, [cards]);

  //delete data
  //   useEffect(() => {
  //     //     預防data在網頁 第一次render時被清掉
  //     if (!delStatus.current) {
  //       return;
  //     }
  //     fetchDelData(listName, cards, listId, delStatus.current).then(
  //       (lists) => (delStatus.current = false)
  //     );
  //   }, [cards]);
  function addTask() {
//     submittingStatus.current = true;
    const title = "Task Untitled";
    setCards(function (prevData) {
      return [
        ...prevData,
        {
          title,
        },
      ];
    });
  }
  return (
    <div>
      <MDButton
        //               component={Link}
        //               to={action.route}
        variant="primary"
        color="secondary"
        fullWidth
        onClick={addTask}
        //               color={action.color}
      >
        Add Task
      </MDButton>
      <DataTable
        table={{ columns: pColumns, rows: pRows }}
        isSorted={false}
        entriesPerPage={false}
        showTotalEntries={false}
        noEndBorder
      />
    </div>
  );
};

export default List;
