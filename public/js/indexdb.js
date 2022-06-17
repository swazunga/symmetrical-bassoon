let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
  let result = e.target.result;
  result.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) {
    addToDatabase();
  }
};

request.onerror = (e) => {
  console.log(e.target.error);
};

function addToDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAllTransactions = store.getAll();
  getAllTransactions.onsuccess = function () {
    if (getAllTransactions.result.length > 0) {
      fetch("api/transaction/bulk", {
        method: "post",
        body: JSON.stringify(getAllTransactions.results),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

function saveRecord(data) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(data);
}

window.addEventListener("online", addToDatabase);
