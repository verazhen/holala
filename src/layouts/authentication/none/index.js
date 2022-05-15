import { useState, useEffect } from "react";
import { fetchData, fetchSetData, fetchPutData } from "utils/fetch";
import { API_HOST } from "utils/constants";

function None() {
  useEffect(() => {
    fetchData(`${API_HOST}/kanbans`, false).then((data) => {
      if (data) {
        window.location.href = "/index";
      }
    });
  }, []);

  return <></>;
}
export default None;
