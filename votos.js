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
const db = firebase.firestore();

let chartInstance = null; // para destruir si existe

async function cargarDatos() {
  const snapshot = await db.collection('votes').get();
  const votos = [];
  let total = 0;
  snapshot.forEach(doc => {
    const count = doc.data().count || 0;
    votos.push({ nombre: doc.id, votos: count });
    total += count;
  });

  // Filtrar solo juegos con votos > 0
  const votosConDatos = votos.filter(j => j.votos > 0);

  // Ordenar y tomar top 10
  votosConDatos.sort((a, b) => b.votos - a.votos);
  const top10 = votosConDatos.slice(0, 10);

  const tbody = document.getElementById('rankingBody');
  tbody.innerHTML = '';

  if (total === 0 || top10.length === 0) {
    // Sin datos: Mostrar fila única y mensaje en gráfica
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; font-style: italic; color: #aaa;">
          Sin datos para evaluar
        </td>
      </tr>
    `;

    // Mostrar mensaje en lugar de gráfica
    const chartContainer = document.getElementById('voteChart').parentElement;
    chartContainer.innerHTML = '<p style="color:#aaa; text-align:center; margin-top: 50px; font-size: 1.2rem;">Sin datos para evaluar</p>';

    // Destruir gráfica anterior si existe
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    return;
  } else {
    // Si hay datos, asegurarse de que el contenedor tiene el canvas
    const chartContainer = document.getElementById('voteChart').parentElement;
    if (!document.getElementById('voteChart')) {
      chartContainer.innerHTML = '<canvas id="voteChart" width="400" height="400"></canvas>';
    }
  }

  // Mostrar tabla con % calculado
  top10.forEach((juego, i) => {
    const percent = ((juego.votos / total) * 100).toFixed(1) + '%';
    const row = `<tr>
          <td>#${i + 1}</td>
          <td>${juego.nombre}</td>
          <td>${juego.votos}</td>
          <td>${percent}</td>
        </tr>`;
    tbody.innerHTML += row;
  });

  const labels = top10.map(j => j.nombre);
  const data = top10.map(j => j.votos);
  const colores = [
    '#FF6384', '#36A2EB', '#FFCE56', '#8BC34A', '#FF9800',
    '#9C27B0', '#00BCD4', '#E91E63', '#CDDC39', '#795548'
  ];

  // Destruir gráfica anterior para evitar superposiciones
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(document.getElementById('voteChart'), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colores,
        borderColor: '#303030',
        borderWidth: 8,
        borderRadius: 10
      }]
    },
    options: {
      cutout: '60%',
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      }
    }
  });
}

window.onload = cargarDatos;
