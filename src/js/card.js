var cards = document.querySelectorAll(".card");

var modal = document.getElementById("workoutModal");
var modalImg = document.getElementById("workoutImage");
var modalName = document.getElementById("workoutName");
var modalDetails = document.getElementById("workoutDetails");
var workoutCardArea = document.getElementById("workout-cards");

function clearCards() {
  while (workoutCardArea.hasChildNodes()) {
    workoutCardArea.removeChild(workoutCardArea.lastChild);
  }
}

function createCard(data) {
  var colDiv = document.createElement("div");
  colDiv.className = "col-md-3 mb-3 mt-3";

  var cardWrapper = document.createElement("div");
  cardWrapper.className = "card";

  var cardImg = document.createElement("img");
  cardImg.className = "card-img-top";
  cardImg.style.height = "250px";
  cardImg.style.objectFit = "cover";
  cardImg.src = data.image;
  cardWrapper.appendChild(cardImg);

  var cardBody = document.createElement("div");
  cardBody.className = "card-body";

  var cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.textContent = data.name;
  cardBody.appendChild(cardTitle);

  var cardText = document.createElement("p");
  cardText.className = "card-text text-muted";
  cardText.style.textAlign = "justify";
  cardText.textContent = data.detail;
  cardBody.appendChild(cardText);

  cardWrapper.appendChild(cardBody);
  colDiv.appendChild(cardWrapper);

  // Add the event listener to the card
  colDiv.addEventListener("click", function () {
    modalImg.src = cardImg.src;
    modalName.textContent = cardTitle.textContent;
    modalDetails.textContent = cardText.textContent;

    var link = document.createElement("a");
    link.textContent = "View More";
    link.href = "workout.html?name=" + encodeURIComponent(data.name) + "&detail=" + encodeURIComponent(data.detail) + "&image=" + encodeURIComponent(data.image);
    modalDetails.appendChild(link);

    var bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
  });

  workoutCardArea.appendChild(colDiv);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

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
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("workouts").then(function (data) {
    if (!networkDataReceived) {
      console.log("From cache", data);
      updateUI(data);
    }
  });
}
