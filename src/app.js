import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clinicalData, getEnrollmentSize, formatEnrollment, getDiseaseColor, getPhaseLabel } from './data/clinicalData.js';

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  colors: {
    bg: 0x0a0a0a,
    fog: 0x0a0a0a,
    gold: 0xc9b896,
    lavender: 0xa78bfa,
    alzheimers: 0x60a5fa,
    parkinsons: 0xf472b6,
    biologic: 0x22c55e,
    smallMolecule: 0xa78bfa,
    terrain: 0x1a1a1a,
    terrainHighlight: 0x262626
  },
  phases: {
    1: { radius: 85, color: 0x22c55e, yOffset: 5 },
    2: { radius: 60, color: 0x3b82f6, yOffset: 20 },
    3: { radius: 35, color: 0xa855f7, yOffset: 35 },
    4: { radius: 15, color: 0xc9b896, yOffset: 45 }
  }
};

// ============================================
// STATE
// ============================================
let currentFilter = 'all';
let scene, camera, renderer, controls;
let terrain, trialMarkers = [];
let raycaster, mouse;
let hoveredMarker = null;

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(CONFIG.colors.bg);
  scene.fog = new THREE.FogExp2(CONFIG.colors.fog, 0.012);

  // Camera
  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 45, 90);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 30;
  controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI / 2 - 0.15;
  controls.target.set(0, 15, -30);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;

  // Lighting
  setupLighting();

  // Terrain
  createTerrain();
  createPhaseZones();

  // Trial markers
  createAllTrialMarkers();

  // Atmosphere
  createParticles();
  createFinishMarker();

  // Raycaster for interaction
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick);

  // UI bindings
  bindDiseaseToggle();
  bindPanelControls();
  renderUpdates();

  // Animation loop
  animate();
}

// ============================================
// LIGHTING
// ============================================
function setupLighting() {
  const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.9);
  sunLight.position.set(60, 100, 60);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 500;
  sunLight.shadow.camera.left = -100;
  sunLight.shadow.camera.right = 100;
  sunLight.shadow.camera.top = 100;
  sunLight.shadow.camera.bottom = -100;
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(CONFIG.colors.gold, 0.4);
  rimLight.position.set(-50, 30, -50);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.2);
  fillLight.position.set(50, 20, -50);
  scene.add(fillLight);
}

// ============================================
// TERRAIN
// ============================================
function createTerrain() {
  const geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
  const positions = geometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const z = positions[i + 1];

    // Create mountain shape rising toward center (finish line)
    const distFromCenter = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(z, x);

    // Base mountain shape - higher near center
    let height = Math.max(0, 50 - distFromCenter * 0.5);

    // Add noise layers
    const noise1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 4;
    const noise2 = Math.sin(x * 0.04 + z * 0.02) * 6;
    const noise3 = Math.sin(angle * 2) * 3;
    const noise4 = Math.sin(x * 0.15) * Math.sin(z * 0.15) * 2;

    height += noise1 + noise2 + noise3 + noise4;

    // Create valley near camera (start)
    if (z > 40) {
      height *= 0.2;
    }

    // Flatten the peak area (approval zone)
    if (distFromCenter < 20) {
      height = 45 + (height - 45) * 0.3;
    }

    height = Math.max(0, height);
    positions[i + 2] = height;
  }

  geometry.computeVertexNormals();

  // Custom shader-like material using standard material
  const material = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.terrain,
    roughness: 0.95,
    metalness: 0.05,
    flatShading: true,
    side: THREE.DoubleSide
  });

  terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  terrain.receiveShadow = true;
  scene.add(terrain);
}

function createPhaseZones() {
  // Create subtle rings for each phase zone
  Object.entries(CONFIG.phases).forEach(([phase, config]) => {
    const geometry = new THREE.RingGeometry(config.radius - 3, config.radius, 64);
    const material = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.3;
    scene.add(ring);
  });
}

// ============================================
// TRIAL MARKERS
// ============================================
function createAllTrialMarkers() {
  // Process all trials from both diseases
  ['alzheimers', 'parkinsons'].forEach(disease => {
    const data = clinicalData[disease];

    // Process each phase
    ['approved', 'phase3', 'phase2', 'phase1'].forEach(phaseKey => {
      const trials = data[phaseKey] || [];
      const phaseNum = phaseKey === 'approved' ? 4 :
                      phaseKey === 'phase3' ? 3 :
                      phaseKey === 'phase2' ? 2 : 1;

      trials.forEach((trial, index) => {
        createTrialMarker(trial, disease, phaseNum, index, trials.length);
      });
    });
  });
}

