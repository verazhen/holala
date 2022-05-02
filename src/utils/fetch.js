async function fetchData(url, needUser) {
  const access_token = localStorage.getItem("access_token");
  let res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-type": "application/json",
      Authorization: "Bearer " + access_token,
    },
  });

  const response = await res.json();
  if (response.status_code === 403) {
    window.location.href = "/authentication/sign-in";
    return;
  }

  if (needUser) {
    const { user, data, tags, account } = response;
    return { user, data, tags, account };
  } else {
    const { data } = await response;
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
