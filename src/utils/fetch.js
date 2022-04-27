async function fetchData(url) {
  let res = await fetch(url);

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
