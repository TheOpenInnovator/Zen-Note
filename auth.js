const darkModeToggle = document.getElementById('darkModeToggle');

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

darkModeToggle.addEventListener('click', toggleDarkMode);

document.getElementById('signupForm')?.addEventListener('submit', function (event) {
    event.preventDefault(); 
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const userData = { name, email, password };
    localStorage.setItem(email, JSON.stringify(userData));

    alert("Sign up successful! You can now log in.");
    window.location.href = "login.html"; 
});

document.getElementById('loginForm')?.addEventListener('submit', function (event) {
    event.preventDefault(); 
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userData = JSON.parse(localStorage.getItem(email));

    if (userData && userData.password === password) {
        alert("Login successful!");
        window.location.href = "index.html"; 
    } else {
        alert("Invalid email or password.");
    }
});
