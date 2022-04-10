import { useState } from "react";
import { v4 } from "uuid";

const Add = ({ add, submittingStatus }) => {
//   const [note, setNote] = useState("");
//   function noteChange(e) {
//     setNote(e.target.value);
//   }


  function addItem() {
    submittingStatus.current = true
    add(function (prevData) {
      return [
        {
          id: v4(),
//           note,
//           date,
//           time,
        },
        ...prevData,
      ];
    });
  }

  return (
    <div>
{/*       <p>記事：</p> */}
{/*       <input type="text" value={note} onChange={noteChange} /> */}
{/*       <p>日期：</p> */}
{/*       <input type="date" value={date} onChange={dateChange} /> */}
{/*       <p>時間：</p> */}
{/*       <input type="time" value={time} onChange={timeChange} /> */}
      <button onClick={addItem} className="add">
        Add Task
      </button>
    </div>
  );
};

export default Add;