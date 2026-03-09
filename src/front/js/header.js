import { auth } from '/src/front/js/auth.js';

function renderUserSection() {
  const userSection = document.getElementById('user-section');
  const activeUser = auth.getActiveUser();

  if (activeUser) {
    userSection.innerHTML = `
      <div class="user-info">
        <span>👤 ${activeUser.fullname}</span>
        <button onclick="logout()" class="btn btn-sm btn-outline-light">Logout</button>
      </div>
    `;
  } else {
    userSection.innerHTML = `
      <a href="/src/front/pages/login.html" class="btn btn-sm btn-outline-light">Login</a>
    `;
  }
}

window.logout = function () {
  auth.logout();
  window.location.href = '/';
}

renderUserSection();