
// -------------------- GLOBAL CART --------------------
let cart = JSON.parse(localStorage.getItem('cart')) || [];
window.productsData = [];

// -------------------- CART FUNCTIONS --------------------
window.addToCart = function (id) {
  const product = window.productsData.find(p => p.id === id);
  if (!product) {
    alert('Product not found!');
    return;
  }

  const existing = cart.find(p => p.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...product, qty: 1 });

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart successfully!`);
};

window.increaseQty = function (index) {
  cart[index].qty += 1;
  saveCart();
};

window.decreaseQty = function (index) {
  if (cart[index].qty > 1) cart[index].qty -= 1;
  saveCart();
};

window.deleteItem = function (index) {
  cart.splice(index, 1);
  saveCart();
};

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCartPage();
}

function updateCartCount() {
  const cartCount = document.getElementById('cartCount');
  if (cartCount) cartCount.textContent = cart.reduce((sum, p) => sum + p.qty, 0);
}

function renderCartPage() {
  const cartItemsDiv = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  if (!cartItemsDiv) return;

  cartItemsDiv.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="col-12 text-center">
        <h4>Your cart is empty</h4>
        <p>Add some products to get started!</p>
      </div>`;
  } else {
    cart.forEach((item, index) => {
      total += item.price * item.qty;
      const div = document.createElement('div');
      div.className = 'col-12 mb-3';
      div.innerHTML = `
        <div class="cart-item d-flex align-items-center justify-content-between rounded p-3 cartDiv">
          <div class="d-flex align-items-center">
            <img src="${item.img}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; margin-right:15px;" class="rounded">
            <div>
              <h6 class="mb-1 fw-bold">${item.name}</h6>
              <p class="mb-0 cartPara ">$${item.price} x ${item.qty} = $${(item.price * item.qty).toFixed(2)}</p>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm mx-1 editBtn" onclick="increaseQty(${index})">+</button>
            <button class="btn btn-sm mx-1 editBtn" onclick="decreaseQty(${index})">-</button>
            <button class="btn btn-sm mx-1 editBtn" onclick="deleteItem(${index})">Delete</button>
          </div>
        </div>`;
      cartItemsDiv.appendChild(div);
    });
  }

  if (cartTotalSpan) cartTotalSpan.textContent = total.toFixed(2);
}

// -------------------- FETCH PRODUCTS FROM JSON --------------------
function fetchProductsJSON() {
  const loadingDiv = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  if (loadingDiv) loadingDiv.classList.remove('d-none');
  if (errorDiv) errorDiv.classList.add('d-none');

  fetch('./data/data.json')
    .then(res => res.json())
    .then(data => {
      window.productsData = data;
      if (loadingDiv) loadingDiv.classList.add('d-none');
      renderProductsByCategory('foundation');
    })
    .catch(err => {
      console.error('Error loading products JSON:', err);
      if (loadingDiv) loadingDiv.classList.add('d-none');
      if (errorDiv) {
        errorDiv.textContent = 'Failed to load products. Please try again.';
        errorDiv.classList.remove('d-none');
      }
    });
}

