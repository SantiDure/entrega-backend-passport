const form = document.querySelector("form");
const productList = document.querySelector(".listaProductos");

const socket = io();
getProducts();

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.querySelector("#title").value;
  const description = document.querySelector("#description").value;
  const code = document.querySelector("#code").value;
  const price = document.querySelector("#price").value;
  const stock = document.querySelector("#stock").value;
  const category = document.querySelector("#category").value;
  const thumbnail = document.querySelector("#thumbnail").value;

  // Validations
  if (
    !title ||
    !description ||
    !code ||
    !price ||
    !stock ||
    !category ||
    !thumbnail
  ) {
    Swal.fire({
      title: "Error!",
      text: "Todos los campos son obligatorios",
      icon: "error",
      confirmButtonText: "Ok",
    });
    return;
  }

  socket.emit("addProduct", {
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnail,
  });
  form.reset();
});

socket.on("getProducts", async () => {
  const listaProductos = document.querySelector(".listaProductos");
  const response = await fetch("/api/products");
  const products = await response.json();

  listaProductos.innerHTML = "";

  if (products[0]) {
    products.map((product) => {
      let divProduct = document.createElement("div");
      divProduct.innerHTML = `         
                   <div class="card" style="width: 18rem;">
                     <div class="card-body">
                       <h5 class="card-title">${product.title}</h5>
                       <h6 class="card-subtitle mb-2 text-body-secondary">Descripcion: ${product.description}</h6>
                       <p class="card-text">Stock disponible: ${product.stock}</p>
                      
                      <div class="btn__delete__container"></div>
                     </div>
                   </div>`;
      listaProductos.appendChild(divProduct);
      let deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar producto";
      deleteButton.classList.add("btn", "btn-danger");
      deleteButton.addEventListener("click", () => {
        const productID = product.id;
        socket.emit("deleteProduct", productID);
      });
      listaProductos.appendChild(deleteButton);
    });
  } else {
    listaProductos.innerHTML = `
  <div>NO HAY PRODUCTOS</div>`;
  }
});
