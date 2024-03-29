const formRegister = document.querySelector(".signupform");

formRegister?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },

    body: new URLSearchParams(new FormData(formRegister)),
  });

  if (response.status == 201) {
    const { payload: usuario } = await response.json();
    alert(JSON.stringify(usuario));
    window.location.href = "/login";
  } else {
    const error = await response.json();
    alert(error.message);
  }
});
