import { useState, useEffect, useRef } from "react";
import { API_GET_DATA } from "../../../global/constants";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import Add from "./AddTask";
import Card from "./Card";

//get data
async function fetchData(setData) {
  const res = await fetch(API_GET_DATA);
  const { data } = await res.json();
  setData(data);
}

//post data
async function fetchSetData(data) {
  await fetch(API_GET_DATA, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

const List = ({listName}) => {
  const [data, setData] = useState([]);
  const submittingStatus = useRef(false);

  //post data
  useEffect(() => {
    //預防data在網頁 第一次render時被清掉
    if (!submittingStatus.current) {
      return;
    }
    fetchSetData(data).then((data) => (submittingStatus.current = false));
  }, [data]);

  //第一次render, get data
  useEffect(() => {
    fetchData(setData);
  }, []);

  return (

    <div className = "list-board">
      <div className="list-header">
        <h3>{listName}</h3>
      </div>
      <Add add={setData} submittingStatus={submittingStatus} />
      <Card
        listData={data}
        editData={setData}
        deleteData={setData}
        submittingStatus={submittingStatus}/>
    </div>
  );
};

export default List;
