async function fetchData(url, params) {
  let res;
  if (!params) {
    res = await fetch(url);
  } else {
    res = await fetch(url, "/", params);
  }
  const { data } = await res.json();

  return data;
}

async function fetchSetData(url, data) {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

export { fetchData, fetchSetData };
