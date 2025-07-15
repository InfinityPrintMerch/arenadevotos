// Config Firebase y inicialización
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

const container = document.getElementById('gameContainer');
const voteButton = document.getElementById('voteButton');
const popup = document.getElementById('popup');

let currentUser = null;
let currentGame = null;
let userVotes = new Set();
let gamesData = [];

// Detectar usuario logueado y cargar votos
auth.onAuthStateChanged(async user => {
    currentUser = user;
    if (user) {
        await loadUserVotes(user.uid);
    } else {
        userVotes.clear();
    }
    await loadGames(); // Cargar y renderizar juegos tras cargar votos
});

// Carga votos del usuario
async function loadUserVotes(uid) {
    try {
        const doc = await db.collection('userVotes').doc(uid).get();
        userVotes = doc.exists ? new Set(doc.data().votes || []) : new Set();
    } catch (e) {
        console.error("Error al cargar votos usuario:", e);
        userVotes = new Set();
    }
}

// Carga los juegos y votos totales, guarda en gamesData y renderiza
async function loadGames() {
    try {
        const snapshot = await db.collection('juegos').orderBy('creado', 'desc').get();
        const votesSnapshot = await db.collection('votes').get();

        // Map de votos por nombre de juego para acceso rápido
        const votesMap = {};
        votesSnapshot.forEach(doc => {
            votesMap[doc.id] = doc.data().count || 0;
        });

        gamesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.nombre,
                jugadores: data.jugadores,
                precio: data.precio,
                descripcion: data.descripcion,
                link: data.link,
                img: data.img,
                peso: data.peso,
                votos: votesMap[data.nombre] || 0
            };
        });

        renderGames(gamesData);

    } catch (error) {
        console.error("Error cargando juegos:", error);
    }
}

