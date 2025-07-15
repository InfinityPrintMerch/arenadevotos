const avatarUrls = [
    "https://i.ibb.co/Pv6k35Xn/bear-2.png",
    "https://i.ibb.co/S7skgnXB/bear-3.png",
    "https://i.ibb.co/b5VDCVhm/bear.png",
    "https://i.ibb.co/QvNYhLcp/bear-5.png",
    "https://i.ibb.co/0y4KJf4m/bear-7.png",
    "https://i.ibb.co/1GxbXYzd/bear-9.png",
    "https://i.ibb.co/jvdXTJTk/bear-11.png",
    "https://i.ibb.co/27kVJH62/cat-3.png",
    "https://i.ibb.co/5g3cjZRy/cat-4.png",
    "https://i.ibb.co/hJ0fX8p4/cat-5.png",
    "https://i.ibb.co/nM5qQNRK/cat-7.png",
    "https://i.ibb.co/C3QxY3jr/cat-8.png",
    "https://i.ibb.co/Fkg00g6S/cat-9.png",
    "https://i.ibb.co/VWGxnYzy/cat-10.png",
    "https://i.ibb.co/tT5xY0Hp/cat-12.png",
    "https://i.ibb.co/xKD8qMn0/cat-13.png",
    "https://i.ibb.co/rRcR15x3/lazy.png",
    "https://i.ibb.co/xqfr4Js5/bear-1.png",
    "https://i.ibb.co/pBvkcMJy/bear-4.png",
    "https://i.ibb.co/DgQ1jYQP/bear-6.png",
    "https://i.ibb.co/ZzqBfR5Z/bear-8.png",
    "https://i.ibb.co/BVJ8z937/bear-10.png",
    "https://i.ibb.co/7tVxrWL5/bear-12.png",
    "https://i.ibb.co/NdPc7Tsm/camaleon.png",
    "https://i.ibb.co/wZbR19Yc/cat-1.png",
    "https://i.ibb.co/1f072B0H/cat-2.png",
    "https://i.ibb.co/dsPPsXxW/cat-6.png",
    "https://i.ibb.co/Gvbv2t1g/cat-11.png",
    "https://i.ibb.co/Q02w57m/deer.png",
    "https://i.ibb.co/1f5KRms2/fox.png",
    "https://i.ibb.co/LXNqFK4t/lion.png",
    "https://i.ibb.co/pBYxTd4T/rino.png",
    "https://i.ibb.co/nWj7GBC/snake.png",
    "https://i.ibb.co/pjTM79nL/wolf.png"
];

let selectedAvatarUrl = "";
let selectedTempAvatarUrl = "";


function mostrarAvatares() {
    const grid = document.getElementById("avatarGrid");
    grid.innerHTML = '';
    selectedTempAvatarUrl = selectedAvatarUrl; // copiar selección actual

    avatarUrls.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.classList.add("avatar-option");

        if (url === selectedTempAvatarUrl) {
            img.classList.add("selected");
        }

        img.addEventListener("click", () => {
            document.querySelectorAll(".avatar-option").forEach(i => i.classList.remove("selected"));
            img.classList.add("selected");
            selectedTempAvatarUrl = url;
        });

        grid.appendChild(img);
    });
}

document.getElementById("saveAvatarBtn").addEventListener("click", async () => {
    selectedAvatarUrl = selectedTempAvatarUrl;
    document.getElementById("avatarModal").style.display = "none";
    profileImage.src = selectedAvatarUrl;

    const user = firebase.auth().currentUser;
    if (user) {
        try {
            await db.collection('usuarios').doc(user.uid).set({
                profileImageUrl: selectedAvatarUrl
            }, { merge: true });
        } catch (err) {
            console.error('Error al guardar el avatar:', err);
            alert('No se pudo guardar el avatar.');
        }
    }
});


document.getElementById("cancelAvatarBtn").addEventListener("click", () => {
    selectedTempAvatarUrl = ""; // descartar
    document.getElementById("avatarModal").style.display = "none";
});


document.getElementById("openAvatarModal").addEventListener("click", () => {
    document.getElementById("avatarModal").style.display = "flex";
    mostrarAvatares();
});

