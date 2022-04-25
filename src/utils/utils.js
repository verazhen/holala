function addLocalStorage(key, value) {
  localStorage.setItem(key, value);
}

function getLocalStorage(key) {
  const value = localStorage.getItem(key);
  return value;
}

export {  addLocalStorage, getLocalStorage};
