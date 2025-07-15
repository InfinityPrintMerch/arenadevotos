const navLinks = [
    { href: "index.html", texto: "Inicio" },
    { href: "votaciones.html", texto: "Votaciones" },
    { href: "mis_votos.html", texto: "Mis Votos" }
];

function crearNavDinamico() {
    const nav = document.createElement("nav");
    nav.className = "navbar";

    const ul = document.createElement("ul");

    navLinks.forEach(link => {
        const li = document.createElement("li");
        li.dataset.href = link.href;
        const a = document.createElement("a");
        a.href = link.href;
        a.textContent = link.texto;
        li.appendChild(a);
        ul.appendChild(li);
    });

    nav.appendChild(ul);

    // Contenedor general avatar + texto juntos
    const perfilBox = document.createElement("div");
    perfilBox.style.display = "none"; // se mostrará si hay usuario
    perfilBox.style.backgroundColor = "#303030";
    perfilBox.style.borderRadius = "25px";
    perfilBox.style.padding = "6px 12px 6px 6px";
    perfilBox.style.marginLeft = "auto";
    perfilBox.style.marginRight = "20px";
    perfilBox.style.display = "flex";
    perfilBox.style.alignItems = "center";
    perfilBox.style.gap = "10px";
    perfilBox.style.cursor = "pointer";
    perfilBox.style.transition = "background-color 0.3s";
    perfilBox.addEventListener("mouseenter", () => perfilBox.style.backgroundColor = "#3a3a3a");
    perfilBox.addEventListener("mouseleave", () => perfilBox.style.backgroundColor = "#303030");
    perfilBox.addEventListener("click", () => {
        window.location.href = "profile.html";
    });

    // Imagen avatar
    const avatarImg = document.createElement("img");
    avatarImg.src = "https://i.ibb.co/j9WyfkYp/default-icon.png";
    avatarImg.alt = "Avatar";
    avatarImg.style.width = "40px";
    avatarImg.style.height = "40px";
    avatarImg.style.borderRadius = "50%";
    avatarImg.style.objectFit = "cover";

    // Texto "Mi perfil"
    const perfilText = document.createElement("span");
    perfilText.textContent = "Perfil";
    perfilText.style.color = "#0aff84";
    perfilText.style.fontWeight = "400";
    perfilText.style.fontFamily = "'Poppins', sans-serif";

    perfilBox.appendChild(avatarImg);
    perfilBox.appendChild(perfilText);
    nav.appendChild(perfilBox);

    document.body.insertBefore(nav, document.body.firstChild);

    // Firebase auth
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                const doc = await firebase.firestore().collection("usuarios").doc(user.uid).get();
                if (doc.exists) {
                    const data = doc.data();

                    // Actualiza imagen de perfil si existe
                    if (data.profileImageUrl) {
                        avatarImg.src = data.profileImageUrl;
                    }

                    // ✅ Actualiza texto del perfil al nombre del usuario
                    perfilText.textContent = data.nombrePerfil || "Usuario";

                    // Muestra el box
                    perfilBox.style.display = "flex";

                    // Oculta el link "profile.html" si existe
                    const perfilLi = Array.from(ul.children).find(li =>
                        li.dataset.href === "profile.html"
                    );
                    if (perfilLi) perfilLi.style.display = "none";
                }
            } catch (err) {
                console.error("Error al cargar perfil del usuario:", err);
            }
        }
    });

}

window.addEventListener("DOMContentLoaded", crearNavDinamico);
