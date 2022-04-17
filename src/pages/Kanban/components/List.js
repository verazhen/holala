import { useState, useEffect, useRef } from "react";
import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";

import Add from "./AddTask";
import Card from "./Card";

//post data
async function fetchSetData(listName, tasks, listId) {
  console.log("fetchSetData in list");
  await fetch(`http://localhost:5000/api/1.0/task?list=${listId}`, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ listId, listName, tasks }),
  });
}

const List = ({ listId, listName, tasks }) => {
  const [cards, setCards] = useState(tasks);
  const submittingStatus = useRef(false);
//   console.log('counter')
//   console.log(listId, listName, tasks)

  //post data
  useEffect(() => {
    //     預防data在網頁 第一次render時被清掉
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(listName, cards, listId).then(
      (lists) => (submittingStatus.current = false)
    );
  }, [cards]);

  return (
    <div className="list-board">
      <div className="list-header">
        <h3>{listName}</h3>
      </div>
      <Add add={setCards} submittingStatus={submittingStatus} />
      <Card cards={cards} setCards={setCards} />
    </div>
  );
};

export default List;
