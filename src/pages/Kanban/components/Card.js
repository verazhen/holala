import Item from "./Item";

const Card = ({ listData, editData,deleteData, submittingStatus }) => {
  return (
    <div className="list">
      {listData.map((item) => {
        const { /* note, date, time,  */id } = item;
        return (
          <Item
            key={id}
            id={id}
//             note={note}
//             date={date}
//             time={time}
            editData={editData}
            deleteData={deleteData}
            submittingStatus={submittingStatus}
          />
        );
      })}
    </div>
  );
};

export default Card;