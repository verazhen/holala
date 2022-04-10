import Item from "./Item";

const Card = ({ listData, editData, deleteData, submittingStatus }) => {
  return (
    <div className="list">
      {listData.map((item) => {
        const { taskName,id } = item;
        return (
          <Item
            key={id}
            id={id}
            taskName={taskName}
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
