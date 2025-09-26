document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Función para aplicar el tema
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            icon.classList.replace('bi-brightness-high', 'bi-moon-stars-fill');
        } else {
            body.classList.remove('dark-mode');
            icon.classList.replace('bi-moon-stars-fill', 'bi-brightness-high');
        }
    };

    // Cargar el tema guardado al iniciar
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Evento de click para cambiar el tema
    themeToggle.addEventListener('click', () => {
        const isDarkMode = body.classList.contains('dark-mode');
        const newTheme = isDarkMode ? 'light' : 'dark';
        
        applyTheme(newTheme);
        
        // Guardar la preferencia del usuario
        localStorage.setItem('theme', newTheme);
    });
});