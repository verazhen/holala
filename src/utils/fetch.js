async function fetchData(url) {
  const res = await fetch(url);
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
