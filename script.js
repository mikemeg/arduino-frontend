const map = L.map('map').setView([40.939, 24.412], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const sidebar = L.control.sidebar({
  autopan: true,
  container: 'sidebar',
  position: 'right'
}).addTo(map);

const devices = ['karouli1']; // Μπορείς να προσθέσεις περισσότερα IDs εδώ

devices.forEach(deviceId => {
  fetch(`https://arduino-backend-tbdm.onrender.com/get?device=${deviceId}`)
    .then(response => response.json())
    .then(data => {
      if (data.lat && data.lng) {
        const marker = L.marker([data.lat, data.lng]).addTo(map);
        marker.on('click', () => {
          document.getElementById('device-info').innerHTML = `
            <p><strong>Συσκευή:</strong> ${deviceId}</p>
            <p><strong>Κατάσταση:</strong> ${data.state}</p>
            <p><strong>Συντεταγμένες:</strong> ${data.lat}, ${data.lng}</p>
            <p><strong>Δορυφόροι:</strong> ${data.sats}</p>
            <p><strong>Τελευταία ενημέρωση:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            <button onclick="refreshDevice('${deviceId}')">Ανανέωση</button>
            <button onclick="toggleState('${deviceId}', '${data.state}')">${data.state === 'ON' ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}</button>
          `;
          sidebar.open('info');
        });
      }
    })
    .catch(error => console.error('Σφάλμα κατά την ανάκτηση δεδομένων:', error));
});

function refreshDevice(deviceId) {
  fetch(`https://arduino-backend-tbdm.onrender.com/get?device=${deviceId}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('device-info').innerHTML = `
        <p><strong>Συσκευή:</strong> ${deviceId}</p>
        <p><strong>Κατάσταση:</strong> ${data.state}</p>
        <p><strong>Συντεταγμένες:</strong> ${data.lat}, ${data.lng}</p>
        <p><strong>Δορυφόροι:</strong> ${data.sats}</p>
        <p><strong>Τελευταία ενημέρωση:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
        <button onclick="refreshDevice('${deviceId}')">Ανανέωση</button>
        <button onclick="toggleState('${deviceId}', '${data.state}')">${data.state === 'ON' ? 'Απενεργοποίηση' : 'Ενεργοποίηση'}</button>
      `;
    })
    .catch(error => console.error('Σφάλμα κατά την ανανέωση δεδομένων:', error));
}

function toggleState(deviceId, currentState) {
  const newState = currentState === 'ON' ? 'OFF' : 'ON';
  fetch('https://arduino-backend-tbdm.onrender.com/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      device: deviceId,
      state: newState
    })
  })
    .then(response => response.json())
    .then(() => {
      refreshDevice(deviceId);
    })
    .catch(error => console.error('Σφάλμα κατά την αλλαγή κατάστασης:', error));
}
