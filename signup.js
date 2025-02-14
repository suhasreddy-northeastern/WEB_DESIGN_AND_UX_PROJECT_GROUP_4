// Signup Page Functionality
if (document.getElementById("password")) {
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const errorMessage = document.getElementById("password-error");
  const passwordRequirements = document.getElementById("password-requirements");

  passwordInput?.addEventListener("focus", () => {
    passwordRequirements.style.display = "block";
  });

  passwordInput?.addEventListener("input", function () {
    const password = passwordInput.value;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.keys(checks).forEach((key) => {
      document.getElementById(key).className = checks[key]
        ? "valid"
        : "invalid";
    });

    checkPasswordMatch();
  });

  confirmPasswordInput?.addEventListener("input", checkPasswordMatch);

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

  window.togglePasswordVisibility = function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    confirmPasswordInput.setAttribute("type", type);
  };

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

// Login Page Functionality
if (document.getElementById("loginForm")) {
  document
    .getElementById("loginForm")
    .addEventListener("submit", function (event) {
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