// Renderiza juegos con evento click para abrir popup
function renderGames(games) {
    if (!container) return;
    container.innerHTML = '';

    const noResults = document.getElementById('noResults');
    if (games.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="image-wrapper" style="position:relative;">
                <img src="${game.img}" alt="${game.nombre}">
                <div class="vote-badge" style="position:absolute; bottom:8px; right:8px;">
                    Votos: ${game.votos}
                </div>
            </div>
            <div class="game-info">
                <h3>${game.nombre}</h3>
                <p>${game.descripcion.substring(0, 70)}...</p>
                <div class="meta">
  <i class="fas fa-user-group" style="margin-right: 4px;"></i> ${game.jugadores}
  • ${game.precio} MXN • ${formatearPeso(game.peso)}
</div>

            </div>
        `;
        card.addEventListener('click', () => openPopup(game));
        container.appendChild(card);
    });
}



// Filtrado y ordenamiento dinámico
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

// Evento de búsqueda
searchInput.addEventListener('input', () => {
    filtrarYOrdenar();
});

// Evento de ordenamiento
sortSelect.addEventListener('change', () => {
    filtrarYOrdenar();
});

function filtrarYOrdenar() {
    const query = searchInput.value.toLowerCase();
    const criterio = sortSelect.value;

    let filtrados = gamesData.filter(game =>
        game.nombre.toLowerCase().includes(query)
    );

    if (criterio === 'nombre') {
        filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterio === 'votos') {
        filtrados.sort((a, b) => b.votos - a.votos);
    } else if (criterio === 'peso') {
        filtrados.sort((a, b) => {
            const pesoA = parseFloat(a.peso || 0);
            const pesoB = parseFloat(b.peso || 0);
            return pesoB - pesoA;
        });
    }

    renderGames(filtrados);
}



// Abre popup con info y actualiza botón votar
function openPopup(game) {
    currentGame = game;

    document.getElementById('popupHeader').style.backgroundImage = `url(${game.img})`;
    document.getElementById('popupTitle').textContent = game.nombre;
    document.getElementById('popupDesc').textContent = game.descripcion;
    document.getElementById('popupPlayers').textContent = game.jugadores;
    document.getElementById('popupPrice').textContent = game.precio;

    // Contenedor de enlaces
    const popupLinksContainer = document.getElementById('popupLinks');
    popupLinksContainer.innerHTML = ''; // Limpiar botones anteriores

    const links = game.link.split(',').map(l => l.trim());

    links.forEach(link => {
        const { nombre, color, hover } = detectarPlataforma(link);

        const btn = document.createElement('a');
        btn.href = link;
        btn.textContent = `Disponible en ${nombre}`;
        btn.target = '_blank';

        // Estilo inline (idéntico al de .popup-button, sin usar la clase)
        btn.style.display = 'block'; // que ocupe todo el ancho disponible

        btn.style.padding = '10px 18px';
        btn.style.margin = '10px 20px';
        btn.style.fontSize = '16px';
        btn.style.fontFamily = "'Poppins', sans-serif";
        btn.style.color = '#fffefeff';
        btn.style.backgroundColor = color;
        btn.style.border = 'none';
        btn.style.fontWeight = '900';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.textDecoration = 'none';
        btn.style.textAlign = 'center';
        btn.style.transition = 'background-color 0.2s ease';

        // Efecto hover
        btn.addEventListener('mouseenter', () => {
            btn.style.backgroundColor = hover;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.backgroundColor = color;
        });

        popupLinksContainer.appendChild(btn);
    });


    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (voteButton) {
        voteButton.textContent = currentUser && userVotes.has(game.nombre) ? 'Quitar voto' : 'Votar';
    }
}

// Detecta plataforma y colores
function detectarPlataforma(url) {
    if (url.includes("steampowered.com")) {
        return { nombre: "Steam", color: "#00569cff", hover: "#002544ff" };
    } else if (url.includes("epicgames.com")) {
        return { nombre: "Epic Games", color: "#3b3b3bff", hover: "#202020" };
    } else if (url.includes("gog.com")) {
        return { nombre: "GOG", color: "#8639ad", hover: "#a84ed4" };
    } else if (url.includes("xbox.com")) {
        return { nombre: "Xbox", color: "#107C10", hover: "#169216" };
    } else if (url.includes("playstation.com")) {
        return { nombre: "PlayStation", color: "#003087", hover: "#0050d3" };
    } else {
        return { nombre: "Sitio", color: "#555", hover: "#777" };
    }
}


// Cierra popup
function closePopup() {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Manejo del botón votar
if (voteButton) {
    voteButton.addEventListener('click', async () => {
        if (!currentUser) {
            alert('Debes iniciar sesión para votar.');
            return;
        }
        if (!currentGame) return;

        const gameName = currentGame.nombre;
        const userId = currentUser.uid;

        try {
            if (userVotes.has(gameName)) {
                await removeVote(userId, gameName);
                userVotes.delete(gameName);
                currentGame.votos = Math.max(0, currentGame.votos - 1);
                voteButton.textContent = 'Votar';
            } else {
                await addVote(userId, gameName);
                userVotes.add(gameName);
                currentGame.votos++;
                voteButton.textContent = 'Quitar voto';
            }
            renderGames(gamesData);
        } catch (error) {
            console.error('Error votando:', error);
            alert('Ocurrió un error al registrar tu voto.');
        }
    });
}

// Añadir voto
async function addVote(userId, gameName) {
    const userVotesRef = db.collection('userVotes').doc(userId);
    const votesRef = db.collection('votes').doc(gameName);

    await userVotesRef.set({
        votes: firebase.firestore.FieldValue.arrayUnion(gameName)
    }, { merge: true });

    await votesRef.set({
        count: firebase.firestore.FieldValue.increment(1)
    }, { merge: true });
}

// Quitar voto
async function removeVote(userId, gameName) {
    const userVotesRef = db.collection('userVotes').doc(userId);
    const votesRef = db.collection('votes').doc(gameName);

    await userVotesRef.set({
        votes: firebase.firestore.FieldValue.arrayRemove(gameName)
    }, { merge: true });

    const doc = await votesRef.get();
    if (doc.exists) {
        const currentCount = doc.data().count || 0;
        const newCount = Math.max(0, currentCount - 1);
        await votesRef.set({ count: newCount });
    }
}

function formatearPeso(pesoMb) {
    const peso = Number(pesoMb);
    if (isNaN(peso) || peso <= 0) return '0 MB';
    if (peso >= 1024) {
        const pesoGb = peso / 1024;
        return `${pesoGb.toFixed(1)} GB`;
    } else {
        return `${peso} MB`;
    }
}

const PAGE_SIZE = 20;
let currentPage = 1;
let filteredGames = [];

function renderGames(games) {
    if (!container) return;
    container.innerHTML = '';

    const noResults = document.getElementById('noResults');
    if (games.length === 0) {
        noResults.style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
    } else {
        noResults.style.display = 'none';
    }

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const gamesToShow = games.slice(start, end);

    gamesToShow.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="image-wrapper" style="position:relative;">
                <img src="${game.img}" alt="${game.nombre}">
                <div class="vote-badge" style="position:absolute; bottom:8px; right:8px;">
                    Votos: ${game.votos}
                </div>
            </div>
            <div class="game-info">
                <h3>${game.nombre}</h3>
                <p>${game.descripcion.substring(0, 70)}...</p>
                <div class="meta">
                    <i class="fas fa-user-group" style="margin-right: 4px;"></i> ${game.jugadores}
                    • ${game.precio} MXN • ${formatearPeso(game.peso)}
                </div>
            </div>
        `;
        card.addEventListener('click', () => openPopup(game));
        container.appendChild(card);
    });

    renderPagination(games.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.margin = '0 4px';
        btn.style.padding = '6px 12px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.background = i === currentPage ? '#0aff84' : '#303030';
        btn.style.color = i === currentPage ? '#000' : '#0aff84';

        btn.addEventListener('click', () => {
            currentPage = i;
            renderGames(filteredGames);
        });

        pagination.appendChild(btn);
    }
}

