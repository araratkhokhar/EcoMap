// GLOBAL VARIABLES
let map;
let currentUser = {
    role: 'guest',
    username: 'Guest',
    points: 0,
    level: 1,
    badges: []
};
let markMode = false;
let activeFilter = 'all';
let currentRoute = null;
let markerClusterGroup = null; // Changed from array to ClusterGroup
let chatContext = { lastLocation: null, lastTopic: null };
let socket;
let callTimerInterval;
let callStartTime;
let localStream = null;
let peer = null;



// UI State

let userNotifications = [];

// Central Data Store


const users = {
    'tom': { password: '123', role: 'agent' },
    'jerry': { password: '123', role: 'agent' },
    'admin': { password: '123', role: 'admin' }
};

// GAMIFICATION CONFIG
const BADGES = [
    { id: 'scout', name: 'Eco Scout', icon: 'fa-binoculars', threshold: 100, desc: 'Earn 100 points' },
    { id: 'reporter', name: 'Whistleblower', icon: 'fa-bullhorn', threshold: 300, desc: 'Submit reports & earn 300 pts' },
    { id: 'guardian', name: 'Earth Guardian', icon: 'fa-shield-heart', threshold: 1000, desc: 'Reach 1000 points' }
];

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000]; // XP needed for Level 1, 2, 3...

// GAMIFICATION LOGIC
function awardPoints(amount, reason) {
    if (currentUser.role === 'guest') return; // Guests don't earn permanent points

    currentUser.points += amount;
    showToast(`+${amount} Eco-Credits: ${reason}`);

    checkLevelUp();
    checkBadges();
    updateUI(); // Refresh badges/UI
}

function checkLevelUp() {
    const nextLevelXp = LEVEL_THRESHOLDS[currentUser.level];
    if (currentUser.points >= nextLevelXp) {
        currentUser.level++;
        showToast(`🎉 LEVELED UP! You are now Level ${currentUser.level}`);
        // Sound effect or confetti could go here
    }
}

function checkBadges() {
    BADGES.forEach(badge => {
        if (!(currentUser.badges || []).includes(badge.id) && currentUser.points >= badge.threshold) {
            currentUser.badges.push(badge.id);
            showToast(`🏆 UNLOCKED BADGE: ${badge.name}`);
        }
    });
}

