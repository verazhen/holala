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

  if (response.status_code === 4030 || response.status_code === 401) {
    window.location.href = "/authentication/sign-in";
    return;
  }

  if (response.status_code === 4031) {
    window.location.href = "/index";
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

  const response = await res.json();
  console.log(response);

  return response;
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

  const response = await res.json();
  console.log(response);

  if (response.status_code === 4030 || response.status_code === 401) {
    window.location.href = "/authentication/sign-in";
    return;
  }

  return response;
}

export { fetchData, fetchSetData, fetchPutData };
