async function fetchData(url, needUser) {
  const access_token = localStorage.getItem("access_token");
  let res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  });

  const { user, data } = await res.json();

  if (needUser) {
    return { user, data };
  } else {
    return data;
  }
}

async function fetchSetData(url, data) {
  const access_token = localStorage.getItem("access_token");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify({ data }),
  });

  return res.json();
}

async function fetchPutData(url, data) {
  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

export { fetchData, fetchSetData, fetchPutData };
