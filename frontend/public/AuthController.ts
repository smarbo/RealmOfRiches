const swapForm = document.getElementById("swapForm") as HTMLHeadingElement;
const formTitle = document.getElementById("authTitle") as HTMLHeadingElement;
const username = document.getElementById("username") as HTMLInputElement;
const email = document.getElementById("email") as HTMLInputElement;
const password = document.getElementById("password") as HTMLInputElement;
const form = document.getElementById("auth") as HTMLFormElement;
let signup = true;

function validateEmail(email: string) {
  const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return pattern.test(email);
}

//@ts-ignore
const createError = (msg: string) => {
  const errorDiv = document.createElement("div");
  errorDiv.classList.add("errorDiv");
  errorDiv.innerHTML = `
      <h1>${msg}</h1>`;
  const btn = document.createElement("button");

  btn.innerHTML = `<i class="fa-solid fa-xmark"></i>`;
  btn.onclick = () => {
    document.body.removeChild<HTMLDivElement>(errorDiv);
  };
  errorDiv.append(btn);
  document.body.append(errorDiv);
};

swapForm.onclick = () => {
  signup = !signup;
  if (signup) {
    username.placeholder = "Username";
    email.style.display = "inline";
    formTitle.innerText = "SIGN UP";
    swapForm.innerText = "Already have an account?";
  } else {
    username.placeholder = "Username/Email";
    email.style.display = "none";
    formTitle.innerText = "LOG IN";
    swapForm.innerText = "Don't have an account yet?";
  }
};

form.onsubmit = async (e) => {
  username.style.background = "goldenrod";
  email.style.background = "goldenrod";
  password.style.background = "goldenrod";
  e.preventDefault();
  if (signup) {
    let issues: HTMLInputElement[] = [];
    if (username.value.trim().length == 0) {
      issues.push(username);
    }
    if (email.value.trim().length == 0 || !validateEmail(email.value)) {
      issues.push(email);
    }
    if (password.value.trim().length == 0) {
      issues.push(password);
    }

    if (issues.length >= 1) {
      issues.forEach((i) => {
        i.style.background = "rgba(250,0,0,0.3)";
      });
    }

    if (issues.length === 0) {
      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value,
          }),
        });
        const r = await res.json();
        if (res.status === 200) {
          localStorage.setItem("email", r.email);
          localStorage.setItem("username", r.username);
          localStorage.setItem("balance", r.balance);
          localStorage.setItem("dropEligible", r.dropEligible);
          localStorage.setItem("dropStreak", r.dropStreak);
          localStorage.setItem("inventory", JSON.stringify(r.inventory));
          localStorage.setItem("password", password.value);
          window.location.href = "/";
        } else if (res.status === 409) {
          createError("User already exists.");
        }
      } catch (err) {
        console.log(err);
      }
    }
  } else {
    let issues: HTMLInputElement[] = [];
    if (username.value.trim().length == 0) {
      issues.push(username);
    }
    if (password.value.trim().length == 0) {
      issues.push(password);
    }

    if (issues.length >= 1) {
      issues.forEach((i) => {
        i.style.background = "rgba(250,0,0,0.3)";
      });
    }

    if (issues.length === 0) {
      let email = false;
      let body = {};
      console.log("Form valid! Log in.");
      if (validateEmail(username.value)) email = true;

      if (email) {
        body = { email: username.value, password: password.value };
      } else {
        body = { username: username.value, password: password.value };
      }

      try {
        const res = await fetch("/api/user", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (res.status === 404) {
          createError("User could not be found.");
        }
        const r = await res.json();
        if (r.authenticated) {
          localStorage.setItem("email", r.email);
          localStorage.setItem("username", r.username);
          localStorage.setItem("balance", r.balance);
          localStorage.setItem("dropEligible", r.dropEligible);
          localStorage.setItem("dropStreak", r.dropStreak);
          localStorage.setItem("inventory", JSON.stringify(r.inventory));
          localStorage.setItem("password", password.value);
          window.location.href = "/";
        } else if (r.authenticated === false) {
          createError("Incorrect credentials.");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
};