// Reemplaza renderGames(gamesData) por esta función:
function applyFiltersAndRender() {
    const query = searchInput.value.toLowerCase();
    const criterio = sortSelect.value;

    filteredGames = gamesData.filter(game =>
        game.nombre.toLowerCase().includes(query)
    );

    if (criterio === 'nombre') {
        filteredGames.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (criterio === 'votos') {
        filteredGames.sort((a, b) => b.votos - a.votos);
    } else if (criterio === 'peso') {
        filteredGames.sort((a, b) => {
            const pesoA = parseFloat(a.peso || 0);
            const pesoB = parseFloat(b.peso || 0);
            return pesoB - pesoA;
        });
    }

    currentPage = 1; // Reinicia a la primera página
    renderGames(filteredGames);
}

// Usa esta función después de cargar los juegos
async function loadGames() {
    try {
        const snapshot = await db.collection('juegos').orderBy('creado', 'desc').get();
        const votesSnapshot = await db.collection('votes').get();

        const votesMap = {};
        votesSnapshot.forEach(doc => {
            votesMap[doc.id] = doc.data().count || 0;
        });

        gamesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.nombre,
                jugadores: data.jugadores,
                precio: data.precio,
                descripcion: data.descripcion,
                link: data.link,
                img: data.img,
                peso: data.peso,
                votos: votesMap[data.nombre] || 0
            };
        });

        applyFiltersAndRender();
    } catch (error) {
        console.error("Error cargando juegos:", error);
    }
}

// Asegúrate de que estas llamadas usen la nueva función:
searchInput.addEventListener('input', applyFiltersAndRender);
sortSelect.addEventListener('change', applyFiltersAndRender);