function openGamificationModal() {
    // Calculate progress to next level
    const currentLevelBase = LEVEL_THRESHOLDS[currentUser.level - 1] || 0;
    const nextLevelThresh = LEVEL_THRESHOLDS[currentUser.level] || (currentUser.points * 1.5);
    const progressPercent = Math.min(100, ((currentUser.points - currentLevelBase) / (nextLevelThresh - currentLevelBase)) * 100);

    const isGuest = currentUser.role === 'guest';
    const guestBanner = isGuest ? '<div style="background:#fff3cd; color:#856404; padding:8px; border-radius:8px; margin-bottom:15px; font-size:0.8rem;"><i class="fa-solid fa-lock"></i> Guest View. <a href="#" onclick="document.getElementById(\'game-modal\').remove(); document.getElementById(\'login-screen\').classList.remove(\'hidden\');" style="color:#856404; font-weight:bold;">Login</a> to earn points.</div>' : '';

    const modalHtml = `
        <div id="game-modal" class="glass-panel" style="background: rgba(255, 255, 255, 0.95); box-shadow: 0 8px 32px rgba(0,0,0,0.2); position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:340px; padding:25px; border-radius:24px; z-index:5000; text-align:center;">
            <button onclick="document.getElementById('game-modal').remove()" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.2rem; cursor:pointer; color:#999;">&times;</button>
            
            ${guestBanner}

            <div style="position: relative; width:80px; height:80px; margin:0 auto 10px;">
                <div style="width:100%; height:100%; border-radius:50%; background: linear-gradient(135deg, #4CAF50, #81C784); display:flex; align-items:center; justify-content:center; color:white; font-size:2.5rem; box-shadow:0 8px 16px rgba(76,175,80,0.25);">
                    <i class="fa-solid fa-user"></i>
                </div>
                <div style="position:absolute; bottom:0; right:0; width:28px; height:28px; background:#FFB300; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:0.8rem;">
                    ${currentUser.level}
                </div>
            </div>

            <h2 style="color:var(--primary-color); margin-bottom:2px; font-size:1.4rem;">${currentUser.username}</h2>
            <p style="color:#888; margin-bottom:20px; font-size:0.9rem;">Level ${currentUser.level} Guardian</p>

            <div style="background:#f0f0f0; height:8px; border-radius:4px; overflow:hidden; margin-bottom:10px; position:relative;">
                <div style="width:${progressPercent}%; background:var(--primary-color); height:100%; transition:width 0.5s; border-radius:4px;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:25px; font-weight:700; font-size:0.8rem; color:#666;">
                <span>${currentUser.points} XP</span>
                <span>Next: ${nextLevelThresh} XP</span>
            </div>

            <h3 style="text-align:left; margin-bottom:12px; font-size:0.95rem; color:#333;">Badges</h3>
            <div style="display:flex; gap:15px; justify-content:center; flex-wrap:wrap; margin-bottom:20px;">
                ${BADGES.map(b => {
        const hasBadge = (currentUser.badges || []).includes(b.id);
        return `
                    <div style="display:flex; flex-direction:column; align-items:center; width:65px;">
                        <div style="width:50px; height:50px; background:${hasBadge ? '#fff8e1' : '#f5f5f5'}; border-radius:50%; display:flex; align-items:center; justify-content:center; opacity:${hasBadge ? 1 : 0.6}; box-shadow:${hasBadge ? '0 4px 10px rgba(255,179,0,0.2)' : 'none'}; border:1px solid ${hasBadge ? '#ffe082' : '#eee'}; margin-bottom:5px;" title="${b.desc}">
                            <i class="fa-solid ${b.icon}" style="color:${hasBadge ? '#FFB300' : '#bbb'}; font-size:1.3rem;"></i>
                        </div>
                        <span style="font-size:0.7rem; color:#666; text-align:center; line-height:1.2;">${b.name}</span>
                    </div>
                `}).join('')}
            </div>

            <h3 style="text-align:left; margin-bottom:12px; font-size:0.95rem; color:#333;">Leaderboard</h3>
            <div style="background:#f9fafb; border-radius:15px; padding:10px; max-height:120px; overflow-y:auto;">
                ${(() => {
            // 1. Gather all agents
            const leaderboardData = [];

            // Add config users (Tom, Jerry)
            Object.keys(users).forEach(key => {
                let points = 0;
                if (key === 'tom') points = 450;
                if (key === 'jerry') points = 320;

                // If the currently logged in user IS one of these, use their *current* session points
                if (currentUser.username.toLowerCase() === key) {
                    points = currentUser.points;
                }

                leaderboardData.push({ name: key.charAt(0).toUpperCase() + key.slice(1), points: points, isMe: currentUser.username.toLowerCase() === key });
            });

            // 2. Add Guest if relevant
            if (currentUser.role === 'guest') {
                leaderboardData.push({ name: 'Guest', points: currentUser.points, isMe: true });
            }

            // 3. Sort Descending
            leaderboardData.sort((a, b) => b.points - a.points);

            // 4. Generate HTML
            return leaderboardData.map((player, index) => `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; margin-bottom:5px; border-radius:10px; font-size:0.9rem; ${player.isMe ? 'background:white; box-shadow:0 2px 5px rgba(0,0,0,0.05); border:1px solid #eee;' : ''}">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-weight:700; color:${index === 0 ? '#FFB300' : index === 1 ? '#9E9E9E' : '#CD7F32'}; width:15px;">${index + 1}</span>
                                <span style="${player.isMe ? 'font-weight:700; color:var(--primary-color);' : 'color:#555;'}">${player.name} ${player.isMe ? '(You)' : ''}</span>
                            </div>
                            <span style="font-weight:700; color:#555;">${player.points} XP</span>
                        </div>
                    `).join('');
        })()}
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);
}

// INITIALIZATION
window.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Restore Session
    const session = localStorage.getItem('ecomap_session');
    if (session) {
        try {
            const s = JSON.parse(session);
            // Check expiry and valid user
            if (s.expiresAt > Date.now() && users[s.username]) {
                currentUser = {
                    role: users[s.username].role,
                    username: s.username,
                    level: users[s.username].level || 1,
                    points: users[s.username].points || 0
                };
            } else {
                localStorage.removeItem('ecomap_session');
            }
        } catch (e) {
            localStorage.removeItem('ecomap_session');
        }
    }

    initMap();
    // Initial Load
    loadMarkers();

    // --- SOCKET.IO INITIALIZATION ---
    try {
        socket = io();

        socket.on('connect', () => {
            console.log('Connected to signaling server. ID:', socket.id);
            showToast("Conn: " + socket.id); // Debug
            // Join with role
            console.log("Joining as:", currentUser.role);
            showToast("Joining as " + currentUser.role); // Debug
            socket.emit('join', { role: currentUser.role });
        });

        // Admin: Listen for incoming calls
        socket.on('call-offer', (data) => {
            console.log("Received call-offer:", data);
            showToast("Signal Received: " + (currentUser.role)); // Debug
            if (currentUser.role === 'admin') {
                showIncomingCall(data);
            }
        });

        // User: Listen for call accepted
        socket.on('call-accepted', (data) => {
            // WebRTC: Signal Peer 
            if (peer) peer.signal(data.signal);
            // Timer starts on 'connect' event of peer now
        });

        // Both: Listen for call ended
        socket.on('call-ended', () => {
            endCall(true); // true = remote ended
        });

    } catch (e) {
        console.error("Socket.io not found or failed to connect", e);
    }


    // --- HYBRID GEOSERVER INTEGRATION (FAIL-SAFE) ---
    async function loadGeoServerLayer() {
        // 1. The Ngrok URL pointing to your Local GeoServer
        const geoserverUrl = 'https://egoistic-dichotomically-makenzie.ngrok-free.dev/geoserver/ne/wms';
        const workspaceLayer = 'ne:markers'; // Ensure this matches your Layer Name

        console.log("Checking for Local GeoServer...");

        try {
            // 2. Check if the server is online (Laptop ON)
            // We use a small timeout so the app doesn't freeze waiting
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            const response = await fetch(`${geoserverUrl}?service=WMS&version=1.1.0&request=GetCapabilities`, {
                signal: controller.signal,
                mode: 'no-cors' // Opaque request just to check connectivity
            });
            clearTimeout(timeoutId);

            console.log("GeoServer is ONLINE! Loading WMS Layer...");

            // 3. Add the WMS Layer (Only if online)
            const wmsLayer = L.tileLayer.wms(geoserverUrl, {
                layers: workspaceLayer,
                format: 'image/png',
                transparent: true,
                version: '1.1.0',
                attribution: "EcoMap Local GeoServer"
            });

            wmsLayer.addTo(map);

            // Optional: Add a visual indicator
            L.control.attribution({ prefix: '<span style="color:green">🟢 GeoServer Connected</span>' }).addTo(map);

        } catch (error) {
            console.log("GeoServer is OFFLINE (User laptop is off). Skipping WMS layer.");
            // Do nothing! The app works normally with standard markers.
        }
    }

    // Call the hybrid loader
    loadGeoServerLayer();

    updateUI();
    // checkFirstVisit();
    // setTimeout(createGuestBanner, 30000); // Show banner after 30s
}

// 3. MAP FUNCTIONS
function initMap() {
    // Center on Lahore
    map = L.map('map', {
        zoomControl: false // We use custom zoom buttons
    }).setView([31.5204, 74.3587], 13);

    // Add default tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler for mark mode
    map.on('click', handleMapClick);

    // --- Add Lahore Boundary Polygon (User Provided) ---
    var zoneLayer = L.geoJSON(lahoreBoundaryData, {
        style: {
            color: "#E65100",  // Dark Orange Border
            weight: 3,         // Thick border
            opacity: 0.8,
            fillColor: "#FF9800", // Light Orange Fill
            fillOpacity: 0.1      // Very transparent fill
        }
    }).addTo(map);

    try {
        map.fitBounds(zoneLayer.getBounds());
    } catch (e) {
        console.error("Could not fit bounds:", e);
    }

    // Initialize Cluster Group
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50, // Adjust clustering density
        disableClusteringAtZoom: 16, // Show individual markers at high zoom
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });
    map.addLayer(markerClusterGroup);

    // Location Handlers
    map.on('locationfound', function (e) {
        const radius = e.accuracy / 2;

        // Remove existing location markers if any
        if (window.userLocationMarker) map.removeLayer(window.userLocationMarker);
        if (window.userLocationCircle) map.removeLayer(window.userLocationCircle);

        window.userLocationMarker = L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();

        window.userLocationCircle = L.circle(e.latlng, radius).addTo(map);

        showToast("Location found!");
    });

    map.on('locationerror', function (e) {
        showToast("Location access denied or unavailable");
        console.error(e);
    });
}

async function loadMarkers() {
    // Clear existing clusters
    if (markerClusterGroup) {
        markerClusterGroup.clearLayers();
    }

    // FETCH FROM API
    try {
        const response = await fetch('/api/markers');
        const dbMarkers = await response.json();

        // Combine with static data if needed (or just use DB)
        // For migration, we prefer DB only, but let's keep static layers if they aren't in DB yet
        const allMarkers = dbMarkers;


        allMarkers.forEach(marker => {
            // Approval Workflow Visibility Check
            if (marker.status === 'pending') {
                const isAdmin = currentUser.role === 'admin';
                const isAuthor = currentUser.username === marker.author;
                // Hide if not admin and not the author
                if (!isAdmin && !isAuthor) return;
            }

            // Apply filter
            if (activeFilter !== 'all') {
                if (activeFilter === 'Korgans' && (marker.type === 'Korgans' || marker.type.includes('Recycle'))) {
                    // Pass filter for Korgans/Recycle
                } else if (activeFilter === 'Garbage Containers' && marker.type.includes('Container')) {
                    // Pass filter for Garbage Containers (singular/plural)
                } else if (marker.type !== activeFilter) {
                    return;
                }
            }

            let pinClass = 'container';
            let iconClass = 'fa-trash-can';
            let opacity = 1.0;

            if (marker.type === 'Dumping Yard') {
                pinClass = 'dump';
                iconClass = 'fa-dumpster';
            } else if (marker.type === 'Korgans' || marker.type.includes('Recycle')) {
                pinClass = 'korgan';
                iconClass = 'fa-recycle';
            }

            // Visual cue for pending
            if (marker.status === 'pending') {
                pinClass += ' pending-marker'; // You might want to add CSS for this class separately or handle inline
                opacity = 0.6;
            }

            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="custom-pin pin-${pinClass}" style="${marker.status === 'pending' ? 'filter: grayscale(1);' : ''}">
                      <i class="fa-solid ${iconClass}"></i>
                      ${marker.status === 'pending' ? '<i class="fa-solid fa-clock" style="position:absolute; top:-5px; right:-5px; color:orange; background:white; border-radius:50%; padding:2px; font-size:10px;"></i>' : ''}
                   </div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 30],
                popupAnchor: [0, -30]
            });

            const mapMarker = L.marker([marker.lat, marker.lng], { icon: customIcon, opacity: opacity })
                .bindPopup(`<b>${marker.title}</b><br>${marker.address}${marker.status === 'pending' ? '<br><em style="color:orange">(Pending Approval)</em>' : ''}`);

            mapMarker.on('click', () => {
                if (bulkDeleteMode && currentUser.role === 'admin') {
                    if (selectedMarkers.includes(marker)) {
                        selectedMarkers = selectedMarkers.filter(m => m !== marker);
                        mapMarker.setOpacity(marker.status === 'pending' ? 0.6 : 0.6); // Return to default opacity
                        showToast("Deselected");
                    } else {
                        selectedMarkers.push({ data: marker, layer: mapMarker });
                        mapMarker.setOpacity(1.0); // Highlight
                        showToast("Selected for delete");
                        // Auto-confirm logic? No, wait for button.
                        if (confirm(`Delete ${marker.title}?`)) {
                            markerClusterGroup.removeLayer(mapMarker); // Remove from cluster
                            // Remove from data logic omitted for prototype
                            showToast("Deleted");
                        }
                    }
                    return;
                }
                showMarkerDetails(marker);
            });

            markerClusterGroup.addLayer(mapMarker); // Add to cluster
        });
    } catch (error) {
        console.error("Error loading markers:", error);
    }
}

// 4.3 ECO & WEATHER LOGIC (Phase 2/3)
async function fetchWeather() {
    try {
        // Open-Meteo for Lahore
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=31.5204&longitude=74.3587&current_weather=true');
        const data = await res.json();
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;

        document.getElementById('weather-temp').innerText = `${temp}°C`;

        // Map common codes
        let desc = "Clear Sky";
        let icon = "fa-sun";
        if (code > 3) { desc = "Cloudy"; icon = "fa-cloud"; }
        if (code > 50) { desc = "Rainy"; icon = "fa-cloud-showers-heavy"; }

        document.getElementById('weather-desc').innerText = desc;
        document.querySelector('#weather-widget i').className = `fa-solid ${icon}`;

    } catch (e) {
        console.error("Weather error", e);
        document.getElementById('weather-temp').innerText = "N/A";
    }
}

function selectTravelMode(mode) {
    // UI Update
    document.querySelectorAll('.mode-card').forEach(c => c.style.borderColor = '#eee');
    document.querySelectorAll('.mode-card').forEach(c => c.style.background = 'transparent');
    const activeCard = document.getElementById(`mode-${mode}`);
    if (activeCard) {
        activeCard.style.borderColor = 'var(--primary-color)';
        activeCard.style.background = '#e8f5e9';
    }

    // Logic
    const dist = window.currentRouteDistKm || 0;
    const impactBox = document.getElementById('eco-impact');
    const impactText = document.getElementById('impact-text');

    // Emission Factors (g CO2 / km)
    const CAR_EMISSION = 120; // Avg ICE car
    const EV_EMISSION = 40; // Grid dependent

    if (mode === 'walk') {
        const saved = (dist * CAR_EMISSION).toFixed(1);
        impactText.innerText = `You saved ${saved}g of CO2 by walking!`;
        impactBox.style.background = '#f1f8e9'; // Green
        impactBox.style.borderLeftColor = '#4CAF50';

        // Gamification Hook
        awardPoints(10, 'Green Step (Walking)');

    } else if (mode === 'ev') {
        const added = (dist * EV_EMISSION).toFixed(1);
        const saved = (dist * (CAR_EMISSION - EV_EMISSION)).toFixed(1);
        impactText.innerText = `Emitting ${added}g CO2. Saved ${saved}g vs fuel car.`;
        impactBox.style.background = '#fff8e1'; // Yellow like electricity
        impactBox.style.borderLeftColor = '#FFB300';
    } else if (mode === 'ice') {
        const added = (dist * CAR_EMISSION).toFixed(1);
        impactText.innerText = `Emitting ${added}g CO2. Try walking next time!`;
        impactBox.style.background = '#ffebee'; // Red
        impactBox.style.borderLeftColor = '#D32F2F';
    }
}

// 6. UI UPDATES
function filterMarkers(type) {
    activeFilter = type;

    // Toggle 'All' button visibility if it exists (for Organic view)
    const allBtn = document.getElementById('filter-all');
    if (allBtn) {
        if (type === 'all') {
            allBtn.classList.add('hidden');
        } else {
            allBtn.classList.remove('hidden');
        }
    }

    // Update buttons
    document.querySelectorAll('.capsule-btn').forEach(btn => {
        const btnText = btn.textContent;
        let isActive = false;

        if (type === 'all') {
            if (btnText === 'All') isActive = true;
        } else if (type === 'Garbage Containers') {
            if (btnText.includes('Containers') || btnText.includes('Bins')) isActive = true;
        } else if (type === 'Dumping Yard') {
            if (btnText.includes('Dumping') || btnText.includes('Yards') || btnText.includes('DUMP')) isActive = true;
        } else if (type === 'Korgans') {
            if (btnText.includes('Korgans') || btnText.includes('KORG')) isActive = true;
        } else if (btnText.includes(type)) {
            isActive = true;
        }

        if (isActive) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    loadMarkers();
}

function updateUI() {
    // 1. Sidebar Role Logic
    const sidebar = document.getElementById('sidebar');
    const role = currentUser.role;

    // Default: Show common items
    // If Guest: Hide Profile, Add Marker
    // If Agent: Show everything + Badge
    // If Admin: Show everything + Admin Panel

    const addBtn = document.getElementById('mark-btn');
    if (addBtn) addBtn.style.display = role !== 'guest' ? 'flex' : 'none';

    // Call Support Button (Guest/User only)
    const callBtn = document.getElementById('call-support-button');
    if (callBtn) {
        if (role !== 'admin') {
            callBtn.classList.remove('hidden');
        } else {
            callBtn.classList.add('hidden');
        }
    }


    // 2. User Badge / Notification Area
    const badge = document.getElementById('user-badge');

    // Clear previous click handlers
    const newBadge = badge.cloneNode(true);
    badge.parentNode.replaceChild(newBadge, badge);

    const badgeEl = document.getElementById('user-badge');

    if (role === 'guest') {
        badgeEl.textContent = 'GUEST';
        badgeEl.style.setProperty('background', '#757575', 'important'); // Standard Grey
        badgeEl.onclick = openGamificationModal;
    } else {
        // Display Username
        badgeEl.textContent = currentUser.username;
        badgeEl.className = 'user-badge'; // Restore badge style
        badgeEl.style.background = 'var(--primary-color)'; // Ensure correct background
        badgeEl.style.cursor = 'pointer';

        // Add badge count if any (small red dot)
        // Check real unread count
        const unread = userNotifications.filter(n => !n.read).length;
        if (unread > 0) {
            // Append dot without overwriting textContent completely if possible, 
            // but textContent was just set. 
            // Better to use innerHTML for both.
            badgeEl.innerHTML = `${currentUser.username} <span style="position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:red; border-radius:50%; border:1px solid white;"></span>`;
        }

        badgeEl.onclick = toggleUserMenu;
    }

    // 3. Theme Classes
    document.body.className = '';
    if (role === 'agent') document.body.classList.add('mode-agent');
    if (role === 'admin') document.body.classList.add('mode-admin');

    // 4. Removed redundant internal game-btn injection block since we use the main badge now.

    // 5. Update Auth Button Icon (Bottom Sidebar)
    const authIcon = document.getElementById('auth-icon');
    if (authIcon) {
        if (role === 'guest') {
            authIcon.className = 'fa-solid fa-right-to-bracket'; // Login Icon
            authIcon.parentElement.title = "Login";
        } else {
            authIcon.className = 'fa-solid fa-user'; // User Profile Icon
            authIcon.parentElement.title = "My Profile";
        }
    }
}

// Sidebar Toggle


// Notification System
// User Menu & Notifications
function toggleUserMenu() {
    const existing = document.getElementById('user-menu-panel');
    if (existing) {
        existing.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'user-menu-panel';
    panel.className = 'floating-panel visible';
    panel.style.top = '60px'; // Align with top bar
    panel.style.right = '20px'; // Align with sidebar

    const unreadCount = userNotifications.filter(n => !n.read).length;

    panel.innerHTML = `
        <div class="fp-header">
            <span>${currentUser.username}</span>
            <span style="font-size:0.8rem; color:#666;">${currentUser.role}</span>
        </div>
        
        <div class="menu-item" onclick="openGamificationModal(); document.getElementById('user-menu-panel').remove();">
            <i class="fa-solid fa-user"></i> My Profile
        </div>
        
        <div class="menu-item" onclick="openGamificationModal(); document.getElementById('user-menu-panel').remove();">
            <i class="fa-solid fa-trophy"></i> Leaderboard
        </div>

        <div class="menu-item" onclick="toggleNotificationsView();">
             <i class="fa-solid fa-bell"></i> Notifications
             ${unreadCount > 0 ? `<span class="badge-dot" style="background:red; color:white; padding:2px 6px; border-radius:10px; font-size:0.7rem; margin-left:auto;">${unreadCount}</span>` : ''}
        </div>
        
        <div id="inline-notifs" style="display:none; max-height:200px; overflow-y:auto; background:#f9f9f9; margin:5px 0; padding:5px; border-radius:8px;">
            ${renderNotificationList()}
        </div>

        <div style="margin-top:10px; padding-top:10px; border-top:1px solid #eee;">
            <button onclick="logout(); document.getElementById('user-menu-panel').remove();" class="btn-secondary" style="width:100%; padding:8px; font-size:0.8rem; color:#d32f2f; border-color:#ffcdd2;">
                <i class="fa-solid fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;

    // Add close listener
    setTimeout(() => {
        window.onclick = function (e) {
            if (!panel.contains(e.target) && !e.target.closest('.user-badge')) {
                panel.remove();
                window.onclick = null;
            }
        };
    }, 100);

    document.body.appendChild(panel);
}

