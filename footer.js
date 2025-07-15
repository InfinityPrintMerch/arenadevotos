// Función para cargar el footer
function loadFooter() {
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        })
        .catch(error => console.error('Error cargando el footer:', error));
}

// Cargar el footer cuando la página cargue
window.addEventListener('DOMContentLoaded', loadFooter);