function createTrialMarker(trial, disease, phaseNum, index, totalInPhase) {
  const isAlzheimers = disease === 'alzheimers';
  const diseaseColor = isAlzheimers ? CONFIG.colors.alzheimers : CONFIG.colors.parkinsons;
  const phaseConfig = CONFIG.phases[phaseNum];

  // Calculate position
  const angle = (index / Math.max(totalInPhase, 1)) * Math.PI * 1.6 - Math.PI * 0.8;
  const radiusVariation = (Math.random() - 0.5) * 8;
  const radius = phaseConfig.radius + radiusVariation;

  const x = Math.cos(angle) * radius;
  const z = -Math.sin(angle) * radius;

  // Get terrain height
  const y = getTerrainHeight(x, z) + 2;

  // Marker size based on enrollment
  const size = getEnrollmentSize(trial.enrollment) * 0.8;

  // Create marker group
  const markerGroup = new THREE.Group();
  markerGroup.position.set(x, y, z);

  // Visual style based on drug type
  const isBiologic = trial.type === 'biologic';
  const markerColor = isBiologic ? CONFIG.colors.biologic : CONFIG.colors.lavender;

  // Main marker geometry
  let geometry;
  if (isBiologic) {
    // Ring for biologics
    geometry = new THREE.TorusGeometry(size * 0.6, size * 0.12, 8, 24);
  } else {
    // Octahedron for small molecules
    geometry = new THREE.OctahedronGeometry(size * 0.5, 0);
  }

  // Material with emissive glow for active trials
  const isActive = trial.status === 'active' || trial.status === 'recruiting';
  const isApproved = trial.status === 'approved';

  const material = new THREE.MeshStandardMaterial({
    color: markerColor,
    emissive: markerColor,
    emissiveIntensity: isActive ? 0.4 : (isApproved ? 0.6 : 0.1),
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: trial.status === 'terminated' ? 0.5 : 0.95
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.userData = { trial, disease, phaseNum, isMarker: true };
  markerGroup.add(mesh);

  // Add glow for active/approved
  if (isActive || isApproved) {
    const glowGeometry = new THREE.SphereGeometry(size * 0.9, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: markerColor,
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    markerGroup.add(glow);
  }

  // Add pillar connecting to terrain
  const pillarHeight = y;
  const pillarGeometry = new THREE.CylinderGeometry(0.08, 0.08, pillarHeight, 8);
  const pillarMaterial = new THREE.MeshBasicMaterial({
    color: diseaseColor,
    transparent: true,
    opacity: 0.25
  });
  const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
  pillar.position.set(x, pillarHeight / 2, z);
  scene.add(pillar);

  // Add outer ring for disease-modifying
  if (trial.purpose === 'disease-modifying') {
    const ringGeometry = new THREE.RingGeometry(size * 0.9, size * 1.1, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: diseaseColor,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    markerGroup.add(ring);
  }

  scene.add(markerGroup);
  trialMarkers.push(mesh);
}

function getTerrainHeight(x, z) {
  const distFromCenter = Math.sqrt(x * x + z * z);
  const angle = Math.atan2(z, x);

  let height = Math.max(0, 50 - distFromCenter * 0.5);

  const noise1 = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 4;
  const noise2 = Math.sin(x * 0.04 + z * 0.02) * 6;
  const noise3 = Math.sin(angle * 2) * 3;
  const noise4 = Math.sin(x * 0.15) * Math.sin(z * 0.15) * 2;

  height += noise1 + noise2 + noise3 + noise4;

  if (z > 40) height *= 0.2;
  if (distFromCenter < 20) height = 45 + (height - 45) * 0.3;

  return Math.max(0, height);
}

// ============================================
// FINISH MARKER
// ============================================
function createFinishMarker() {
  const group = new THREE.Group();

  // Central beacon
  const beaconGeometry = new THREE.CylinderGeometry(0.5, 1.5, 12, 8);
  const beaconMaterial = new THREE.MeshStandardMaterial({
    color: CONFIG.colors.gold,
    emissive: CONFIG.colors.gold,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.8
  });
  const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
  beacon.position.y = 50;
  group.add(beacon);

  // Light beam
  const beamGeometry = new THREE.CylinderGeometry(2, 8, 60, 16, 1, true);
  const beamMaterial = new THREE.MeshBasicMaterial({
    color: CONFIG.colors.gold,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const beam = new THREE.Mesh(beamGeometry, beamMaterial);
  beam.position.y = 20;
  group.add(beam);

  // Rotating rings
  for (let i = 0; i < 3; i++) {
    const ringGeometry = new THREE.RingGeometry(8 + i * 4, 9 + i * 4, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.colors.gold,
      transparent: true,
      opacity: 0.2 - i * 0.05,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 52 + i * 2;
    ring.userData = { rotationSpeed: 0.01 * (i + 1) };
    group.add(ring);
  }

  scene.add(group);

  // Animate rings
  group.userData.isFinishMarker = true;
}

// ============================================
// PARTICLES
// ============================================
function createParticles() {
  const particleCount = 300;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 180;
    positions[i3 + 1] = Math.random() * 70;
    positions[i3 + 2] = (Math.random() - 0.5) * 180;

    // Mix of gold and subtle colors
    const isGold = Math.random() > 0.7;
    colors[i3] = isGold ? 0.8 : 0.4;
    colors[i3 + 1] = isGold ? 0.72 : 0.5;
    colors[i3 + 2] = isGold ? 0.58 : 0.6;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  particles.userData = { isParticles: true };
  scene.add(particles);
}

// ============================================
// INTERACTION
// ============================================
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Stop auto-rotation when interacting
  controls.autoRotate = false;

  updateTooltip(event.clientX, event.clientY);
}

function onClick(event) {
  if (hoveredMarker) {
    const data = hoveredMarker.userData;
    openDetailPanel(data.trial, data.disease);
  }
}

function updateTooltip(x, y) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(trialMarkers);

  const tooltip = document.getElementById('tooltip');

  if (intersects.length > 0) {
    const newHovered = intersects[0].object;

    if (newHovered !== hoveredMarker) {
      if (hoveredMarker) {
        hoveredMarker.parent.scale.set(1, 1, 1);
      }
      hoveredMarker = newHovered;
      hoveredMarker.parent.scale.set(1.2, 1.2, 1.2);
      document.body.style.cursor = 'pointer';
    }

    const trial = hoveredMarker.userData.trial;
    const disease = hoveredMarker.userData.disease;
    const phaseNum = hoveredMarker.userData.phaseNum;

    document.getElementById('tooltip-name').textContent = trial.name;
    document.getElementById('tooltip-company').textContent = trial.company;
    document.getElementById('tooltip-phase').textContent = getPhaseLabel(phaseNum);
    document.getElementById('tooltip-enrollment').textContent =
      `${formatEnrollment(trial.enrollment)} enrolled`;

    const statusBadge = document.getElementById('tooltip-status');
    statusBadge.textContent = trial.status.toUpperCase();
    statusBadge.style.color = getStatusColor(trial.status);

    tooltip.style.left = Math.min(x + 16, window.innerWidth - 320) + 'px';
    tooltip.style.top = Math.min(y + 16, window.innerHeight - 120) + 'px';
    tooltip.classList.add('visible');
  } else {
    if (hoveredMarker) {
      hoveredMarker.parent.scale.set(1, 1, 1);
      hoveredMarker = null;
      document.body.style.cursor = 'default';
    }
    tooltip.classList.remove('visible');
  }
}

function getStatusColor(status) {
  const colors = {
    active: '#22c55e',
    recruiting: '#3b82f6',
    completed: '#737373',
    terminated: '#ef4444',
    approved: '#c9b896'
  };
  return colors[status] || '#737373';
}

// ============================================
// DETAIL PANEL
// ============================================
function openDetailPanel(trial, disease) {
  const panel = document.getElementById('detailPanel');
  const overlay = document.getElementById('panelOverlay');
  const content = document.getElementById('panelContent');

  const diseaseLabel = disease === 'alzheimers' ? "Alzheimer's Disease" : "Parkinson's Disease";
  const typeLabel = trial.type === 'biologic' ? 'Biologic' : 'Small Molecule';
  const purposeLabel = trial.purpose === 'disease-modifying' ? 'Disease-Modifying' : 'Symptomatic';

  content.innerHTML = `
    <h3>${trial.name}</h3>
    <div class="company">${trial.company}</div>

    <div class="detail-grid">
      <div class="detail-item">
        <label>Disease</label>
        <value>${diseaseLabel}</value>
      </div>
      <div class="detail-item">
        <label>Phase</label>
        <value>${trial.phase}</value>
      </div>
      <div class="detail-item">
        <label>Type</label>
        <value>${typeLabel}</value>
      </div>
      <div class="detail-item">
        <label>Purpose</label>
        <value>${purposeLabel}</value>
      </div>
      <div class="detail-item">
        <label>Enrollment</label>
        <value>${trial.enrollment?.toLocaleString() || 'N/A'}
          ${trial.enrollmentTarget ? `/ ${trial.enrollmentTarget.toLocaleString()}` : ''}</value>
      </div>
      <div class="detail-item">
        <label>Status</label>
        <value style="color: ${getStatusColor(trial.status)}">${trial.status.toUpperCase()}</value>
      </div>
      ${trial.indication ? `
      <div class="detail-item" style="grid-column: 1 / -1;">
        <label>Indication</label>
        <value>${trial.indication}</value>
      </div>
      ` : ''}
    </div>

    <div class="detail-description">
      <h4>Mechanism</h4>
      ${trial.mechanism}
    </div>

    ${trial.description ? `
    <div class="detail-description" style="margin-top: 16px;">
      <h4>Description</h4>
      ${trial.description}
    </div>
    ` : ''}

    ${trial.started ? `
    <div class="detail-grid" style="margin-top: 16px;">
      <div class="detail-item">
        <label>Started</label>
        <value>${trial.started}</value>
      </div>
      ${trial.estimatedCompletion ? `
      <div class="detail-item">
        <label>Est. Completion</label>
        <value>${trial.estimatedCompletion}</value>
      </div>
      ` : ''}
      ${trial.locations ? `
      <div class="detail-item">
        <label>Locations</label>
        <value>${trial.locations} sites</value>
      </div>
      ` : ''}
    </div>
    ` : ''}

    ${trial.ukApproved !== undefined ? `
    <div class="detail-grid" style="margin-top: 16px;">
      <div class="detail-item">
        <label>UK Approved</label>
        <value>${trial.ukApproved ? 'Yes' : (trial.ukExpected ? 'Expected ' + trial.ukExpected : 'No')}</value>
      </div>
      <div class="detail-item">
        <label>FDA Approved</label>
        <value>${trial.fdaApproved ? 'Yes' : 'No'}</value>
      </div>
    </div>
    ` : ''}
  `;

  panel.classList.add('open');
  overlay.classList.add('visible');
}

function bindPanelControls() {
  document.getElementById('closePanel').addEventListener('click', closeDetailPanel);
  document.getElementById('panelOverlay').addEventListener('click', closeDetailPanel);
}

function closeDetailPanel() {
  document.getElementById('detailPanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('visible');
}

// ============================================
// DISEASE FILTER
// ============================================
function bindDiseaseToggle() {
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.dataset.disease;
      filterMarkers();
    });
  });
}

function filterMarkers() {
  trialMarkers.forEach(marker => {
    const disease = marker.userData.disease;
    const visible = currentFilter === 'all' || currentFilter === disease;

    marker.visible = visible;
    marker.parent.visible = visible;
  });
}

// ============================================
// UPDATES FEED
// ============================================
function renderUpdates() {
  const container = document.getElementById('updatesFeed');
  const allUpdates = [
    ...clinicalData.alzheimers.updates.map(u => ({ ...u, disease: 'alzheimers' })),
    ...clinicalData.parkinsons.updates.map(u => ({ ...u, disease: 'parkinsons' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = allUpdates.slice(0, 5).map(update => `
    <div class="update-card">
      <div class="update-header">
        <span class="update-type ${update.type}">${update.type}</span>
        <span class="update-date">${formatDate(update.date)}</span>
      </div>
      <div class="update-drug">${update.drugName}</div>
      <div class="update-text">${update.description}</div>
    </div>
  `).join('');
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ============================================
// ANIMATION
// ============================================
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  controls.update();

  // Animate particles
  scene.children.forEach(child => {
    if (child.userData.isParticles) {
      child.rotation.y += 0.0003;
    }
    if (child.userData.isFinishMarker) {
      child.children.forEach((ring, i) => {
        if (ring.userData.rotationSpeed) {
          ring.rotation.z += ring.userData.rotationSpeed;
        }
      });
    }
  });

  // Animate active trial markers
  trialMarkers.forEach((marker, i) => {
    const trial = marker.userData.trial;
    if ((trial.status === 'active' || trial.status === 'recruiting') && marker.visible) {
      marker.parent.position.y += Math.sin(time * 2 + i) * 0.008;
      marker.rotation.y += 0.005;
    }
  });

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================
// START
// ============================================
init();
