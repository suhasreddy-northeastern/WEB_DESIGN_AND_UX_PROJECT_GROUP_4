document.addEventListener("DOMContentLoaded", function () {
  /* --------------------- Signup Functionality --------------------- */
  if (document.getElementById("confirm-password")) {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const errorMessage = document.getElementById("password-error");
    const passwordRequirements = document.getElementById(
      "password-requirements"
    );

    passwordInput.addEventListener("focus", () => {
      passwordRequirements.style.display = "block";
    });

    passwordInput.addEventListener("input", function () {
      const password = passwordInput.value;
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      Object.keys(checks).forEach((key) => {
        const requirementEl = document.getElementById(key);
        if (requirementEl) {
          requirementEl.className = checks[key] ? "valid" : "invalid";
        }
      });

      checkPasswordMatch();
    });

    confirmPasswordInput.addEventListener("input", checkPasswordMatch);

    function checkPasswordMatch() {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (confirmPassword && password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        errorMessage.style.display = "block";
      } else {
        errorMessage.style.display = "none";
      }
    }

    // Expose togglePasswordVisibility so it can be called from the HTML button
    window.togglePasswordVisibility = function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      confirmPasswordInput.setAttribute("type", type);
    };

    // Expose validatePasswords for form submission
    window.validatePasswords = function () {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      if (!Object.values(checks).every(Boolean)) {
        errorMessage.textContent = "Password does not meet all requirements.";
        errorMessage.style.display = "block";
        return false;
      }

      if (password !== confirmPassword) {
        errorMessage.textContent = "Passwords do not match!";
        errorMessage.style.display = "block";
        return false;
      }

      return true;
    };
  }

  /* --------------------- Login Functionality --------------------- */
  if (document.getElementById("loginForm")) {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const emailError = document.getElementById("emailError");
      const passwordError = document.getElementById("passwordError");

      // Clear previous errors
      emailError.textContent = "";
      passwordError.textContent = "";

      // Validate inputs
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const passwordValid = password.length >= 8;

      // Display individual errors if any
      if (!emailValid) {
        emailError.textContent = "Please enter a valid email address.";
      }
      if (!passwordValid) {
        passwordError.textContent = "Password must be at least 8 characters.";
      }

      // Redirect if valid
      if (emailValid && passwordValid) {
        window.location.href = "index.html";
      }
    });
  }

  /* --------------------- Sidebar Toggle Functionality --------------------- */
  // Sidebar Toggle
  const sideBar = document.getElementById("sidebar");
  const menuBtn = document.querySelector(".menu-btn");
  const closeBtn = document.querySelector(".close-btn");

  // Ensure elements exist before adding event listeners
  if (menuBtn && sideBar && closeBtn) {
    menuBtn.addEventListener("click", () => {
      sideBar.style.left = "0"; // Open sidebar
    });

    closeBtn.addEventListener("click", () => {
      sideBar.style.left = "-100%"; // Close sidebar
    });
  }

  /* --------------------- Mandatory Fields --------------------- */
  // Adds a red asterisk to all labels for input fields with the 'required' attribute
  document.querySelectorAll("input[required]").forEach((input) => {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label && !label.innerHTML.includes("*")) {
      label.innerHTML += ' <span style="color:red">*</span>';
    }
  });
});

/* --------------------- Accordion Toggle Function --------------------- */
window.toggleAccordion = function (collapseId) {
  const collapseElement = new bootstrap.Collapse(`#${collapseId}`, {
    toggle: true, // Toggles the collapse state (open/close)
  });
};
