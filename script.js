let sideBar = document.getElementById("sidebar");
let menuBtn = document.querySelector(".menu-btn");
let closeBtn = document.querySelector(".close-btn");

menuBtn.addEventListener("click", () => {
  sideBar.style.left = "0";
});

closeBtn.addEventListener("click", () => {
  sideBar.style.left = "-100%";
});
      // Function to toggle accordion items dynamically
      function toggleAccordion(collapseId) {
        const collapseElement = new bootstrap.Collapse(`#${collapseId}`, {
          toggle: true, // Toggles the collapse state (open/close)
        });
      }