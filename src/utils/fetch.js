async function fetchData(url, needUser) {
  const access_token = localStorage.getItem("access_token");
  let res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  });

  if (needUser) {
    const { user, data, tags } = await res.json();
    return { user, data, tags };
  } else {
    const { data } = await res.json();
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
  const access_token = localStorage.getItem("access_token");
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + access_token,
    },
    body: JSON.stringify({ data }),
  });

  return res.json();
}

export { fetchData, fetchSetData, fetchPutData };
