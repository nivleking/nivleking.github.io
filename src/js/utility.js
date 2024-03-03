var dbPromise = idb.open("workouts-store", 1, function (db) {
  if (!db.objectStoreNames.contains("workouts")) {
    console.log("Creating object store");
    db.createObjectStore("workouts", { keyPath: "id" });
  }
});

function writeData(st, data) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(st, "readwrite");
    console.log("tx", tx);
    var store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
  });
}

function readAllData(st) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(st, "readonly");
    var store = tx.objectStore(st);
    return store.getAll();
  });
}

function clearAllData(st) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.clear();
    return tx.complete;
  });
}

function deleteItemFromData(st, id) {
  dbPromise
    .then(function (db) {
      var tx = db.transaction(st, "readwrite");
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(function () {
      console.log("Item deleted!");
    });
}
