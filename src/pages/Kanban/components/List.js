import { useState, useEffect, useRef } from "react";
import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Add from "./AddTask";
import Card from "./Card";

//get data
// async function fetchData(setData) {
//   const res = await fetch("http://localhost:5000/api/1.0/task");
//   const { data } = await res.json();
//   setData(data);
// }

//post data
async function fetchSetData(listName, tasks, listId) {
//   console.log("fetch task");
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

  //第一次render, get data
  //     useEffect(() => {
  //       fetchData(setCards);
  //     }, []);

  return (
    <div className="list-board">
      <div className="list-header">
        <h3>{listName}</h3>
      </div>
      <Add add={setCards} submittingStatus={submittingStatus} />
      <Card
        listData={cards}
        //         editData={setCards}
        //         deleteData={setCards}
        //         submittingStatus={submittingStatus}
      />

    </div>
  );
};

export default List;
