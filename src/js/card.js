var cards = document.querySelectorAll(".card");

var modal = document.getElementById("workoutModal");
var modalImg = document.getElementById("workoutImage");
var modalName = document.getElementById("workoutName");
var modalDetails = document.getElementById("workoutDetails");
var workoutCardArea = document.getElementById("workout-cards");

function createCard(data) {
  var colDiv = document.createElement("div");
  colDiv.className = "col-md-3 mb-3 mt-3 col-sm-4";

  var cardWrapper = document.createElement("div");
  cardWrapper.className = "card card-hover";

  var cardImg = document.createElement("img");
  cardImg.className = "card-img-top";
  cardImg.style.height = "250px";
  cardImg.style.objectFit = "cover";
  cardImg.src = data.image;
  cardWrapper.appendChild(cardImg);

  var cardBody = document.createElement("div");
  cardBody.className = "card-body";

  var cardTitle = document.createElement("h6");
  cardTitle.className = "card-title text-center";
  cardTitle.textContent = data.name;
  cardBody.appendChild(cardTitle);

  cardWrapper.appendChild(cardBody);
  colDiv.appendChild(cardWrapper);

  colDiv.addEventListener("click", function () {
    cardClicked(data.id);
  });

  if (window.location.pathname === "/workout.html") return;
  workoutCardArea.appendChild(colDiv);
}

function clearCards() {
  if (window.location.pathname === "/workout.html") return;
  while (workoutCardArea.hasChildNodes()) {
    workoutCardArea.removeChild(workoutCardArea.lastChild);
  }
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

// From network
var url = "https://zxcvbn-ba039-default-rtdb.asia-southeast1.firebasedatabase.app/workouts.json";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log("From web", data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    // console.log(dataArray);
    updateUI(dataArray);
  });

function cardClicked(id) {
  var url = "https://zxcvbn-ba039-default-rtdb.asia-southeast1.firebasedatabase.app/workouts/" + id + ".json";

  // Session
  if (!sessionStorage.getItem(id)) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        sessionStorage.setItem(id, JSON.stringify(data));
        sessionStorage.setItem("now", JSON.stringify(data));
        window.location.href = "/workout.html";
      })
      .catch((err) => {
        window.location.href = "./offline.html";
      });
  } else {
    sessionStorage.setItem("now", sessionStorage.getItem(id));
    window.location.href = "/workout.html";
  }
}