// -------------------- RENDER PRODUCTS BY CATEGORY --------------------
function renderProductsByCategory(category, searchTerm = '') {
  const productsContainer = document.getElementById('products');
  if (!productsContainer) return;

  productsContainer.innerHTML = '';

  let filtered = window.productsData.filter(p => p.category === category);

 
  if (searchTerm.trim() !== '') {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const limited = filtered.slice(0, 6); 

  if (limited.length === 0) {
    productsContainer.innerHTML = '<p class="text-center">No products found.</p>';
    return;
  }

  limited.forEach(product => {
    const card = document.createElement('div');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card mb-3" data-aos="fade-up">
        <img src="${product.img}" class="card-img-top" alt="${product.name}">
        <div class="card-body">
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">$${product.price}</p>
          <button class="btn btn-add" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>`;
    productsContainer.appendChild(card);
  });
}

// -------------------- CATEGORY SELECT --------------------
function setupCategorySelect() {
  const categorySelect = document.getElementById('categorySelect');
  const searchInput = document.getElementById('searchInput');
  if (!categorySelect) return;

  let currentCategory = categorySelect.value;
  let currentSearch = '';


  categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    renderProductsByCategory(currentCategory, currentSearch);
  });


  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      renderProductsByCategory(currentCategory, currentSearch);
    });
  }
}
// -------------------- INITIALIZATION --------------------
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCartPage();
  fetchProductsJSON();
  setupCategorySelect();

  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', () => (window.location.href = 'cart.html'));

  const checkoutBtn = document.getElementById('checkout');
  if (checkoutBtn) checkoutBtn.addEventListener('click', () => (window.location.href = 'checkout.html'));
});



//-------------------- HOME PAGE , FEATURED PRODUCTS SLIDER   --------------------
document.addEventListener("DOMContentLoaded", () => {
  const track = document.getElementById('track');

  // Only initialize slider if track element exists
  if (track) {
    let cards = Array.from(track.children);
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let centerIndex = 1;
    let autoSlide;


    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, cards[0]);
    cards = Array.from(track.children);


    function updateSlider(animate = true) {
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 32;
      const containerWidth = track.parentElement.getBoundingClientRect().width;
      const centerOffset = (containerWidth / 2) - (cardWidth / 2);
      const itemLeft = (cardWidth + gap) * centerIndex;
      const translateX = centerOffset - itemLeft;

      if (!animate) track.style.transition = "none";
      else track.style.transition = "transform 600ms ease";

      track.style.transform = `translateX(${translateX}px)`;
      cards.forEach((c, i) => c.classList.toggle('active', i === centerIndex));
    }


    function nextSlide() {
      centerIndex++;
      updateSlider();

      if (centerIndex === cards.length - 1) {
        setTimeout(() => {
          centerIndex = 1;
          updateSlider(false);
        }, 600);
      }
    }
    function prevSlide() {
      centerIndex--;
      updateSlider();

      if (centerIndex === 0) {
        setTimeout(() => {
          centerIndex = cards.length - 2;
          updateSlider(false);
        }, 600);
      }
    }


    nextBtn.addEventListener('click', () => { nextSlide(); resetAuto(); });
    prevBtn.addEventListener('click', () => { prevSlide(); resetAuto(); });


    function startAuto() { autoSlide = setInterval(nextSlide, 3000); }
    function resetAuto() { clearInterval(autoSlide); startAuto(); }

    window.addEventListener('resize', () => updateSlider(false));
    updateSlider(false);
    startAuto();
  }
});



 // -------------------- CONTACT FORM , CONTACT PAGE --------------------

  document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");


  if (form) {
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errorMessages = document.querySelectorAll(".error-message");

    function showError(input, message) {
      let error = input.nextElementSibling;
      if (!error || !error.classList.contains("error-message")) {
        error = document.createElement("small");
        error.classList.add("error-message", "text-danger");
        input.insertAdjacentElement("afterend", error);
      }
      error.textContent = message;
    }

    function clearError(input) {
      let error = input.nextElementSibling;
      if (error && error.classList.contains("error-message")) {
        error.textContent = "";
      }
    }

    function validateEmail(emailValue) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
    }

    function validatePassword(pass) {
      return pass.length >= 6;
    }

    // Real-time validation
    firstName.addEventListener("input", () => {
      firstName.value.trim() === "" ? showError(firstName, "First name is required") : clearError(firstName);
    });

    lastName.addEventListener("input", () => {
      lastName.value.trim() === "" ? showError(lastName, "Last name is required") : clearError(lastName);
    });

    email.addEventListener("input", () => {
      !validateEmail(email.value) ? showError(email, "Enter a valid email") : clearError(email);
    });

    password.addEventListener("input", () => {
      !validatePassword(password.value) ? showError(password, "Password must be at least 8 characters") : clearError(password);
    });

    // On submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (
        firstName.value.trim() !== "" &&
        lastName.value.trim() !== "" &&
        validateEmail(email.value) &&
        validatePassword(password.value)
      ) {
        alert("Form submitted successfully!");
        form.reset();
        errorMessages.forEach((err) => (err.textContent = ""));
      } else {
        alert("All fields must be completed before submitting");
      }
    });
  }
});


// -------------------- LOGIN FLOW --------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      if (username === "admin" && password === "1234") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", username);
         alert("Welcome, " + username);
        window.location.href = "index.html";
      } else {
        alert("Incorrect Password or Username");
      }
    });
  }

  // Check the login for all pages
  if (!localStorage.getItem("loggedIn")) {
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "login.html"){

      window.location.href = "login.html";
    }
  } else {
    const welcome = document.getElementById("welcome");
    if (welcome) {
      welcome.textContent = `Welcome, ${localStorage.getItem("username")}`;
    }
  }
    const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }
});


// -------------------- SCROLL BUTTON --------------------
  let scrollButton = document.getElementById("scrollButton");

  window.onscroll = function() {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      scrollButton.style.display = "block"; 
  } else {
      scrollButton.style.display = "none"; 
  }
  };


  function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// -------------------- EYE ICON IN PASSWORD INPUT --------------------
    document.addEventListener("DOMContentLoaded", () => {
    const pwd = document.getElementById('password');
    const toggleBtn = document.querySelector('.pw-toggle');
    const iconEye = document.getElementById('icon-eye');
    const iconEyeOff = document.getElementById('icon-eye-off');

    if (pwd && toggleBtn && iconEye && iconEyeOff) {
    toggleBtn.addEventListener('click', () => {
    const isHidden = pwd.type === 'password';
    pwd.type = isHidden ? 'text' : 'password';
    iconEye.style.display = isHidden ? 'none' : 'inline';
    iconEyeOff.style.display = isHidden ? 'inline' : 'none';
    });
  }
});


// -------------------- DARK MODE --------------------
  const toggleIcon = document.getElementById('themeToggle');
    const body = document.body;

    // Set icon based on current mode
    function setIcon(isDark) {
      toggleIcon.classList.remove('bi-sun-fill', 'bi-moon-fill');
      toggleIcon.classList.add(isDark ? 'bi-sun-fill' : 'bi-moon-fill');
    }

    // Load saved mode from localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      body.classList.add('dark-mode');
    }
    setIcon(darkMode);

    // Toggle theme on icon click
    toggleIcon.addEventListener('click', () => {
      body.classList.toggle('dark-mode');
      const isDark = body.classList.contains('dark-mode');
      setIcon(isDark);
      localStorage.setItem('darkMode', isDark);
    });

    
// --------------------AOS Animations --------------------
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-out-back'
    });
});
    
// --------------------Scroll Animations --------------------
function handleScrollAnimations() {
  const animatedSections = document.querySelectorAll('.scroll-animate');
  const triggerPoint = window.innerHeight - 100;

  animatedSections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < triggerPoint) {
      section.classList.add('show');
    }
  });
}

window.addEventListener('scroll', handleScrollAnimations);
window.addEventListener('load', handleScrollAnimations);