"use strict";

const image = document.querySelector(".item__img");
const title = document.querySelector("#title");
const price = document.querySelector("#price");
const description = document.querySelector("#description");
const colorSelectElement = document.querySelector("#colors");
const quantitySelectElement = document.querySelector("#quantity");
const addToCartButton = document.querySelector("#addToCart");
const itemContentElement = document.querySelector(".item__content__addButton");

const params = new URL(document.location).searchParams;
const id = params.get("id");

// Récupére les infos du local storage
/**
 * @param key {string}
 * @returns {any}
 */
function getFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

// Envoie des données vers le local storage
/**
 * @param key {string}
 * @param item {any}
 * @returns {any}
 */
function saveToLocalStorage(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
}

// Affiche le produit ainsi que ses informations sur la page
function displayProduct(product) {
  image.innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`;
  title.innerHTML = `<h1>${product.name}</h1>`;
  price.innerHTML = `<p>${product.price}</p>`;
  description.innerHTML = `<p>${product.description}</p>`;
  product.colors.forEach((color) => (colorSelectElement.innerHTML += `<option value="${color}">${color}</option>`));
}

// Définition des règles css pour la fenêtre pop-up
function defineCss(color) {
  const popUpElement = document.getElementById("popUpElement");
  popUpElement.style.background = color;
  popUpElement.style.textAlign = "center";
  popUpElement.style.marginTop = "20px";
  popUpElement.style.fontWeight = "bold";
  popUpElement.style.borderRadius = "15px";
}

// Affichage de la fenêtre pop-up de confirmation d'ajout au panier
function displayConfirmationPopUp() {
  if (!document.getElementById("popUpElement")) {
    itemContentElement.insertAdjacentHTML("afterend",
      `<div id="popUpElement"><p>Le produit ${title.textContent} à bien été ajouté au panier</p></div>`
    );
    defineCss("#2d3e50")
    setTimeout(closePopUp, 2000);
  } 
}

// Affichage de la fenêtre pop-up indiquant une erreur de saisie
function displayErrorPopUp() {
  if (!document.getElementById("popUpElement")) {
    itemContentElement.insertAdjacentHTML("afterend",
      `<div id="popUpElement"><p>Veuillez séléctionner une couleur et un nombre inférieur ou égal à 100</p></div>`
    );
    defineCss("red");
    setTimeout(closePopUp, 2000);
  }
}

// Fermeture de la fenêtre pop-up
function closePopUp() {
  popUpElement.remove();
}

// Ecouteur d'événement sur le bouton "commander !"
addToCartButton.addEventListener("click", onClickAddToCart);

// Regex utilisée afin d'éviter les caractères type "e" ou "-" et "+" dans les inputs Qté
const regQty = new RegExp("^([1-9][0-9]?|100)$");

// Vérifie si les données saisies sont correctes puis ajoute un article au panier ou le met à jour
function onClickAddToCart() {
  if (
    colorSelectElement.value &&
    quantitySelectElement.value > 0 &&
    quantitySelectElement.value < 100 &&
    Number.isInteger(Number(quantitySelectElement.value)) &&
    regQty.test(quantitySelectElement.value)
  ) {
    saveProduct();
    displayConfirmationPopUp();
  }
  else {
    displayErrorPopUp();
  }
}

// Sauvegarde du produit dans le local storage, mise à jour de la quantité et création d'un tableau vide si il n'est pas éxistant
function saveProduct() {
  let cart = getFromLocalStorage("cart");

  if (!cart) {
    cart = [];
  }

  // Si le même produit/couleur est déjà dans le panier, on mets à jour la quantité
  let productAlreadyInCart = cart.find((item) => item.id === id && item.color === colorSelectElement.value);
  if (productAlreadyInCart) {
      let newQuantity = Number(quantitySelectElement.value) + Number(productAlreadyInCart.quantity);
      productAlreadyInCart.quantity = newQuantity.toString();
  }
  else {
    cart.push({
      id,
      color: colorSelectElement.value,
      quantity: quantitySelectElement.value,
    });
  }
  saveToLocalStorage("cart", cart);
}

// Récupération des données de l'API
fetch(`http://localhost:3000/api/products/${id}`)
  .then((response) => response.json())
  .then((product) => {
    displayProduct(product);
  })
  .catch((err) => console.error(err));