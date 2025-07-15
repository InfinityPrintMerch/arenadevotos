// mis_votos.js — Muestra solo los juegos votados por el usuario

firebase.initializeApp({
    apiKey: "AIzaSyDJ_DRZE2fbevm6fWrum2ysvDQGFnBr0lE",
    authDomain: "arena-de-votos.firebaseapp.com",
    projectId: "arena-de-votos",
    storageBucket: "arena-de-votos.appspot.com",
    messagingSenderId: "106079017003",
    appId: "1:106079017003:web:fb67fd16712ae6a8c3b26e",
    measurementId: "G-T2M9840LPD"
});

const auth = firebase.auth();
const db = firebase.firestore();

const container = document.getElementById('gameContainer');
const voteButton = document.getElementById('voteButton');
const popup = document.getElementById('popup');

let currentUser = null;
let currentGame = null;
let userVotes = new Set();
let votedGames = [];

// Detecta usuario logueado
auth.onAuthStateChanged(async user => {
    currentUser = user;
    if (user) {
        await loadUserVotes(user.uid);
        await loadVotedGames();
    } else {
        container.innerHTML = '<p style="text-align:center">Debes iniciar sesión para ver tus votos.</p>';
    }
});

async function loadUserVotes(uid) {
    try {
        const doc = await db.collection('userVotes').doc(uid).get();
        userVotes = doc.exists ? new Set(doc.data().votes || []) : new Set();
    } catch (e) {
        console.error("Error al cargar votos usuario:", e);
        userVotes = new Set();
    }
}

async function loadVotedGames() {
    try {
        const snapshot = await db.collection('juegos').get();
        const votesSnapshot = await db.collection('votes').get();

        const votesMap = {};
        votesSnapshot.forEach(doc => {
            votesMap[doc.id] = doc.data().count || 0;
        });

        votedGames = snapshot.docs
            .map(doc => {
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
            })
            .filter(game => userVotes.has(game.nombre));

        renderGames(votedGames);

    } catch (error) {
        console.error("Error cargando juegos votados:", error);
    }
}

function renderGames(games) {
    if (!container) return;
    container.innerHTML = '';

    const noResults = document.getElementById('noResults');
    if (games.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    } else {
        if (noResults) noResults.style.display = 'none';
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

function formatearPeso(pesoMb) {
    const peso = Number(pesoMb);
    if (isNaN(peso) || peso <= 0) return '0 MB';
    return peso >= 1024 ? `${(peso / 1024).toFixed(1)} GB` : `${peso} MB`;
}

function openPopup(game) {
    currentGame = game;

    document.getElementById('popupHeader').style.backgroundImage = `url(${game.img})`;
    document.getElementById('popupTitle').textContent = game.nombre;
    document.getElementById('popupDesc').textContent = game.descripcion;
    document.getElementById('popupPlayers').textContent = game.jugadores;
    document.getElementById('popupPrice').textContent = game.precio;

    const popupLinksContainer = document.getElementById('popupLinks');
    popupLinksContainer.innerHTML = '';

    const links = game.link.split(',').map(l => l.trim());

    links.forEach(link => {
        const { nombre, color, hover } = detectarPlataforma(link);

        const btn = document.createElement('a');
        btn.href = link;
        btn.textContent = `Disponible en ${nombre}`;
        btn.target = '_blank';

        btn.style.display = 'block';
        btn.style.width = 'fit-content';
        btn.style.margin = '10px auto';
        btn.style.padding = '10px 18px';
        btn.style.fontSize = '16px';
        btn.style.fontFamily = "'Poppins', sans-serif";
        btn.style.color = '#fff';
        btn.style.backgroundColor = color;
        btn.style.border = 'none';
        btn.style.fontWeight = '900';
        btn.style.borderRadius = '8px';
        btn.style.cursor = 'pointer';
        btn.style.textDecoration = 'none';
        btn.style.textAlign = 'center';
        btn.style.transition = 'background-color 0.2s ease';

        btn.addEventListener('mouseenter', () => btn.style.backgroundColor = hover);
        btn.addEventListener('mouseleave', () => btn.style.backgroundColor = color);

        popupLinksContainer.appendChild(btn);
    });

    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (voteButton) {
        voteButton.textContent = currentUser && userVotes.has(game.nombre) ? 'Quitar voto' : 'Votar';
    }
}

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

function closePopup() {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
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

// Manejo del botón de voto (en este caso, solo quitar)
if (voteButton) {
    voteButton.addEventListener('click', async () => {
        if (!currentUser || !currentGame) return;

        const gameName = currentGame.nombre;
        const userId = currentUser.uid;

        if (!userVotes.has(gameName)) return;

        try {
            await removeVote(userId, gameName);
            userVotes.delete(gameName);

            // Elimina el juego de la lista local
            votedGames = votedGames.filter(g => g.nombre !== gameName);

            closePopup();
            renderGames(votedGames);
        } catch (error) {
            console.error('Error al quitar voto:', error);
            alert('No se pudo quitar el voto. Intenta nuevamente.');
        }
    });
}