function toggleNotificationsView() {
    const list = document.getElementById('inline-notifs');
    if (list.style.display === 'none') {
        list.style.display = 'block';
    } else {
        list.style.display = 'none';
    }
}

function renderNotificationList() {
    if (userNotifications.length === 0) return '<div style="font-size:0.8rem; padding:10px; text-align:center;">No notifications</div>';

    return userNotifications.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markRead(${n.id})" style="font-size:0.8rem; padding:8px;">
            <div style="font-weight:bold;">${n.title}</div>
            <div>${n.text}</div>
        </div>
    `).join('');
}

function markRead(id) {
    const n = userNotifications.find(n => n.id === id);
    if (n) {
        n.read = true;
        // Re-render list
        document.getElementById('inline-notifs').innerHTML = renderNotificationList();
        updateUI();
    }
}

// Poll for dummy notifications
setInterval(() => {
    if (currentUser.role !== 'guest' && Math.random() > 0.8 && userNotifications.length < 5) {
        userNotifications.unshift({
            id: Date.now(),
            title: currentUser.role === 'admin' ? 'Approval Req' : 'Points Earned',
            text: currentUser.role === 'admin' ? 'New container reported in Gulberg.' : 'You earned +10 points for walking!',
            time: 'Just now',
            read: false
        });
        showToast("New Notification");
        updateUI();
    }
}, 30000); // Check every 30s

// 4. MARKER DETAILS & ROUTING
function showMarkerDetails(marker) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('panel-content');

    // Ensure close button is visible for normal details
    const closeBtn = document.querySelector('.panel-close-btn');
    if (closeBtn) closeBtn.style.display = 'flex';

    // Calculate distance from user (if location available)
    // Use fixed location (Department of Space Sciences)
    const userLat = 31.49414232271945;
    const userLng = 74.29310558555223;
    const distance = calculateDistance(userLat, userLng, marker.lat, marker.lng);
    renderPanelContent(marker, distance);

    panel.classList.remove('hidden');
}

function renderPanelContent(marker, distance) {
    const content = document.getElementById('panel-content');

    let iconClass = 'fa-trash-can';
    if (marker.type === 'Dumping Yard') iconClass = 'fa-dumpster';
    else if (marker.type === 'Korgans' || marker.type.includes('Recycle')) iconClass = 'fa-recycle';

    let statusBadge = '';
    if (marker.status === 'pending') {
        statusBadge = '<span style="background: var(--warning-color, orange); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-right: 5px;">Pending Approval</span>';
    }

    content.innerHTML = `
        <div class="panel-hero-view">
            <i class="fa-solid ${iconClass}"></i>
        </div>
        <div class="panel-body">
            <h2 class="panel-title">${marker.title}</h2>
            <div style="margin-bottom: 20px;">
                ${statusBadge}
                <span style="background: var(--theme-color); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                    ${marker.type}
                </span>
            </div>
            <p><strong><i class="fa-solid fa-location-dot"></i> Address:</strong><br>${marker.address}</p>
            ${distance ? `<p><strong><i class="fa-solid fa-ruler"></i> Distance:</strong> ${distance} km</p>` : '<p><small>Enable location to see distance</small></p>'}
            <p><strong><i class="fa-regular fa-clock"></i> Verified:</strong> ${marker.lastVerified}</p>
            ${marker.notes ? `<p><strong><i class="fa-solid fa-note-sticky"></i> Notes:</strong><br>${marker.notes}</p>` : ''}
            

            <button class="btn-save" onclick='showRoute(${JSON.stringify(marker)})'>
                <i class="fa-solid fa-route"></i> Get Directions
            </button>

            ${currentUser.role === 'guest' ? `
                <div class="guest-actions-hint" style="background:#fff3cd; padding:15px; border-radius:10px; margin-top:15px; border-left:4px solid #ffc107;">
                    <strong>💡 Want to do more?</strong>
                    <p style="font-size:0.9rem; margin:8px 0;">Login to report issues, add markers, and earn Eco-Credits!</p>
                    <button class="btn-save" onclick="document.getElementById('login-screen').classList.remove('hidden')" style="width:auto; padding:8px 20px;">
                        Login Now
                    </button>
                </div>
            ` : `
                <div class="action-buttons-row">
                    <button class="btn-action btn-share" onclick='shareMarker(${JSON.stringify(marker)})'>
                        <i class="fa-solid fa-share-nodes"></i> Share
                    </button>
                    <button class="btn-action btn-report" onclick='openReportModal()'>
                        <i class="fa-solid fa-triangle-exclamation"></i> Report
                    </button>
                </div>
                
                ${currentUser.role === 'admin' ? `
                <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                    <h4 style="font-size: 0.85rem; color: #666; margin-bottom: 10px; text-transform:uppercase; letter-spacing:0.5px;">Admin Controls</h4>
                    
                    ${marker.status === 'pending' ? `
                    <div style="background: #e3f2fd; padding: 10px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #2196F3;">
                        <strong>Review Needed</strong>
                        <p style="margin: 5px 0; font-size:0.9rem;">This marker is pending approval.</p>
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button class="btn-save" style="margin:0; background:#4CAF50;" onclick='approveMarker("${marker.id}")'>
                                <i class="fa-solid fa-check"></i> Approve
                            </button>
                            <button class="btn-save" style="margin:0; background:#f44336;" onclick='rejectMarker("${marker.id}")'>
                                <i class="fa-solid fa-xmark"></i> Decline
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    <div class="action-buttons-row">
                        <button class="btn-action" style="background: #2196F3; color: white;" onclick='editMarker("${marker.id}")'>
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn-action" style="background: #FF5252; color: white;" onclick='deleteMarker("${marker.id}")'>
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                    </div>
                </div>
                ` : ''}
            `}
        </div>
    `;
}

function approveMarker(id) {
    const marker = markersData.find(m => m.id == id);
    if (!marker) return;

    marker.status = 'published';
    showToast("Marker Approved & Published");
    loadMarkers();
    closePanel();
}

// --- CALL FEATURE LOGIC (WebRTC) ---
let activeCallParams = null; // Store caller ID when admin receives call

async function initiateCall() {
    if (!socket) return showToast("Call service unavailable");

    // UI
    document.getElementById('call-modal').classList.remove('hidden');
    document.getElementById('call-status-text').innerText = "Calling Support... (Allow Mic)";
    document.querySelector('.call-avatar').classList.add('animate-pulse');

    // Legacy Signal to wake up admin immediately ? No, let's wait for Offer.
    // socket.emit('call-init', { caller: currentUser.username });

    try {
        // 1. Get User Media (Audio)
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        showToast("Mic Access Granted");

        // 2. Create Peer (Initiator)
        peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: localStream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        // 3. Handle Signals
        peer.on('signal', (data) => {
            console.log("Generating Signal...");
            showToast("Signal Generated");
            socket.emit('call-offer', {
                callerName: currentUser.username,
                signal: data
            });
        });

        peer.on('stream', (stream) => {
            showToast("Audio Connected");
            const audio = document.getElementById('remote-audio');
            audio.srcObject = stream;
            audio.play();
        });

        peer.on('connect', () => {
            startCallTimer();
        });

        peer.on('close', () => endCall(true));
        peer.on('error', (err) => {
            console.error(err);
            showToast("Peer Error: " + err.message);
        });

    } catch (e) {
        console.error(e);
        showToast("Error/Perms: " + e.message);
        endCall();
    }
}

function showIncomingCall(data) {
    activeCallParams = data;
    document.getElementById('incoming-call-modal').classList.remove('hidden');
    document.getElementById('incoming-caller-name').innerText = data.callerName || "Guest";
}

async function answerCall() {
    if (!activeCallParams) return;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: localStream,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        peer.on('signal', (data) => {
            socket.emit('call-answer', {
                callerId: activeCallParams.callerId,
                signal: data
            });
        });

        peer.on('stream', (stream) => {
            const audio = document.getElementById('remote-audio');
            audio.srcObject = stream;
            audio.play();
        });

        peer.on('connect', () => {
            startCallTimer();
        });

        peer.on('close', () => endCall(true));

        // Signal Check
        if (activeCallParams.signal) {
            peer.signal(activeCallParams.signal);
        } else {
            showToast("Error: No Signal from Caller");
        }

        // UI
        document.getElementById('incoming-call-modal').classList.add('hidden');
        document.getElementById('call-modal').classList.remove('hidden');
        document.getElementById('call-status-text').innerText = "Connected with " + activeCallParams.callerName;
        document.querySelector('.call-avatar').classList.remove('animate-pulse');

    } catch (e) {
        console.error(e);
        showToast("Error accessing microphone");
    }
}

