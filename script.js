const map = L.map('map').setView([40.939, 24.412], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const sidebar = L.control.sidebar({
  autopan: true,
  container: 'sidebar',
  position: 'right'
}).addTo(map);

const devices = ['karouli1'];
const markers = {};
const deviceNames = {}; // αποθηκεύει προσωρινά τα ονόματα που δίνει ο χρήστης

<<<<<<< HEAD
devices.forEach(deviceId => {
  fetch(`https://arduino-backend-tbdm.onrender.com/get?device=${deviceId}`)
    .then(response => response.json())
    .then(data => {
      console.log("📡 Λήφθηκαν δεδομένα για karouli1:", data);
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
=======
function createMarker(deviceId, data) {
  const icon = L.icon({
    iconUrl: data.state === 'ON'
      ? 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png'
      : 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const marker = L.marker([data.lat, data.lng], { icon }).addTo(map);
  marker.bindPopup(deviceNames[deviceId] || deviceId);
  marker.on('click', () => openSidebar(deviceId, data));
  markers[deviceId] = marker;
}

function openSidebar(deviceId, data) {
  const name = deviceNames[deviceId] || deviceId;

  document.getElementById('device-info').innerHTML = `
    <p><strong>Όνομα:</strong> <span id="display-name">${name}</span></p>
    <input id="rename-input" type="text" placeholder="Νέο όνομα" style="width: 90%" />
    <button onclick="renameDevice('${deviceId}')">Μετονομασία</button>
    <hr>
    <p><strong>Κατάσταση:</strong> <span id="status">${data.state}</span></p>
    <p><strong>Συντεταγμένες:</strong> ${data.lat}, ${data.lng}</p>
    <p><strong>Δορυφόροι:</strong> ${data.sats}</p>
    <p><strong>Τελευταία ενημέρωση:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
    <button onclick="refreshDevice('${deviceId}')">Ανανέωση</button>
    <button onclick="toggleState('${deviceId}')">Αλλαγή κατάστασης</button>
  `;

  sidebar.open('info');
}

function renameDevice(deviceId) {
  const newName = document.getElementById('rename-input').value.trim();
  if (newName.length > 0) {
    deviceNames[deviceId] = newName;
    refreshDevice(deviceId); // ανανεώνει το popup marker
  }
}
>>>>>>> a9d2ae0 (Βελτιώσεις στο UI αλλαγή χρώματος marker & μετονομασία)

function refreshDevice(deviceId) {
  fetch(`https://arduino-backend-tbdm.onrender.com/get?device=${deviceId}`)
    .then(res => res.json())
    .then(data => {
      const icon = L.icon({
        iconUrl: data.state === 'ON'
          ? 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png'
          : 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      if (!markers[deviceId]) {
        createMarker(deviceId, data);
      } else {
        markers[deviceId].setLatLng([data.lat, data.lng]);
        markers[deviceId].setIcon(icon);
        markers[deviceId].setPopupContent(deviceNames[deviceId] || deviceId);
      }

      openSidebar(deviceId, data);
    })
    .catch(err => console.error('Σφάλμα ανανέωσης:', err));
}

function toggleState(deviceId) {
  fetch(`https://arduino-backend-tbdm.onrender.com/get?device=${deviceId}`)
    .then(res => res.json())
    .then(currentData => {
      const newState = currentData.state === 'ON' ? 'OFF' : 'ON';

      return fetch('https://arduino-backend-tbdm.onrender.com/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: deviceId,
          lat: currentData.lat,
          lng: currentData.lng,
          sats: currentData.sats,
          state: newState
        })
      });
    })
    .then(() => refreshDevice(deviceId))
    .catch(err => console.error('Σφάλμα αλλαγής κατάστασης:', err));
}

// Αρχική φόρτωση
devices.forEach(deviceId => refreshDevice(deviceId));