document.getElementById("closeAvatarModal").addEventListener("click", () => {
    document.getElementById("avatarModal").style.display = "none";
});

// Opcional: cerrar al hacer clic fuera del modal
window.addEventListener("click", (e) => {
    const modal = document.getElementById("avatarModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

const firebaseConfig = {
    apiKey: "AIzaSyDJ_DRZE2fbevm6fWrum2ysvDQGFnBr0lE",
    authDomain: "arena-de-votos.firebaseapp.com",
    projectId: "arena-de-votos",
    storageBucket: "arena-de-votos.appspot.com",
    messagingSenderId: "106079017003",
    appId: "1:106079017003:web:fb67fd16712ae6a8c3b26e",
    measurementId: "G-T2M9840LPD"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

const loginBtn = document.getElementById('loginBtn');
const profileSection = document.getElementById('profile-section');
const profileNameInput = document.getElementById('profileName');
const profileNameDisplay = document.getElementById('profileNameDisplay');
const userCard = document.getElementById('user-card');
const savedProfileName = document.getElementById('savedProfileName');
const userEmailSpan = document.getElementById('userEmail');
const profileImage = document.getElementById('profileImage');
const uploadInput = document.getElementById('uploadImageInput');

const defaultImage = 'https://i.ibb.co/j9WyfkYp/default-icon.png';

const adminEmails = ['eduardo.lpz.salinas@gmail.com']; // reemplaza con tu correo admin

auth.onAuthStateChanged(async (user) => {
    if (user) {
        document.querySelector('.login-box-container').style.display = 'none';
        loginBtn.style.display = 'none';

        const isAdmin = adminEmails.includes(user.email);

        if (isAdmin) {
            mostrarPanelAdministrador();
        }

        const doc = await db.collection('usuarios').doc(user.uid).get();



        if (doc.exists && doc.data().nombrePerfil) {
            savedProfileName.textContent = doc.data().nombrePerfil;
            userEmailSpan.textContent = user.email;
            profileImage.src = doc.data().profileImageUrl || defaultImage;
            userCard.style.display = 'flex';
            profileSection.style.display = 'none';
        } else {
            profileImage.src = defaultImage;
            profileSection.style.display = 'block';
            userCard.style.display = 'none';
            profileNameInput.value = '';
        }

        cargarMisRecs();

    } else {
        loginBtn.style.display = 'inline-block';
        profileSection.style.display = 'none';
        userCard.style.display = 'none';
        profileImage.src = defaultImage;
    }
});

function mostrarPanelAdministrador() {
    const menu = document.getElementById('user-menu');
    if (!menu) return;

    // Botones admin si no existen
    if (!document.getElementById('admin-add-btn')) {
        const btnAdd = document.createElement('button');
        btnAdd.id = 'admin-add-btn';
        btnAdd.textContent = 'Agregar Juego';
        btnAdd.onclick = () => showSection('adminAdd');
        menu.appendChild(btnAdd);
    }

    if (!document.getElementById('admin-manage-btn')) {
        const btnManage = document.createElement('button');
        btnManage.id = 'admin-manage-btn';
        btnManage.textContent = 'Administrar Juegos';
        btnManage.onclick = () => {
            showSection('adminManage');
            cargarJuegosAdmin();
        };
        menu.appendChild(btnManage);
    }

    if (!document.getElementById('admin-pets-btn')) {
        const btnPets = document.createElement('button');
        btnPets.id = 'admin-pets-btn';
        btnPets.textContent = 'Peticiones';
        btnPets.onclick = () => {
            showSection('adminPeticiones');
            cargarPeticionesAdmin();
        };
        menu.appendChild(btnPets);
    }

    // Sección para agregar juego
    if (!document.getElementById('section-adminAdd')) {
        const adminAddSection = document.createElement('section');
        adminAddSection.id = 'section-adminAdd';
        adminAddSection.style.display = 'none';
        adminAddSection.innerHTML = `
            <h3>Agregar nuevo juego</h3>
            <div style="display: flex; flex-direction: column; gap: 10px; max-width: 500px;">
                <input type="text" id="gameName" placeholder="Nombre del juego" class="login-input">
                <input type="text" id="gamePlayers" placeholder="Jugadores" class="login-input">
                <input type="text" id="gamePrice" placeholder="Precio" class="login-input">
                <input type="text" id="gameDesc" placeholder="Descripción" class="login-input">
                <input type="text" id="gameLink" placeholder="Enlace" class="login-input">
                <input type="text" id="gameImg" placeholder="URL de imagen" class="login-input">
                <input type="text" id="gameSize" placeholder="Peso del juego" class="login-input">
                <button onclick="agregarJuego()" class="login-button">Guardar Juego</button>
            </div>
        `;
        document.getElementById('user-content').appendChild(adminAddSection);
    }

    // Sección para administrar juegos
    if (!document.getElementById('section-adminManage')) {
        const adminManageSection = document.createElement('section');
        adminManageSection.id = 'section-adminManage';
        adminManageSection.style.display = 'none';
        adminManageSection.innerHTML = `
            <h3>Administrar Juegos</h3>
            <div id="lista-juegos-admin" style="max-width: 600px;"></div>
        `;
        document.getElementById('user-content').appendChild(adminManageSection);
    }

    // Sección para peticiones
    if (!document.getElementById('section-adminPeticiones')) {
        const adminPeticionesSection = document.createElement('section');
        adminPeticionesSection.id = 'section-adminPeticiones';
        adminPeticionesSection.style.display = 'none';
        adminPeticionesSection.innerHTML = `<h3>Peticiones de usuarios</h3><div id="lista-peticiones" style="max-width:600px;"></div>`;
        document.getElementById('user-content').appendChild(adminPeticionesSection);
    }

    if (!document.getElementById('admin-settings-btn')) {
        const btnSettings = document.createElement('button');
        btnSettings.id = 'admin-settings-btn';
        btnSettings.textContent = 'Ajustes';
        btnSettings.onclick = () => showSection('adminSettings');
        menu.appendChild(btnSettings);
    }

    if (!document.getElementById('section-adminSettings')) {
        const adminSettingsSection = document.createElement('section');
        adminSettingsSection.id = 'section-adminSettings';
        adminSettingsSection.style.display = 'none';
        adminSettingsSection.innerHTML = `
        <h3>Ajustes de Administrador</h3>
        <button id="resetVotesBtn" style="
            background-color: #e74c3c;
            color: white;
            padding: 10px 20px;
            font-weight: 600;
            border-radius: 6px;
            border: none;
            cursor: pointer;
        ">Eliminar todos los votos</button>
        <p style="margin-top: 10px; color: #aaa;">Esta acción reiniciará a 0 los votos de todos los juegos y borrará los registros de votos de los usuarios.</p>
    `;
        document.getElementById('user-content').appendChild(adminSettingsSection);

        document.getElementById('resetVotesBtn').addEventListener('click', resetearTodosLosVotos);
    }




}

function agregarJuego() {
    const nombre = document.getElementById('gameName').value.trim();
    const jugadores = document.getElementById('gamePlayers').value.trim();
    const precio = document.getElementById('gamePrice').value.trim();
    const descripcion = document.getElementById('gameDesc').value.trim();
    const link = document.getElementById('gameLink').value.trim();
    const img = document.getElementById('gameImg').value.trim();
    const peso = document.getElementById('gameSize').value.trim();

    if (!nombre || !jugadores || !precio || !descripcion || !link || !img || !peso) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    db.collection('juegos').add({
        nombre,
        jugadores,
        precio,
        descripcion,
        link,
        img,
        peso,
        creado: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert('Juego agregado correctamente.');
        ['gameName', 'gamePlayers', 'gamePrice', 'gameDesc', 'gameLink', 'gameImg', 'gameSize'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }).catch(err => {
        console.error('Error agregando juego:', err);
        alert('Hubo un error al guardar el juego.');
    });
}

async function cargarJuegosAdmin() {
    const listaContainer = document.getElementById('lista-juegos-admin');
    listaContainer.innerHTML = 'Cargando juegos...';

    try {
        const snapshot = await db.collection('juegos').orderBy('creado', 'desc').get();
        if (snapshot.empty) {
            listaContainer.innerHTML = '<p>No hay juegos registrados.</p>';
            return;
        }

        listaContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const juego = doc.data();
            const id = doc.id;

            const div = document.createElement('div');
            div.style.borderBottom = '1px solid #444';
            div.style.padding = '8px 0';

            const viewDiv = document.createElement('div');
            viewDiv.style.display = 'flex';
            viewDiv.style.justifyContent = 'space-between';
            viewDiv.style.alignItems = 'center';

            const nombreSpan = document.createElement('span');
            nombreSpan.textContent = juego.nombre;

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.style.marginRight = '10px';

            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.style.backgroundColor = '#c0392b';
            btnEliminar.style.color = 'white';

            viewDiv.appendChild(nombreSpan);

            const btnGroup = document.createElement('div');
            btnGroup.appendChild(btnEditar);
            btnGroup.appendChild(btnEliminar);

            viewDiv.appendChild(btnGroup);
            div.appendChild(viewDiv);

            btnEliminar.onclick = () => {
                if (confirm('¿Estás seguro de eliminar este juego?')) {
                    db.collection('juegos').doc(id).delete()
                        .then(() => {
                            alert('Juego eliminado.');
                            cargarJuegosAdmin();
                        }).catch(err => {
                            console.error('Error eliminando juego:', err);
                            alert('Error al eliminar el juego.');
                        });
                }
            };

            btnEditar.onclick = () => {
                viewDiv.style.display = 'none';

                const form = document.createElement('form');
                form.style.display = 'flex';
                form.style.flexDirection = 'column';
                form.style.gap = '8px';
                form.style.marginTop = '10px';

                const campos = {
                    nombre: juego.nombre,
                    jugadores: juego.jugadores,
                    precio: juego.precio,
                    descripcion: juego.descripcion,
                    link: juego.link,
                    img: juego.img,
                    peso: juego.peso
                };

                const inputs = {};
                for (const [key, value] of Object.entries(campos)) {
                    const input = document.createElement(key === 'descripcion' ? 'textarea' : 'input');
                    input.name = key;
                    input.value = value || '';
                    input.placeholder = key.charAt(0).toUpperCase() + key.slice(1);
                    input.style.width = '100%';
                    if (key === 'descripcion') input.rows = 3;
                    inputs[key] = input;
                    form.appendChild(input);
                }

                const btnGuardar = document.createElement('button');
                btnGuardar.type = 'submit';
                btnGuardar.textContent = 'Guardar';
                btnGuardar.style.marginRight = '10px';

                const btnCancelar = document.createElement('button');
                btnCancelar.type = 'button';
                btnCancelar.textContent = 'Cancelar';

                const btnGroupForm = document.createElement('div');
                btnGroupForm.style.display = 'flex';
                btnGroupForm.appendChild(btnGuardar);
                btnGroupForm.appendChild(btnCancelar);
                form.appendChild(btnGroupForm);

                div.appendChild(form);

                btnCancelar.onclick = (e) => {
                    e.preventDefault();
                    form.remove();
                    viewDiv.style.display = 'flex';
                };

                form.onsubmit = (e) => {
                    e.preventDefault();
                    const dataActualizar = {};
                    for (const key in inputs) {
                        dataActualizar[key] = inputs[key].value.trim();
                    }

                    if (!dataActualizar.nombre) {
                        alert('El nombre es obligatorio');
                        return;
                    }

                    db.collection('juegos').doc(id).update(dataActualizar)
                        .then(() => {
                            alert('Juego actualizado correctamente');
                            cargarJuegosAdmin();
                        })
                        .catch(err => {
                            console.error('Error actualizando juego:', err);
                            alert('Error al actualizar el juego.');
                        });
                };
            };

            listaContainer.appendChild(div);
        });
    } catch (err) {
        console.error('Error cargando juegos:', err);
        listaContainer.innerHTML = '<p>Error cargando juegos.</p>';
    }
}

function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(error => console.error("Error al autenticar:", error));
}

function saveProfileName() {
    const profileName = profileNameInput.value.trim();
    const user = auth.currentUser;
    if (!profileName || !user) return;

    const imageUrl = selectedAvatarUrl || defaultImage;

    db.collection('usuarios').doc(user.uid).set({
        nombrePerfil: profileName,
        email: user.email,
        profileImageUrl: imageUrl,
        creado: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(() => {
        savedProfileName.textContent = profileName;
        userEmailSpan.textContent = user.email;
        profileImage.src = imageUrl;
        profileSection.style.display = 'none';
        userCard.style.display = 'flex';
    }).catch(err => {
        console.error('Error al guardar nombre:', err);
        alert('Error al guardar tu perfil.');
    });
}



function logout() {
    auth.signOut();
}


function showSection(section) {
    const sections = ['profile', 'recommendations', 'adminAdd', 'adminManage', 'adminPeticiones', 'adminSettings'];


    sections.forEach(s => {
        const el = document.getElementById(`section-${s}`);
        if (el) el.style.display = (s === section) ? 'block' : 'none';
    });

    const buttons = document.querySelectorAll('#user-menu button');
    buttons.forEach(btn => {
        const btnText = btn.textContent.trim();
        const match = (section === 'profile' && btnText === 'Perfil') ||
            (section === 'recommendations' && btnText === 'Mis Recomendaciones') ||
            (section === 'adminAdd' && btnText === 'Agregar Juego') ||
            (section === 'adminManage' && btnText === 'Administrar Juegos') ||
            (section === 'adminPeticiones' && btnText === 'Peticiones');
        btn.classList.toggle('active', match);
    });
}

uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const user = auth.currentUser;
    if (!file || !user) return;

    try {
        const storageRef = firebase.storage().ref();
        // Siempre guarda como profile.jpg para ese UID
        const imageRef = storageRef.child(`profileImages/${user.uid}/profile.jpg`);
        await imageRef.put(file);

        const downloadURL = await imageRef.getDownloadURL();

        await db.collection('usuarios').doc(user.uid).set({
            profileImageUrl: downloadURL
        }, { merge: true });

        profileImage.src = downloadURL;

        // Si ya está visible el perfil guardado, lo actualizamos ahí también
        if (savedProfileName.textContent) {
            userCard.style.display = 'flex';
            profileSection.style.display = 'none';
        }

        alert('Imagen de perfil actualizada correctamente.');
    } catch (err) {
        console.error('Error subiendo imagen:', err);
        alert('Error al subir la imagen.');
    }
});


// Enviar recomendación del usuario
async function enviarRecomendacion() {
    const link = document.getElementById('recLink').value.trim();
    if (!link) return alert('Ingresa un enlace Steam.');
    const user = auth.currentUser;
    if (!user) return alert('Debes iniciar sesión.');

    const isValid = link.includes('/app/');
    await db.collection('recomendaciones').add({
        user: user.uid,
        email: user.email,
        link,
        estado: isValid ? 'pendiente' : 'invalid',
        creado: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById('recLink').value = '';
    cargarMisRecs();
    alert(isValid ? 'Recomendación enviada.' : 'URL inválido, marcada como inválida.');
}

async function cargarMisRecs() {
    const container = document.getElementById('mis-recs-list');
    container.innerHTML = '';

    if (!auth.currentUser) {
        container.innerHTML = '<p style="color:#e74c3c; font-weight:600;">Debes iniciar sesión para ver tus recomendaciones.</p>';
        return;
    }

    const snapshot = await db.collection('recomendaciones')
        .where('user', '==', auth.currentUser.uid)
        .orderBy('creado', 'desc')
        .get();

    if (snapshot.empty) {
        container.innerHTML = '<p style="color:#7f8c8d; font-style: italic;">No tienes recomendaciones.</p>';
        return;
    }

    snapshot.forEach(doc => {
        const rec = doc.data();

        const div = document.createElement('div');
        div.style.backgroundColor = '#1f1f1f';  // fondo oscuro suave
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.4)';
        div.style.padding = '12px 20px';
        div.style.marginBottom = '12px';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.fontFamily = "'Poppins', sans-serif";
        div.style.color = '#ecf0f1';

        const nombreJuego = obtenerNombreJuegoDesdeLink(rec.link) || rec.link;

        const nombreSpan = document.createElement('span');
        nombreSpan.textContent = nombreJuego;
        nombreSpan.style.fontWeight = '600';
        nombreSpan.style.fontSize = '1.1rem';
        nombreSpan.style.flex = '1';
        nombreSpan.style.marginRight = '20px';
        nombreSpan.style.overflow = 'hidden';
        nombreSpan.style.textOverflow = 'ellipsis';
        nombreSpan.style.whiteSpace = 'nowrap';

        const estadoSpan = document.createElement('span');
        estadoSpan.style.fontWeight = '600';
        estadoSpan.style.padding = '4px 12px';
        estadoSpan.style.borderRadius = '16px';
        estadoSpan.style.minWidth = '90px';
        estadoSpan.style.textAlign = 'center';
        estadoSpan.style.fontSize = '0.9rem';

        let estadoTexto = '';
        switch (rec.estado) {
            case 'pendiente':
                estadoTexto = 'Pendiente';
                estadoSpan.style.backgroundColor = '#f39c12'; // amarillo
                estadoSpan.style.color = '#2c3e50';
                break;
            case 'accepted':
                estadoTexto = 'Aceptada';
                estadoSpan.style.backgroundColor = '#27ae60'; // verde
                estadoSpan.style.color = '#ecf0f1';
                break;
            case 'rejected':
                estadoTexto = 'Rechazada';
                estadoSpan.style.backgroundColor = '#c0392b'; // rojo
                estadoSpan.style.color = '#ecf0f1';
                break;
            case 'invalid':
                estadoTexto = 'URL Inválido';
                estadoSpan.style.backgroundColor = '#7f8c8d'; // gris
                estadoSpan.style.color = '#ecf0f1';
                break;
            default:
                estadoTexto = rec.estado;
                estadoSpan.style.backgroundColor = '#34495e';
                estadoSpan.style.color = '#ecf0f1';
        }
        estadoSpan.textContent = estadoTexto;

        div.appendChild(nombreSpan);
        div.appendChild(estadoSpan);
        container.appendChild(div);
    });
}


// Cargar lista Admin de peticiones
async function cargarPeticionesAdmin() {
    const cont = document.getElementById('lista-peticiones');
    cont.innerHTML = '<p style="font-style: italic; color: #999;">Cargando...</p>';
    const snapshot = await db.collection('recomendaciones')
        .where('estado', '==', 'pendiente').orderBy('creado', 'asc').get();
    cont.innerHTML = snapshot.empty ? '<p>No hay peticiones.</p>' : '';

    snapshot.forEach(doc => {
        const rec = doc.data(), id = doc.id;

        const card = document.createElement('div');
        card.style.border = '1px solid #ccc';
        card.style.borderRadius = '8px';
        card.style.padding = '15px 20px';
        card.style.marginBottom = '15px';
        card.style.backgroundColor = '#1f2937'; // dark background
        card.style.color = '#f9fafb'; // light text
        card.style.display = 'flex';
        card.style.justifyContent = 'space-between';
        card.style.alignItems = 'center';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        card.style.fontFamily = "'Poppins', sans-serif";

        const linkSpan = document.createElement('span');
        linkSpan.textContent = obtenerNombreJuegoDesdeLink(rec.link);

        linkSpan.style.flex = '1';
        linkSpan.style.wordBreak = 'break-all';
        linkSpan.style.marginRight = '20px';

        const btnContainer = document.createElement('div');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '10px';

        const btnAceptar = document.createElement('button');
        btnAceptar.textContent = 'Aceptar';
        btnAceptar.style.backgroundColor = '#22c55e'; // green
        btnAceptar.style.border = 'none';
        btnAceptar.style.color = 'white';
        btnAceptar.style.padding = '8px 14px';
        btnAceptar.style.borderRadius = '6px';
        btnAceptar.style.cursor = 'pointer';
        btnAceptar.style.fontWeight = '600';
        btnAceptar.onmouseenter = () => btnAceptar.style.backgroundColor = '#16a34a';
        btnAceptar.onmouseleave = () => btnAceptar.style.backgroundColor = '#22c55e';
        btnAceptar.onclick = () => aceptarPeticion(id, rec.link);

        const btnRechazar = document.createElement('button');
        btnRechazar.textContent = 'Rechazar';
        btnRechazar.style.backgroundColor = '#ef4444'; // red
        btnRechazar.style.border = 'none';
        btnRechazar.style.color = 'white';
        btnRechazar.style.padding = '8px 14px';
        btnRechazar.style.borderRadius = '6px';
        btnRechazar.style.cursor = 'pointer';
        btnRechazar.style.fontWeight = '600';
        btnRechazar.onmouseenter = () => btnRechazar.style.backgroundColor = '#b91c1c';
        btnRechazar.onmouseleave = () => btnRechazar.style.backgroundColor = '#ef4444';
        btnRechazar.onclick = () => rechazarPeticion(id);

        btnContainer.appendChild(btnAceptar);
        btnContainer.appendChild(btnRechazar);

        card.appendChild(linkSpan);
        card.appendChild(btnContainer);

        cont.appendChild(card);
    });
}

// Aceptar petición: pasar info parcialmente al form Agregar Juego
function aceptarPeticion(id, link) {
    showSection('adminAdd');
    document.getElementById('gameLink').value = link;
    // dejamos restantes en blanco para que el admin complete
    db.collection('recomendaciones').doc(id).update({ estado: 'accepted' });
}

// Rechazar petición
function rechazarPeticion(id) {
    db.collection('recomendaciones').doc(id).update({ estado: 'rejected' });
    cargarPeticionesAdmin();
}

function obtenerNombreJuegoDesdeLink(link) {
    try {
        // Crear objeto URL para manipular
        const url = new URL(link);
        const paths = url.pathname.split('/').filter(Boolean); // Divide por "/" y elimina vacíos

        // El nombre del juego está usualmente en la última parte
        let nombreRaw = paths[paths.length - 1] || '';

        // Reemplazar guiones bajos o guiones por espacios
        nombreRaw = nombreRaw.replace(/[_-]+/g, ' ');

        // Capitalizar cada palabra
        const nombreFinal = nombreRaw.replace(/\b\w/g, char => char.toUpperCase());

        return nombreFinal;
    } catch {
        // Si no es una URL válida, devolver link original o vacío
        return '';
    }
}

// Función para rellenar campos desde Steam
async function rellenarDesdeSteam(url) {
    try {
        const match = url.match(/\/app\/(\d+)/);
        if (!match) return;
        const appId = match[1];

        // Proxy CORS para evitar bloqueos
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=mx&l=spanish`)}`;

        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Error en respuesta del proxy');
        const data = await res.json();

        if (!data[appId] || !data[appId].success) return;

        const game = data[appId].data;

        if (!document.getElementById('gameName').value)
            document.getElementById('gameName').value = game.name || '';

        if (!document.getElementById('gameImg').value)
            document.getElementById('gameImg').value = game.header_image || '';

        if (!document.getElementById('gameDesc').value && game.short_description)
            document.getElementById('gameDesc').value = game.short_description;

        if (!document.getElementById('gamePrice').value) {
            if (game.is_free) {
                document.getElementById('gamePrice').value = "Gratis";
            } else if (game.price_overview && typeof game.price_overview.final === 'number') {
                const centavos = game.price_overview.final;
                const precio = (centavos / 100).toFixed(2); // Ejemplo: 154.69
                document.getElementById('gamePrice').value = precio;
            } else {
                document.getElementById('gamePrice').value = "Desconocido";
            }
        }
    } catch (err) {
        console.error('Error obteniendo datos de Steam:', err);
    }
}




// Función para rellenar campos desde Epic
async function rellenarDesdeEpic(url) {
    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('Error en respuesta del proxy Epic');

        const htmlText = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const ogTitle = doc.querySelector('meta[property="og:title"]');
        const ogImage = doc.querySelector('meta[property="og:image"]');
        const ogDesc = doc.querySelector('meta[property="og:description"]');

        if (ogTitle && !document.getElementById('gameName').value) {
            let title = ogTitle.content || '';
            // Limpiar título, quitar después de '|' o '- Epic Games Store'
            title = title.split('|')[0].trim();
            title = title.replace(/\s*- Epic Games Store\s*$/, '').trim();
            document.getElementById('gameName').value = title;
        }

        if (ogImage && !document.getElementById('gameImg').value) {
            document.getElementById('gameImg').value = ogImage.content || '';
        }

        if (ogDesc && !document.getElementById('gameDesc').value) {
            let desc = ogDesc.content || '';
            // Limpiar descripción común repetitiva
            desc = desc.replace(/Descarga y juega a .* en la Epic Games Store\.?/, '').trim();
            desc = desc.replace(/Comprueba la disponibilidad de plataforma y el precio\.?/, '').trim();
            if (!desc) desc = 'Descripción no disponible.';
            document.getElementById('gameDesc').value = desc;
        }

        if (!document.getElementById('gamePrice').value) {
            document.getElementById('gamePrice').value = 'Desconocido';
        }

    } catch (err) {
        console.error('Error obteniendo datos de Epic Games:', err);
    }
}


// Asociar evento al campo de enlace después de crearlo dinámicamente
const observer = new MutationObserver(() => {
    const gameLinkInput = document.getElementById('gameLink');
    if (gameLinkInput && !gameLinkInput.dataset.listenerAttached) {
        gameLinkInput.addEventListener('input', async (e) => {
            const url = e.target.value.trim();
            if (url.includes('steampowered.com')) {
                await rellenarDesdeSteam(url);
            } else if (url.includes('epicgames.com')) {
                await rellenarDesdeEpic(url);
            }
        });
        gameLinkInput.dataset.listenerAttached = 'true';
    }
});

observer.observe(document.body, { childList: true, subtree: true });

document.getElementById('editNameBtn').addEventListener('click', () => {
    const currentName = savedProfileName.textContent.trim();
    document.getElementById('newNameInput').value = currentName;
    document.getElementById('nameModal').style.display = 'flex';
});

document.getElementById('closeNameModal').addEventListener('click', () => {
    document.getElementById('nameModal').style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target.id === 'nameModal') {
        document.getElementById('nameModal').style.display = 'none';
    }
});

document.getElementById('saveNameBtn').addEventListener('click', async () => {
    const newName = document.getElementById('newNameInput').value.trim();
    const user = auth.currentUser;

    if (!newName || !user) return alert('Ingresa un nombre válido.');

    try {
        await db.collection('usuarios').doc(user.uid).set({
            nombrePerfil: newName
        }, { merge: true });

        savedProfileName.textContent = newName;
        document.getElementById('nameModal').style.display = 'none';
        alert('Nombre actualizado correctamente.');
    } catch (err) {
        console.error('Error actualizando nombre:', err);
        alert('No se pudo actualizar el nombre.');
    }
});

async function resetearTodosLosVotos() {
    if (!confirm("¿Estás seguro de eliminar todos los votos? Esta acción es irreversible.")) {
        return;
    }

    try {
        // 1. Eliminar todos los votos dentro de la colección 'userVotes'
        const userVotesSnapshot = await db.collection('userVotes').get();

        const batch = db.batch();

        userVotesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("Se eliminaron todos los documentos en 'userVotes'");

        // 2. Reiniciar los contadores dentro de la colección 'votes'
        const votesSnapshot = await db.collection('votes').get();

        const batch2 = db.batch();

        votesSnapshot.forEach(doc => {
            batch2.update(doc.ref, { count: 0 }); // asumo que el campo que lleva el conteo es 'count'
        });

        await batch2.commit();
        console.log("Se reiniciaron los contadores de votos a 0");

        alert("Todos los votos han sido eliminados y los contadores reiniciados.");

    } catch (error) {
        console.error("Error al resetear votos:", error);
        alert("Ocurrió un error al eliminar los votos. Revisa la consola.");
    }
}
