function showtime() {
 document.getElementById("time").innerHTML = new Date().toUTCString();
}
showtime();
setInterval(function() {
 showtime();
}
, 1000);

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;

    // Check for saved theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.src = 'https://cdn-icons-png.flaticon.com/512/1164/1164946.png'; // Moon icon for dark mode
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');

        // Update the icon and save the theme preference
        themeIcon.src = isDarkMode
            ? 'https://cdn-icons-png.flaticon.com/512/1164/1164946.png' // Moon icon for dark mode
            : 'https://cdn-icons-png.flaticon.com/512/1164/1164954.png'; // Sun icon for light mode
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
});