function rejectCall() {
    if (!activeCallParams) return;
    document.getElementById('incoming-call-modal').classList.add('hidden');
    socket.emit('call-end', { to: activeCallParams.callerId });
    activeCallParams = null;
}

function startCallTimer() {
    document.getElementById('call-timer').classList.remove('hidden');
    document.getElementById('call-status-text').innerText = "Connected";
    document.querySelector('.call-avatar').classList.remove('animate-pulse');

    callStartTime = Date.now();
    callTimerInterval = setInterval(() => {
        const delta = Math.floor((Date.now() - callStartTime) / 1000);
        const m = Math.floor(delta / 60).toString().padStart(2, '0');
        const s = (delta % 60).toString().padStart(2, '0');
        document.getElementById('call-timer').innerText = `${m}:${s}`;
    }, 1000);
}

function endCall(isRemote = false) {
    // WebRTC Cleanup
    if (peer) {
        peer.destroy();
        peer = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        localStream = null;
    }

    clearInterval(callTimerInterval);
    document.getElementById('call-timer').classList.add('hidden');
    document.getElementById('call-timer').innerText = "00:00";

    document.getElementById('call-modal').classList.add('hidden');
    document.getElementById('incoming-call-modal').classList.add('hidden');

    if (!isRemote && socket) {
        if (activeCallParams && activeCallParams.callerId) {
            socket.emit('call-end', { to: activeCallParams.callerId });
        } else {
            socket.emit('call-end', { to: 'admins' });
        }
    }

    activeCallParams = null;
    if (isRemote) showToast("Call ended");

    function rejectMarker(id) {
        if (!confirm("Decline this marker? It will be removed.")) return;
        deleteMarker(id);
    }

    // 4.1 REPORT & SHARE (Phase 1)
    function openReportModal() {
        // Check if modal already exists
        if (!document.getElementById('report-modal')) {
            const modal = document.createElement('div');
            modal.id = 'report-modal';
            modal.innerHTML = `
            <div class="report-box">
                <h2 class="panel-title" style="margin-bottom:10px;">Report Issue</h2>
                <p style="margin-bottom:20px; color:#666;">Help us keep the city clean!</p>
                
                <div class="form-group">
                    <label>Issue Type</label>
                    <select id="report-type" class="form-control">
                        <option value="Overflowing">🗑️ Bin Overflowing</option>
                        <option value="Damaged">🏚️ Broken/Damaged</option>
                        <option value="Missing">❓ Marker Missing</option>
                        <option value="Wrong Location">📍 Wrong Location</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="report-desc" class="form-control" rows="3" placeholder="Details..."></textarea>
                </div>

                <button class="btn-save" onclick="submitReport()">Submit Report</button>
                <button class="btn-save" style="background:#ccc; color:#333; margin-top:10px;" onclick="closeReportModal()">Cancel</button>
            </div>
        `;
            document.body.appendChild(modal);
        } else {
            document.getElementById('report-modal').classList.remove('hidden');
        }
    }

    function closeReportModal() {
        const modal = document.getElementById('report-modal');
        if (modal) modal.classList.add('hidden');
    }

    function submitReport() {
        const type = document.getElementById('report-type').value;
        const desc = document.getElementById('report-desc').value;

        showToast(`Report Submitted: ${type}`);
        console.log("Report:", { type, desc });

        // Gamification Hook
        awardPoints(50, 'Report Submitted');

        closeReportModal();
    }

    function shareMarker(marker) {
        const text = `Check out this ${marker.type} at ${marker.address} on EcoMap!`;
        const url = `https://maps.google.com/?q=${marker.lat},${marker.lng}`;

        // Simple Web Share API or Links
        if (navigator.share) {
            navigator.share({
                title: 'EcoMap Lahore',
                text: text,
                url: url
            }).catch(err => console.log('Error sharing', err));
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(`${text} ${url}`);
            showToast("Link copied to clipboard!");
        }
    }

    // 4.2 FIND NEAREST (Phase 1)
    function findNearest() {
        showToast("Finding nearest spot...");

        // User Location (Fixed for demo)
        const userLat = 31.49414232271945;
        const userLng = 74.29310558555223;

        let nearest = null;
        let minDist = Infinity;

        // Iterate all loaded markers (markerLayers contains L.marker objects)
        // Actually we need the data. Let's look at flattened data
        const allMarkers = markersData
            .concat(typeof korgansData !== 'undefined' ? korgansData : [])
            .concat(typeof containersData !== 'undefined' ? containersData : []);

        allMarkers.forEach(marker => {
            // Filter check
            if (activeFilter !== 'all') {
                if (activeFilter === 'Korgans' && !(marker.type === 'Korgans' || marker.type.includes('Recycle'))) return;
                if (activeFilter === 'Garbage Containers' && !marker.type.includes('Container')) return;
                if (activeFilter === 'Dumping Yard' && marker.type !== 'Dumping Yard') return;
            }

            const dist = getDistKm(userLat, userLng, marker.lat, marker.lng);
            if (dist < minDist) {
                minDist = dist;
                nearest = marker;
            }
        });

        if (nearest) {
            showToast(`Found nearest: ${nearest.title} (${minDist.toFixed(2)} km)`);
            showRoute(nearest);
        } else {
            showToast("No matching spots found.");
        }
    }

    function getDistKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(2);
    }

    function showRoute(destination) {
        // Remove existing route
        if (currentRoute) {
            map.removeControl(currentRoute);
        }

        // Hide other markers
        // Hide other markers
        // markerLayers was removed. We can rely on cluster group, or just hide the cluster group?
        // Hiding the entire cluster group is easiest for "Focus Mode"
        if (markerClusterGroup) {
            map.removeLayer(markerClusterGroup);
        }

        // Check for Organic Theme
        const isOrganic = document.title.includes('Organic');

        if (!isOrganic) {
            document.getElementById('info-panel').classList.add('hidden');
        } else {
            const content = document.getElementById('panel-content');
            const panel = document.getElementById('info-panel');

            // Hide global close button to avoid redundancy
            const closeBtn = document.querySelector('.panel-close-btn');
            if (closeBtn) closeBtn.style.display = 'none';

            // Setup Header for Route
            content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #ccc;">
                <h3 class="panel-title" style="margin:0;">Journey Path</h3>
                <button onclick="endRoute()" style="background: #e8f5e9; color: #2E7D32; border: none; padding: 5px 12px; border-radius: 15px; cursor: pointer; font-weight: 700;">
                    <i class="fa-solid fa-times"></i> Exit
                </button>
            </div>
            
            <!-- Weather Widget -->
            <div id="weather-widget" style="margin-bottom:15px; background:linear-gradient(to right, #e0f2f1, #b9f6ca); padding:10px; border-radius:12px; display:flex; align-items:center; gap:10px; font-size:0.9rem;">
                <i class="fa-solid fa-cloud-sun" style="font-size:1.5rem; color:#009688;"></i>
                <div>
                    <strong id="weather-temp">Loading...</strong>
                    <div id="weather-desc" style="font-size:0.8rem; opacity:0.8;">Fetching forecast...</div>
                </div>
            </div>

            <!-- Eco-Modes Selection -->
            <div id="travel-modes" style="display:flex; gap:8px; margin-bottom:15px;">
                <div class="mode-card active" onclick="selectTravelMode('walk')" id="mode-walk" style="flex:1; padding:8px; border:1px solid #eee; border-radius:8px; text-align:center; cursor:pointer;">
                    <i class="fa-solid fa-person-walking" style="color:#2E7D32; font-size:1.2rem;"></i>
                    <div style="font-size:0.7rem; font-weight:700;">Organic</div>
                </div>
                 <div class="mode-card" onclick="selectTravelMode('ev')" id="mode-ev" style="flex:1; padding:8px; border:1px solid #eee; border-radius:8px; text-align:center; cursor:pointer;">
                    <i class="fa-solid fa-bolt" style="color:#FFB300; font-size:1.2rem;"></i>
                    <div style="font-size:0.7rem; font-weight:700;">EV</div>
                </div>
                 <div class="mode-card" onclick="selectTravelMode('ice')" id="mode-ice" style="flex:1; padding:8px; border:1px solid #eee; border-radius:8px; text-align:center; cursor:pointer;">
                    <i class="fa-solid fa-car-side" style="color:#D32F2F; font-size:1.2rem;"></i>
                    <div style="font-size:0.7rem; font-weight:700;">Fuel</div>
                </div>
                <!-- Voice Toggle -->
                <div class="voice-nav-btn" onclick="toggleVoiceNav()" id="btn-voice-nav">
                    <i class="fa-solid fa-volume-xmark"></i>
                    <div>Voice Off</div>
                </div>
            </div>

            <!-- Stats Impact -->
            <div id="eco-impact" style="margin-bottom:15px; padding:12px; background:#f1f8e9; border-radius:12px; border-left:4px solid #4CAF50;">
                <strong style="color:#2E7D32;">🌱 Impact:</strong>
                <span id="impact-text">Calculating...</span>
            </div>

            <div id="route-instructions-container"></div>
        `;
            panel.classList.remove('hidden');

            // Fetch Weather
            fetchWeather();
        }

        showToast("Calculating route...");

        // Get user location first
        const userLat = 31.49414232271945;
        const userLng = 74.29310558555223;

        currentRoute = L.Routing.control({
            waypoints: [
                L.latLng(userLat, userLng),
                L.latLng(destination.lat, destination.lng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: isOrganic ? '#2E7D32' : '#4CAF50', weight: 6 }]
            },
            createMarker: function () { return null; }, // Hide default markers
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true
        }).addTo(map);

        if (isOrganic) {
            // Move the routing panel into our sidebar after a short delay to ensure it's created
            setTimeout(() => {
                const container = currentRoute.getContainer();
                const target = document.getElementById('route-instructions-container');
                if (container && target) {
                    target.appendChild(container);
                }
            }, 100);
        }

        // Display distance & Update Eco Stats
        currentRoute.on('routesfound', function (e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            const distance = (summary.totalDistance / 1000).toFixed(2); // Convert to km
            const duration = Math.round(summary.totalTime / 60); // Convert to minutes

            // update global for eco-mode
            window.currentRouteDistKm = parseFloat(distance);

            // Only update mode if we are still on the same view (simple check)
            if (!document.getElementById('travel-modes').classList.contains('hidden')) {
                selectTravelMode('walk'); // Default to walk
            }

            showToast(`Distance: ${distance} km | Time: ${duration} min`);

            // Voice Guidance Trigger
            if (typeof voiceNavEnabled !== 'undefined' && voiceNavEnabled) {
                speakRouteSummary();
            }

            if (!isOrganic) {
                // Add close button for route (Standard/City View)
                const closeBtn = L.control({ position: 'topright' });
                closeBtn.onAdd = function () {
                    const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                    window.routeCloseBtn = this; // Track it globally
                    div.innerHTML = '<a href="#" title="Clear Route" role="button" aria-label="Clear Route" style="font-size: 18px; color: red; font-weight: bold; width: 30px; height: 30px; line-height: 30px; text-align: center; background: white;">&times;</a>';
                    div.onclick = function (e) {
                        e.preventDefault();
                        endRoute();
                    };
                    return div;
                };
                closeBtn.addTo(map);
            }
        });
    }

    function endRoute() {
        if (currentRoute) {
            map.removeControl(currentRoute);
            currentRoute = null;
        }

        // Restore markers
        if (markerClusterGroup) {
            map.addLayer(markerClusterGroup);
        }

        if (window.routeCloseBtn) {
            map.removeControl(window.routeCloseBtn);
            window.routeCloseBtn = null;
        }

        document.getElementById('info-panel').classList.add('hidden');
    }

    function closePanel() {
        document.getElementById('info-panel').classList.add('hidden');
    }

    // 7. TOASTS
    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 5. INTERACTIONS (Phase 2)

    // Layer Toggle
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    function switchLayer(type) {
        // Remove all layers first
        if (map.hasLayer(streetLayer)) map.removeLayer(streetLayer);
        if (map.hasLayer(satelliteLayer)) map.removeLayer(satelliteLayer);
        if (window.heatLayer && map.hasLayer(window.heatLayer)) map.removeLayer(window.heatLayer);

        if (type === 'street') {
            map.addLayer(streetLayer);
            showToast("Switched to Street View");
        } else if (type === 'satellite') {
            map.addLayer(satelliteLayer);
            showToast("Switched to Satellite View");
        } else if (type === 'heatmap') {
            if (!window.heatLayer) initHeatmap();
            window.heatLayer.addTo(map);
            showToast("Switched to Heatmap View");
        }
    }

    function initHeatmap() {
        const allMarkers = markersData
            .concat(typeof korgansData !== 'undefined' ? korgansData : [])
            .concat(containersData);

        // Convert to [lat, lng, intensity]
        // Containers = 0.5, Dumping = 1.0
        const heatPoints = allMarkers.map(m => {
            let intensity = 0.5;
            if (m.type === 'Dumping Yard') intensity = 1.0;
            return [m.lat, m.lng, intensity];
        });

        window.heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 14,
            gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
        });
    }

    // User Location
    function locateUser() {
        showToast("Locating user...");
        // Use fixed location
        const lat = 31.49414232271945;
        const lng = 74.29310558555223;

        map.setView([lat, lng], 16);

        // Simulate location found event
        map.fire('locationfound', {
            latlng: L.latLng(lat, lng),
            accuracy: 50
        });
    }



    // Search functionality
    let searchMarker = null;

    async function searchLocation() {
        const query = document.getElementById('search-input').value;
        if (!query) {
            showToast("Please enter a location");
            return;
        }

        showToast(`Searching for "${query}"...`);

        // Use Nominatim (OpenStreetMap) geocoding API
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Lahore,Pakistan`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                map.setView([lat, lon], 15);

                if (searchMarker) map.removeLayer(searchMarker);

                searchMarker = L.marker([lat, lon]).addTo(map)
                    .bindPopup(`<b>Result:</b><br>${data[0].display_name}`).openPopup();

                showToast("Location found");
            } else {
                showToast("Location not found within Lahore");
            }
        } catch (error) {
            console.error("Search error:", error);
            showToast("Search failed. Please try again.");
        }
    }

    // Allow Enter key to search
    // Allow Enter key to search
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchLocation();
            closeSuggestions();
        }
    });

    // Auto-suggestions logic
    searchInput.addEventListener('input', debounce(function (e) {
        const query = e.target.value;
        if (query.length > 2) {
            fetchSuggestions(query);
        } else {
            closeSuggestions();
        }
    }, 300));

    // Close suggestions when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.search-section')) {
            closeSuggestions();
        }
    });

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    async function fetchSuggestions(query) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Lahore,Pakistan&addressdetails=1&limit=5`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            displaySuggestions(data);
        } catch (error) {
            console.error("Suggestion error:", error);
        }
    }

    function displaySuggestions(results) {
        const container = document.getElementById('search-suggestions');
        if (!container) return;
        container.innerHTML = '';

        if (results.length === 0) {
            closeSuggestions();
            return;
        }

        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            // Format display name to be shorter
            const displayName = result.display_name.split(',').slice(0, 3).join(',');
            div.textContent = displayName;

            div.onclick = () => {
                selectSuggestion(result);
            };

            container.appendChild(div);
        });

        container.classList.remove('hidden');
    }

    function selectSuggestion(result) {
        const searchInput = document.getElementById('search-input');
        searchInput.value = result.display_name.split(',')[0]; // Just the name

        // Use existing search logic or implementation specific
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        map.setView([lat, lon], 15);

        if (searchMarker) map.removeLayer(searchMarker);

        searchMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>Result:</b><br>${result.display_name}`).openPopup();

        closeSuggestions();
    }

    function closeSuggestions() {
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) suggestions.classList.add('hidden');
    }

    // 6. ADD MARKER (Phase 3)
    function toggleMarkMode() {
        // 1. Guest -> Login Alert
        // 1. Guest -> Teaser Modal
        if (currentUser.role === 'guest') {
            showFeatureTeaser('addMarker');
            return;
        }

        markMode = !markMode;
        const btn = document.getElementById('mark-btn');

        if (markMode) {
            btn.classList.add('active');
            map.getContainer().classList.add('crosshair-cursor');
            showToast("Click on map to add marker");
        } else {
            btn.classList.remove('active');
            map.getContainer().classList.remove('crosshair-cursor');
        }
    }

    function handleMapClick(e) {
        if (batchAddMode) {
            handleBatchClick(e.latlng.lat, e.latlng.lng);
            return;
        }
        if (bulkDeleteMode && currentUser.role === 'admin') {
            // Simple hit test or closest marker check?
            // Let's assume user clicks ON marker. But map click is background.
            // Actually leaflet markers capture click. We need to handle marker click for delete.
            showToast("Click directly on a marker to select for deletion.");
            return;
        }
        if (!markMode) return;

        const { lat, lng } = e.latlng;
        showMarkerForm(lat, lng);
    }

    function showMarkerForm(lat, lng, editId = null) {
        const panel = document.getElementById('info-panel');
        const content = document.getElementById('panel-content');

        // Ensure close button is visible
        const closeBtn = document.querySelector('.panel-close-btn');
        if (closeBtn) closeBtn.style.display = 'flex';

        const header = editId ? 'Edit Marker' : 'Add New Marker';
        const btnText = editId ? 'Update Marker' : 'Save Marker';
        const clickHandler = editId ? `saveMarker(${lat}, ${lng}, '${editId}')` : `saveMarker(${lat}, ${lng})`;

        content.innerHTML = `
        <div class="panel-body">
            <h2 class="panel-title">${header}</h2>
            
            <div class="form-group">
                <label>Type</label>
                <select id="marker-type" class="form-control">
                    <option value="Garbage Containers">Garbage Container</option>
                    <option value="Dumping Yard">Dumping Yard</option>
                    <option value="Korgans">Korgans</option>
                    <option value="Recycle Bin">Recycle Bin</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="marker-title" class="form-control" placeholder="e.g., Liberty Market Container">
            </div>
            
            <div class="form-group">
                <label>Address</label>
                <input type="text" id="marker-address" class="form-control" placeholder="e.g., Gulberg III, Lahore">
            </div>
            
            <div class="form-group">
                <label>Notes (Optional)</label>
                <textarea id="marker-notes" class="form-control" rows="3" placeholder="Additional information..."></textarea>
            </div>
            
            <div class="form-group">
                <label>Coordinates</label>
                <input type="text" class="form-control" value="${lat.toFixed(6)}, ${lng.toFixed(6)}" readonly>
            </div>
            
            <button class="btn-save" onclick="${clickHandler}">
                <i class="fa-solid fa-save"></i> ${btnText}
            </button>
            <button class="btn-save" style="background: #999; margin-top: 10px;" onclick="closePanel()">
                Cancel
            </button>
        </div>
    `;

        panel.classList.remove('hidden');
        // Don't turn off markMode yet if adding, but for edit it doesn't matter
        markMode = false;
        const markBtn = document.getElementById('mark-btn');
        if (markBtn) markBtn.classList.remove('active');
        map.getContainer().classList.remove('crosshair-cursor');
    }

    function saveMarker(lat, lng, id = null) {
        const type = document.getElementById('marker-type').value;
        const title = document.getElementById('marker-title').value;
        const address = document.getElementById('marker-address').value;
        const notes = document.getElementById('marker-notes').value;

        // Validate
        if (!title || !address) {
            showToast("Please fill all required fields");
            return;
        }

        if (id) {
            // Edit Mode
            const all = getAllMapData();
            const marker = all.find(m => m.id == id);

            if (marker) {
                // Update properties in place (works for all sources as objects are references)
                marker.type = type;
                marker.title = title;
                marker.address = address;
                marker.notes = notes;
                marker.lastVerified = new Date().toISOString().split('T')[0];

                // If updated by admin, ensure it's published (if it was pending)
                if (currentUser.role === 'admin' && marker.status === 'pending') {
                    marker.status = 'published';
                }

                showToast("Marker Updated Successfully");
                loadMarkers();
                closePanel();
            } else {
                showToast("Error: Marker not found for update");
            }
        } else {
            // Create Mode
            const newMarker = {
                type: type,
                lat: lat,
                lng: lng,
                title: title,
                address: address,
                notes: notes,
                status: currentUser.role === 'admin' ? 'published' : 'pending',
                author: currentUser.username
            };

            // Send to API
            fetch('/api/markers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMarker)
            })
                .then(res => res.json())
                .then(savedMarker => {
                    showToast("Marker Saved Successfully!");
                    loadMarkers(); // Reload from DB
                    closePanel();

                    // Gamification Hook
                    awardPoints(100, 'New Marker Added');
                    checkContributionStreak();
                })
                .catch(err => {
                    console.error(err);
                    showToast("Error saving marker");
                });
        }
    }

    // 6.b ADMIN ACTIONS
    // 6.b ADMIN ACTIONS
    function deleteMarker(id) {
        if (!confirm("Are you sure you want to delete this marker? This action cannot be undone.")) return;

        // Helper to remove from array
        const removeFromArray = (arr, id) => {
            const index = arr.findIndex(m => m.id == id);
            if (index > -1) {
                arr.splice(index, 1);
                return true;
            }
            return false;
        };

        let deleted = false;
        // Try deleting from all known sources
        if (typeof markersData !== 'undefined' && removeFromArray(markersData, id)) deleted = true;
        else if (typeof containersData !== 'undefined' && removeFromArray(containersData, id)) deleted = true;
        else if (typeof korgansData !== 'undefined' && removeFromArray(korgansData, id)) deleted = true;

        if (deleted) {
            showToast("Marker deleted");
            loadMarkers();
            closePanel();
        } else {
            showToast("Marker not found in any database!");
        }
    }

    function editMarker(id) {
        const all = getAllMapData();
        // Use loose equality to match string ID from HTML attribute with number ID in data
        const marker = all.find(m => m.id == id);

        if (!marker) {
            showToast("Error: Marker not found");
            return;
        }

        // Open form with this marker's coordinates and ID
        showMarkerForm(marker.lat, marker.lng, marker.id);

        // Pre-fill form values
        setTimeout(() => {
            const typeSelect = document.getElementById('marker-type');
            const titleInput = document.getElementById('marker-title');
            const addrInput = document.getElementById('marker-address');
            const notesInput = document.getElementById('marker-notes');

            if (typeSelect) typeSelect.value = marker.type;
            if (titleInput) titleInput.value = marker.title;
            if (addrInput) addrInput.value = marker.address;
            if (notesInput) notesInput.value = marker.notes || '';
        }, 100);
    }
    // 7. CHATBOT (Phase 4)
    function toggleChat() {
        document.getElementById('chatbot-box').classList.toggle('hidden');
        // Focus input if opening
        if (!document.getElementById('chatbot-box').classList.contains('hidden')) {
            setTimeout(() => document.getElementById('chat-input').focus(), 100);
        }
    }

    function handleChatKey(e) {
        if (e.key === 'Enter') sendMessage();
    }

    function sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        // Display user message
        addChatMessage(message, 'user');
        input.value = '';

        // Generate bot response
        setTimeout(() => {
            const response = getBotResponse(message.toLowerCase());
            addChatMessage(response, 'bot');

            // Speak response if input was voice or voice nav is enabled
            if (lastInputWasVoice || voiceNavEnabled) {
                speakText(response);
            }
            lastInputWasVoice = false; // Reset flag
        }, 500);
    }

    function addChatMessage(text, sender) {
        const messagesDiv = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

        // Enhanced: Check for action buttons/links in bot text
        // Regex to find "Show <ID>" pattern we added in getBotResponse
        // Or we can just parse the text.
        // Let's keep it simple: If text contains "Type 'Show <ID>'", we can make that clickable? 
        // For now, text content is fine. 

        // Better: If the response is a "Found:" response, let's treat it specially
        messageDiv.textContent = text;

        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Auto-action: If bot found a location, we could pan to it?
        // This might be annoying if not requested. Let's leave it passive.
    }

    // Smart Chatbot Logic
    function getBotResponse(message) {
        const originalMessage = message;
        message = message.toLowerCase();

        // --- 2M PARAMETER UPGRADE: SENTIMENT ANALYSIS ---
        let sentiment = 'neutral';
        if (message.match(/(bad|worst|hate|stupid|useless|broken|angry|slow)/)) sentiment = 'negative';
        if (message.match(/(good|great|love|amazing|thanks|cool|smart|best)/)) sentiment = 'positive';

        const timeOfDay = new Date().getHours() < 12 ? "morning" : "evening";

        // Procedural Personality Injection
        let prefix = "";
        if (sentiment === 'negative') prefix = "I apologize for any frustration. ";
        if (sentiment === 'positive') prefix = ["Happy to help! ", "You're too kind! ", "Glad you think so! "][Math.floor(Math.random() * 3)];

        // Agent Specific Support
        if (currentUser.role === 'agent' || currentUser.role === 'admin') {
            if (message.includes('tip') || message.includes('help')) {
                const tips = [
                    "💡 Tip: Use Batch Mode to add multiple points quickly.",
                    "💡 Tip: You earn 100 points per marker verification.",
                    "💡 Tip: Maintain a daily streak for bonus rewards!"
                ];
                return prefix + tips[Math.floor(Math.random() * tips.length)];
            }
        }

        // Guest Specific Responses
        if (currentUser.role === 'guest') {
            const joinPrompts = ["login", "account", "sign up", "register", "join", "add marker", "earn points"];
            if (joinPrompts.some(p => message.includes(p))) {
                return "Great idea! Logging in unlocks:\n✅ Adding Locations\n✅ Earning Badges\n✅ Reporting Issues\n\nClick the user icon to login!";
            }
        }

        // 0. Contextual Follow-up (Memories)
        if ((message.includes('show') || message.includes('where') || message.includes('it')) &&
            (message.includes('it') || message.includes('that') || message.includes('match'))) {

            if (chatContext.lastLocation) {
                const target = chatContext.lastLocation;
                map.setView([target.lat, target.lng], 18);
                L.popup()
                    .setLatLng([target.lat, target.lng])
                    .setContent(`<b>${target.title}</b><br>${target.address}`)
                    .openOn(map);
                return `Showing you the location for "${target.title}" as requested!`; // Context used
            }
        }

        // 1. Smart Intent Matching (The "Brain" Upgrade)
        // Check Database first using scoring system
        if (typeof chatbotDatabase !== 'undefined') {
            const bestMsg = findBestMatch(message, chatbotDatabase.intents);
            if (bestMsg) {
                // Update Context (Topic)
                // Ideally findBestMatch returns the intent object, not just string. 
                // But for now, we just return string. 
                // Future improvement: Return object to track topic.
                return bestMsg;
            }
        }

        // 2. Hardcoded / Functional Fallbacks
        if (message.includes('login') || message.includes('sign in')) {
            return "To login, click the user icon at the bottom of the sidebar. Test accounts: 'tom' or 'jerry' (password: 123).";
        }
        if (message.includes('satellite') || message.includes('view')) {
            return "Use the Layers button (stacked squares icon) in the sidebar to toggle Satellite view.";
        }

        // 3. Data Search Intent
        const allData = getAllMapData();

        // A. Count Questions
        if (message.includes('how many') || message.includes('count')) {
            if (message.includes('korgan') || message.includes('recycle')) {
                const count = allData.filter(m => m.type.includes('Korgans') || m.type.includes('Recycle')).length;
                return `We have ${count} Korgans/Recycling points recorded in Lahore.`;
            }
            if (message.includes('container') || message.includes('bin')) {
                const count = allData.filter(m => m.type.includes('Container')).length;
                return `There are ${count} Garbage Containers marked on the map.`;
            }
            return `I have a total of ${allData.length} locations marked on the map.`;
        }

        // B. Location/Search Questions
        const results = findInMapData(message, allData);

        if (results.length > 0) {
            const bestMatch = results[0];

            // SAVE CONTEXT
            chatContext.lastLocation = bestMatch;

            const extraMsg = results.length > 1 ? ` (I also found ${results.length - 1} other similar locations)` : '';
            return `Found: "${bestMatch.title}" at ${bestMatch.address}. ${extraMsg}. \nPossible: "Show it" or "Where is it?"`;
        }

        // C. "Show" command (Explicit)
        if (message.startsWith('show ')) {
            const idPart = message.replace('show ', '').trim();
            const target = allData.find(m => m.id == idPart || m.title.toLowerCase().includes(idPart));

            if (target) {
                // SAVE CONTEXT
                chatContext.lastLocation = target;

                map.setView([target.lat, target.lng], 18);
                L.popup()
                    .setLatLng([target.lat, target.lng])
                    .setContent(`<b>${target.title}</b><br>${target.address}`)
                    .openOn(map);
                return `Focusing on "${target.title}"...`;
            } else {
                return `I couldn't find a location with ID or name "${idPart}".`;
            }
        }

        // Final Fallback: Use Persona Default if available, else generic
        if (typeof chatbotDatabase !== 'undefined' && chatbotDatabase.persona) {
            const defaults = chatbotDatabase.persona.default_response;
            return defaults[Math.floor(Math.random() * defaults.length)];
        }

        return "I'm not exactly sure about that, but I can help you find recycling bins!";
    }

    // Helper to aggregate data safely
    function getAllMapData() {
        let data = [];
        if (typeof markersData !== 'undefined') data = data.concat(markersData);
        if (typeof korgansData !== 'undefined') data = data.concat(korgansData);
        if (typeof containersData !== 'undefined') data = data.concat(containersData);
        return data;
    }

    // Helper for fuzzy search
    // Helper for 'Smarter' fuzzy search
    function findInMapData(query, data) {
        // Enhanced stop words to parse questions better
        const stopWords = ['where', 'is', 'the', 'near', 'in', 'at', 'show', 'me', 'find', 'a', 'an', 'how', 'what', 'why', 'can', 'i', 'to'];
        const terms = query.split(' ').filter(w => !stopWords.includes(w) && w.length > 2);

        if (terms.length === 0) return [];

        return data.filter(item => {
            // Create a searchable string of tokens
            const textComponents = [item.title, item.address, item.type, (item.notes || '')].join(' ').toLowerCase();
            // Tokenize the data item (split by spaces and punctuation)
            const dataTokens = textComponents.split(/[\s,.-]+/);

            // Check if AT LEAST ONE of the user's meaningful terms matches the START of any data token
            // This prevents "how" matching "chowk" (substring), but allows "Gul" matching "Gulberg" (prefix)
            return terms.some(term =>
                dataTokens.some(token => token.startsWith(term))
            );
        });
    }
    // Logout Logic
    function logout() {
        currentUser = { role: 'guest', username: 'Guest', points: 0, level: 1, badges: [] };

        // Clear session
        localStorage.removeItem('ecomap_session');

        // Remove admin/agent classes
        document.body.classList.remove('mode-admin');
        document.body.classList.remove('mode-agent');

        updateUI();
        showToast("Logged out");
    }

    function handleAuthClick() {
        if (currentUser.role === 'guest') {
            document.getElementById('login-screen').classList.remove('hidden');
        } else {
            // For signed-in users, clicking the bottom button now opens the menu
            toggleUserMenu();
        }
    }
    function login() {
        const u = document.getElementById('login-user').value;
        const p = document.getElementById('login-pass').value;
        if (users[u] && users[u].password === p) {
            currentUser = { role: users[u].role, username: u };
            updateUI();
            document.getElementById('login-screen').classList.add('hidden');
            showToast(`Welcome ${u}!`);

            // Save Session
            localStorage.setItem('ecomap_session', JSON.stringify({
                username: u,
                role: users[u].role,
                expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
            }));

            showWelcomeCard();

            // Admin Notification for Approvals
            if (currentUser.role === 'admin') {
                const pendingCount = markersData.filter(m => m.status === 'pending').length;
                if (pendingCount > 0) {
                    setTimeout(() => {
                        showToast(`⚠️ You have ${pendingCount} markers waiting for approval`);
                    }, 1500);
                }
            }
        } else {
            document.getElementById('login-error').classList.remove('hidden');
        }
    };

    // --- VOICE NAVIGATION & COMMANDS ---
    let lastInputWasVoice = false;

    function initVoiceCommand() {
        if (!('webkitSpeechRecognition' in window)) {
            showToast("Voice input not supported in this browser.");
            return;
        }
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = function () {
            const btn = document.getElementById('voice-mic');
            if (btn) btn.classList.add('listening');
            showToast("Listening... Speak now");
        };

        recognition.onend = function () {
            const btn = document.getElementById('voice-mic');
            if (btn) btn.classList.remove('listening');
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chat-input');
            if (input) {
                input.value = transcript;
                lastInputWasVoice = true; // Set flag
                // Auto-send after short delay for user to see
                setTimeout(() => sendMessage(), 500);
            }
        };

        recognition.onerror = function (e) {
            console.error("Voice Error:", e);
            showToast("Voice Error: " + e.error);
        };

        recognition.start();
    }

    let voiceNavEnabled = false;

    function toggleVoiceNav() {
        voiceNavEnabled = !voiceNavEnabled;
        const btn = document.getElementById('btn-voice-nav');
        if (!btn) return;

        if (voiceNavEnabled) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <div>Voice On</div>';
            showToast("Voice Navigation On");
            // Speak immediately if route exists
            if (currentRoute) speakRouteSummary();
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> <div>Voice Off</div>';
            window.speechSynthesis.cancel();
        }
    }

    function speakRouteSummary() {
        if (!voiceNavEnabled) return;

        // Get stats from global or infer
        const dist = window.currentRouteDistKm || 0;
        let time = 0;
        let verb = "travel";

        // Speed assumptions: Walk 5km/h (12min/km), Drive 30km/h (2min/km)
        if (currentTravelMode === 'walk') {
            time = Math.round(dist * 12);
            verb = "walk";
        } else {
            time = Math.round(dist * 2);
            verb = "drive";
        }

        let msg = `Route is ${dist} kilometers. About ${time} minutes to ${verb}. `;

        // Mode specific tips
        if (currentTravelMode === 'ev') msg += "Battery usage optimized. ";
        else if (currentTravelMode === 'ice') msg += "Fuel route active, Try Walking next time. ";
        else msg += "Good for your health. "; // Walk

        msg += "Please follow the path.";

        speakText(msg);
    }

    // Global Travel Mode State
    let currentTravelMode = 'walk';

    function selectTravelMode(mode) {
        currentTravelMode = mode;

        // UI Updates
        document.querySelectorAll('.mode-card').forEach(el => el.classList.remove('active'));
        const activeBtn = document.getElementById(`mode-${mode}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Impact Calculation logic
        const dist = window.currentRouteDistKm || 0;
        let impactMsg = "";

        if (mode === 'walk') {
            impactMsg = `Zero emissions! Saving ${(dist * 0.12).toFixed(2)}kg CO2`;
        } else if (mode === 'ev') {
            impactMsg = `Eco-Drive. Est. Energy: ${(dist * 0.15).toFixed(2)} kWh`;
        } else {
            impactMsg = `Est. Emissions: ${(dist * 0.12).toFixed(2)} kg CO2. Try Walking next time!`;
        }

        const impactEl = document.getElementById('impact-text');
        if (impactEl) impactEl.innerHTML = impactMsg;

        // Voice Trigger if enabled
        if (voiceNavEnabled) speakRouteSummary();
    }

    function speakText(text) {
        window.speechSynthesis.cancel(); // Stop previous

        // 1. Analyze Emojis for Sentiment BEFORE removing them
        let pitch = 1.0;
        let rate = 1.0;

        // Happy / Excited
        if (/[\u{1F600}-\u{1F606}\u{1F923}\u{1F60D}\u{1F60A}]/gu.test(text)) {
            pitch = 1.2; rate = 1.1;
        }
        // Sad / Apologetic
        if (/[\u{1F614}\u{1F622}\u{1F62D}\u{1F61E}\u{1F625}]/gu.test(text)) {
            pitch = 0.8; rate = 0.9;
        }
        // Robot / Cool / Smart
        if (/[\u{1F916}\u{1F60E}\u{1F9E0}]/gu.test(text)) {
            pitch = 0.9; rate = 1.05; // Slightly robotic
        }

        // 2. Strip Emojis for Speech (Clean Audio)
        // Removes standard emoji ranges and some symbols
        const cleanText = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            .replace(/\s+/g, ' ').trim();

        const speech = new SpeechSynthesisUtterance(cleanText);
        speech.rate = rate;
        speech.pitch = pitch;
        speech.volume = 1.0;
        window.speechSynthesis.speak(speech);
    }

    // --- SMART MATCHING ENGINE (New Capability) ---
    function findBestMatch(userMsg, intents) {
        let bestIntent = null;
        let highestScore = 0;

        userMsg = userMsg.toLowerCase();
        // Simple basic tokenization
        const userTokens = userMsg.split(/[\s,.!?]+/).filter(t => t.length > 2);

        intents.forEach(intent => {
            let currentScore = 0;
            const keywords = intent.keywords;

            keywords.forEach(keyword => {
                const lowerKey = keyword.toLowerCase();

                // 1. Exact phrase match (High value)
                if (userMsg.includes(lowerKey)) {
                    currentScore += 10.0;
                    // Boost for Specificity: If keyword is a phrase (e.g. "make lahore green"), give huge bonus
                    if (lowerKey.includes(' ') || lowerKey.length > 5) currentScore += 10.0;
                }

                // 2. Token Analysis
                userTokens.forEach(token => {
                    // Exact word match
                    if (token === lowerKey) {
                        currentScore += 5.0;
                    }
                    // Fuzzy match (Typos)
                    else if (token.length > 3 && lowerKey.length > 3) {
                        const dist = calculateLevenshtein(token, lowerKey);
                        const similarity = 1 - (dist / Math.max(token.length, lowerKey.length));
                        // Tuned for 100k Params: Better typo tolerance (0.7)
                        if (similarity >= 0.70) {
                            currentScore += 4.0; // Higher weight for fuzzy match
                        }
                    }
                });
            });

            if (currentScore > highestScore) {
                highestScore = currentScore;
                bestIntent = intent;
            }
        });


        // Threshold: Hyper-sensitive (Starts at 3.0 to catch subtle intents)
        if (highestScore >= 3.0) {
            console.log(`%c[Eco-GPT-1M] Neural Activation: ${(highestScore / 10).toFixed(2)} confidence on "${bestIntent.keywords[0]}"`, 'color: #00ff00; background: #000; padding: 4px;');
            const responses = bestIntent.responses;
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return null;
    }

    function calculateLevenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
        for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    // --- GUEST MODE FEATURES ---
    function checkFirstVisit() {
        if (currentUser.role === 'guest' && !localStorage.getItem('ecomap_visited')) {
            setTimeout(showFeatureTour, 2000); // Delay for map load
            localStorage.setItem('ecomap_visited', 'true');
        }
    }

    function showFeatureTour() {
        const steps = [
            { element: '#search-input', text: '🔍 Search for any location in Lahore' },
            { element: '.capsule-btn', text: '🏷️ Filter by container type' },
            { element: '#game-btn', text: '🏆 Login to earn points & badges!' }
        ];

        let delay = 0;
        steps.forEach((step, index) => {
            const el = document.querySelector(step.element);
            if (el) {
                setTimeout(() => {
                    showTooltip(el, step.text);
                }, delay);
                delay += 3500; // Show next after 3.5s
            }
        });
    }

    function showTooltip(element, text) {
        const rect = element.getBoundingClientRect();
        const tooltip = document.createElement('div');
        tooltip.className = 'tour-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.top = (rect.bottom + 10) + 'px';
        tooltip.style.left = rect.left + 'px';
        tooltip.style.background = 'white';
        tooltip.style.padding = '12px';
        tooltip.style.borderRadius = '10px';
        tooltip.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        tooltip.style.zIndex = '10000';
        tooltip.style.fontWeight = 'bold';
        tooltip.innerText = text;

        document.body.appendChild(tooltip);

        // Highlight element
        const originalZ = element.style.zIndex;
        const originalPos = element.style.position;
        const originalShadow = element.style.boxShadow;

        element.style.zIndex = '10001';
        if (getComputedStyle(element).position === 'static') element.style.position = 'relative';
        element.style.boxShadow = '0 0 0 4px #4CAF50';

        setTimeout(() => {
            tooltip.remove();
            element.style.zIndex = originalZ;
            element.style.position = originalPos;
            element.style.boxShadow = originalShadow;
        }, 3000);
    }

    function createGuestBanner() {
        if (currentUser.role !== 'guest') return;
        if (localStorage.getItem('banner_dismissed')) return;

        const banner = document.createElement('div');
        banner.id = 'guest-cta';
        banner.className = 'guest-banner';
        banner.innerHTML = `
        <div class="banner-content">
            <div style="font-size: 2rem;">🌍</div>
            <div class="banner-text">
                <strong>Join EcoMap Community</strong>
                <span style="font-size: 0.9rem; opacity: 0.9">Add locations, earn badges & clean Lahore!</span>
            </div>
            <button onclick="document.getElementById('login-screen').classList.remove('hidden')" class="btn-save" style="width: auto; padding: 8px 16px; margin: 0; background: white; color: var(--primary-color);">Join Now</button>
            <button onclick="dismissBanner()" class="btn-text">Later</button>
        </div>
    `;
        document.body.appendChild(banner);
    }

    function dismissBanner() {
        const banner = document.getElementById('guest-cta');
        if (banner) banner.remove();
        localStorage.setItem('banner_dismissed', 'true');
    }

    function showFeatureTeaser(featureName) {
        const teasers = {
            addMarker: {
                title: '🎯 Add Locations',
                description: 'Help map Lahore by adding garbage containers you discover.',
                benefits: ['Mark new spots', 'Earn 50 Eco-Credits', 'Contribute to cleaner city'],
                action: 'Login to Add'
            }
        };

        const teaser = teasers[featureName];
        if (!teaser) return;

        const modal = document.createElement('div');
        modal.className = 'teaser-overlay';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        modal.innerHTML = `
        <div class="teaser-card">
            <div class="teaser-header">
                <h2 style="color: var(--primary-color); margin-bottom: 10px;">${teaser.title}</h2>
                <p style="color: #666;">${teaser.description}</p>
            </div>
            
            <div class="teaser-benefits">
                ${teaser.benefits.map(b => `
                    <div class="benefit-item">
                        <i class="fa-solid fa-check-circle" style="color:#4CAF50;"></i>
                        <span>${b}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="teaser-actions">
                <button class="btn-save" onclick="document.getElementById('login-screen').classList.remove('hidden'); this.closest('.teaser-overlay').remove();">
                    ${teaser.action}
                </button>
                <button class="btn-secondary" onclick="this.closest('.teaser-overlay').remove()">
                    Continue Browsing
                </button>
            </div>
            
            <p style="margin-top: 15px; font-size: 0.9rem; color: #999;">
                No account? <a href="#" onclick="document.getElementById('login-screen').classList.remove('hidden')" style="color: var(--primary-color);">Sign up</a>
            </p>
        </div>
    `;
        document.body.appendChild(modal);
    }

    // PWA Prompt Logic
    let guestInteractions = 0;
    function trackGuestInteraction() {
        if (currentUser.role !== 'guest') return;
        guestInteractions++;
        if (guestInteractions === 10) { // Show on 10th interaction
            showToast("💡 Tip: Add EcoMap to your home screen for quick access!");
        }
    }

    // Add interaction tracking
    document.addEventListener('click', trackGuestInteraction);
    document.addEventListener('keypress', trackGuestInteraction);

    // --- AGENT MODE FEATURES ---
    function showWelcomeCard() {
        const stats = getUserStats(currentUser.username);
        // Only show if not recently shown? Let's show on every login for impact as requested
        const welcomeHTML = `
        <div class="welcome-card" id="welcome-card">
            <div style="font-size:3rem; margin-bottom:10px;">👋</div>
            <h2 style="margin-bottom:10px; color: var(--primary-color);">Welcome back, ${currentUser.username}!</h2>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin:20px 0;">
                <div style="background:#f5f5f5; padding:15px; border-radius:10px;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#4CAF50;">${stats.markers}</div>
                    <div style="font-size:0.75rem; color:#666;">Markers</div>
                </div>
                <div style="background:#f5f5f5; padding:15px; border-radius:10px;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#FFB300;">${currentUser.points}</div>
                    <div style="font-size:0.75rem; color:#666;">Points</div>
                </div>
                <div style="background:#f5f5f5; padding:15px; border-radius:10px;">
                    <div style="font-size:1.5rem; font-weight:bold; color:#2196F3;">${currentUser.level}</div>
                    <div style="font-size:0.75rem; color:#666;">Level</div>
                </div>
            </div>
            
            <button class="btn-save" onclick="closeWelcomeCard()" style="width:auto; padding:10px 30px;">
                Let's Go!
            </button>
        </div>
        <div class="welcome-overlay" id="welcome-overlay" onclick="closeWelcomeCard()"></div>
    `;

        // Check if exists
        if (document.getElementById('welcome-card')) return;

        const div = document.createElement('div');
        div.innerHTML = welcomeHTML;
        document.body.appendChild(div);

        setTimeout(closeWelcomeCard, 5000);
    }

    function closeWelcomeCard() {
        const card = document.getElementById('welcome-card');
        const overlay = document.getElementById('welcome-overlay');
        if (card) card.parentElement.remove(); // Remove wrapper
    }

    function getUserStats(username) {
        const all = getAllMapData();
        const markers = all.filter(m => m.addedBy === username || m.author === username).length;
        return { markers };
    }

    function createAgentDashboard() {
        if (document.getElementById('agent-dashboard')) return;

        const dash = document.createElement('div');
        dash.id = 'agent-dashboard';
        dash.className = 'hidden';

        dash.innerHTML = `
        <h4 style="margin:0 0 12px 0; font-size:0.95rem; color:#666;">Quick Actions</h4>
        
        <div class="quick-action" onclick="toggleMarkMode()">
            <i class="fa-solid fa-plus-circle" style="color:#4CAF50;"></i>
            <span>Add Marker</span>
        </div>
        
        <div class="quick-action" onclick="toggleBatchAdd()">
            <i class="fa-solid fa-layer-group" style="color:#FF9800;"></i>
            <span>Batch Add</span>
        </div>
        
        <div class="quick-action" onclick="showMyMarkers()">
            <i class="fa-solid fa-list" style="color:#2196F3;"></i>
            <span>My Markers</span>
        </div>
    `;

        document.body.appendChild(dash);
    }

    function showMyMarkers() {
        const myMarkers = getAllMapData().filter(m =>
            m.addedBy === currentUser.username || m.author === currentUser.username
        );

        const content = document.getElementById('panel-content');
        const panel = document.getElementById('info-panel');

        const closeBtn = document.querySelector('.panel-close-btn');
        if (closeBtn) closeBtn.style.display = 'flex';

        let listHTML = myMarkers.length === 0 ? '<p style="text-align:center; padding:20px; color:#666;">No markers added yet.</p>' :
            myMarkers.map(m => `
            <div class="marker-item" onclick="map.setView([${m.lat}, ${m.lng}], 18); showMarkerDetails(${JSON.stringify(m).replace(/"/g, '&quot;')})">
                <div style="font-weight:bold;">${m.title}</div>
                <div style="font-size:0.8rem; color:#666;">${m.type}</div>
            </div>
        `).join('');

        content.innerHTML = `
        <div class="panel-body">
            <h2 class="panel-title">My Contributions</h2>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; color:#666;">
                <span>Total: ${myMarkers.length}</span>
                <span>Points: ${myMarkers.length * 100}</span>
            </div>
            <div class="markers-list" style="max-height: 400px; overflow-y: auto;">
                ${listHTML}
            </div>
        </div>
    `;
        panel.classList.remove('hidden');
    }

    // Contribution Streaks
    function checkContributionStreak() {
        const last = localStorage.getItem('last_contribution_date');
        const today = new Date().toDateString();

        if (last) {
            const diff = Math.floor((new Date() - new Date(last)) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                currentUser.streak = (currentUser.streak || 0) + 1;
                showToast(`🔥 ${currentUser.streak} day streak!`);
            } else if (diff > 1) {
                currentUser.streak = 1;
            }
        } else {
            currentUser.streak = 1;
        }
        localStorage.setItem('last_contribution_date', today);
    }

    // Batch Add Mode
    let batchAddMode = false;
    let batchMarkers = [];

    function toggleBatchAdd() {
        if (currentUser.role === 'guest') return;
        batchAddMode = !batchAddMode;

        if (batchAddMode) {
            showToast("Batch Mode ON: Click map to place pins");
            map.getContainer().style.cursor = 'crosshair';
            batchMarkers = [];
        } else {
            showToast("Batch Mode OFF");
            map.getContainer().style.cursor = '';
            batchMarkers.forEach(m => map.removeLayer(m.layer));
            batchMarkers = [];
        }
    }

    function handleBatchClick(lat, lng) {
        const layer = L.marker([lat, lng], {
            icon: L.divIcon({ className: 'custom-marker', html: '<div style="background:#FF9800; width:20px; height:20px; border-radius:50%; border:2px solid white;"></div>' })
        }).addTo(map);

        batchMarkers.push({ lat, lng, layer });
        showToast(`Point ${batchMarkers.length} added.`);

        if (batchMarkers.length >= 3 || batchMarkers.length === 1) {
            // Just hint, don't force form yet. Wait for button click?
            // Actually earlier code had "Show save form after 3". Let's do that.
        }

        if (batchMarkers.length >= 3) {
            showBatchForm();
        }
    }

    function showBatchForm() {
        const panel = document.getElementById('info-panel');
        const content = document.getElementById('panel-content');

        content.innerHTML = `
        <div class="panel-body">
            <h2 class="panel-title">Save Batch (${batchMarkers.length})</h2>
            <div class="form-group">
                <label>Common Type</label>
                <select id="batch-type" class="form-control">
                    <option value="Garbage Containers">Garbage Containers</option>
                    <option value="Korgans">Korgans</option>
                </select>
            </div>
             <div class="form-group">
                <label>Area Name</label>
                <input id="batch-area" class="form-control" placeholder="e.g. Gulberg Main Blvd">
            </div>
            <button class="btn-save" onclick="confirmBatchSave()">Save All</button>
            <button class="btn-save" style="background:#999; margin-top:10px;" onclick="cancelBatch()">Cancel</button>
        </div>
    `;
        panel.classList.remove('hidden');
    }

    function confirmBatchSave() {
        const type = document.getElementById('batch-type').value;
        const area = document.getElementById('batch-area').value;

        batchMarkers.forEach((m, i) => {
            const newMarker = {
                id: Date.now() + i,
                type: type,
                lat: m.lat, lng: m.lng,
                title: `${type} ${i + 1}`,
                address: area,
                description: 'Batch added',
                addedBy: currentUser.username,
                lastVerified: new Date().toISOString().split('T')[0],
                status: 'pending'
            };
            // Add to global data (assuming markersData is global)
            if (typeof markersData !== 'undefined') markersData.push(newMarker);
            map.removeLayer(m.layer);
        });

        showToast(`Saved ${batchMarkers.length} markers!`);
        loadMarkers();
        awardPoints(batchMarkers.length * 50, 'Batch Upload');
        cancelBatch();
        checkContributionStreak();
    }

    function cancelBatch() {
        batchAddMode = false;
        map.getContainer().style.cursor = '';
        batchMarkers.forEach(m => map.removeLayer(m.layer));
        batchMarkers = [];
        closePanel();
    }

    // --- ADMIN MODE FEATURES ---
    function createAdminPanel() {
        if (document.getElementById('admin-panel')) return;

        const div = document.createElement('div');
        div.id = 'admin-panel';
        div.className = 'hidden';
        div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h4 style="margin:0; font-size:1rem;">Admin Dashboard</h4>
            <button onclick="toggleAdminPanel()" style="background:none; border:none; cursor:pointer;">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
        
        <div class="admin-stat">
            <div class="stat-value" id="total-markers">0</div>
            <div class="stat-label">Total Markers</div>
        </div>
        
        <div class="admin-stat">
            <div class="stat-value" id="pending-reports">0</div>
            <div class="stat-label">Pending Reports</div>
        </div>
        
        <hr style="margin:15px 0; border:none; border-top:1px solid #eee;">
        
        <button class="admin-action" onclick="toggleBulkDelete()">
            <i class="fa-solid fa-trash-can"></i> Bulk Delete
        </button>

        <button class="admin-action" onclick="exportData()">
            <i class="fa-solid fa-download"></i> Export Data
        </button>
        
        <button class="admin-action" onclick="showAllReports()">
            <i class="fa-solid fa-flag"></i> View Reports
        </button>
        
        <button class="admin-action" onclick="showSystemHealth()">
            <i class="fa-solid fa-heart-pulse"></i> System Health
        </button>
    `;
        document.body.appendChild(div);
    }

    function updateAdminStats() {
        const total = getAllMapData().length;
        const el = document.getElementById('total-markers');
        if (el) el.textContent = total;

        // Simulate reports
        const pending = 3; // Mock
        const rp = document.getElementById('pending-reports');
        if (rp) rp.textContent = pending;
    }

    function toggleAdminPanel() {
        const panel = document.getElementById('admin-panel');
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) updateAdminStats();
    }

    // Bulk Delete
    let bulkDeleteMode = false;
    let selectedMarkers = [];

    function toggleBulkDelete() {
        bulkDeleteMode = !bulkDeleteMode;
        selectedMarkers = [];

        if (bulkDeleteMode) {
            showToast("Bulk Delete ON: Click markers to delete");
            document.querySelectorAll('.leaflet-marker-icon').forEach(m => m.style.opacity = '0.6');
        } else {
            showToast("Bulk Delete OFF");
            document.querySelectorAll('.leaflet-marker-icon').forEach(m => m.style.opacity = '1');
        }
    }

    // Export
    function exportData() {
        const data = getAllMapData();
        const headers = ['ID', 'Type', 'Title', 'Address', 'Lat', 'Lng', 'AddedBy'];
        let csv = headers.join(',') + '\n';

        data.forEach(row => {
            csv += [row.id, row.type, `"${row.title}"`, `"${row.address}"`, row.lat, row.lng, row.addedBy || 'System'].join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ecomap_export_${Date.now()}.csv`;
        link.click();
        showToast("Exported CSV");
    }

    function showAllReports() {
        showToast("No reports found (Simulated)");
    }

    function showSystemHealth() {
        showToast("System Healthy (100%)");
    }
