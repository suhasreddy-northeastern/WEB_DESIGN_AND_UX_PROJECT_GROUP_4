let sideBar = document.getElementById("sidebar");
let menuBtn = document.querySelector(".menu-btn");
let closeBtn = document.querySelector(".closeBtn");

menuBtn.addEventListener("click", () => {
  sideBar.style.left = "0";
});

closeBtn.addEventListener("click", () => {
  sideBar.style.left = "-100%";
});

let tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl);
});
