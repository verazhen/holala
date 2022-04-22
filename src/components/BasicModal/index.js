import React from "react";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useEffect, useState, useRef } from "react";

const styles = {
  fontFamily: "sans-serif",
  textAlign: "center",
  top: "30%",
};

function BasicModal({ open, setOpen, onCloseModal, taskName }) {
  return (
    <div style={styles}>
      <Modal open={open} onClose={onCloseModal}>
        <h2>{taskName}</h2>
        <form>
          {/*           <div class="input-group input-group-outline my-3"> */}
          {/*             <label class="form-label">Email address</label> */}
          {/*             <input type="email" class="form-control" /> */}
          {/*           </div> */}
          <div class="input-group input-group-static mb-4">
            <label for="exampleFormControlSelect1" class="ms-0">
              Assignee
            </label>
            <select class="form-control" id="exampleFormControlSelect1">
              <option>Vera</option>
              <option>Shane</option>
              <option>Rita</option>
              <option>雅筑</option>
              <option>清華</option>
            </select>
          </div>
          <div class="input-group input-group-static my-3">
            <label>Due</label>
            <input type="datetime-local" class="form-control" />
          </div>
          <div class="input-group input-group-dynamic">
          <label>Comment</label>
          <br/>
            <textarea
              class="form-control"
              rows="5"
              placeholder="Leave a comment..."
              spellcheck="false"
            ></textarea>
          </div>
          <button type="submit">Save</button>
        </form>
      </Modal>
    </div>
  );
}

export default BasicModal;
