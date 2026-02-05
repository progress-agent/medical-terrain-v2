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
let currentPhaseFilter = 'all';
let currentTypeFilter = 'all';
let currentPurposeFilter = 'all';
let scene, camera, renderer, controls;
let terrain, trialMarkers = [];
let raycaster, mouse;
let hoveredMarker = null;
let isJourneyMode = false;
let journeyProgress = 0;

// ============================================
// INITIALIZATION
// ============================================
function init() {
  // Update loading text
  updateLoadingText('Initializing 3D scene...');

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

  updateLoadingText('Setting up lighting...');
  // Lighting
  setupLighting();

  updateLoadingText('Generating terrain...');
  // Terrain
  createTerrain();
  createPhaseZones();

  updateLoadingText('Placing trial markers...');
  // Trial markers
  createAllTrialMarkers();

  updateLoadingText('Adding atmosphere...');
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
  bindFilterControls();
  bindPanelControls();
  bindJourneyButton();
  renderUpdates();
  updateStats();

  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loading-screen').classList.add('hidden');
  }, 500);

  // Animation loop
  animate();
}

function updateLoadingText(text) {
  const loadingText = document.querySelector('.loading-text');
  if (loadingText) loadingText.textContent = text;
}

// ============================================
// LIGHTING
// ============================================
function setupLighting() {
  // Hemisphere light for natural ambient fill
  const hemiLight = new THREE.HemisphereLight(0x60a5fa, 0x1a1a1a, 0.6);
  hemiLight.position.set(0, 100, 0);
  scene.add(hemiLight);

  const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
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
  sunLight.shadow.bias = -0.0001;
  scene.add(sunLight);

  const rimLight = new THREE.DirectionalLight(CONFIG.colors.gold, 0.5);
  rimLight.position.set(-50, 30, -50);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xc9b896, 0.3);
  fillLight.position.set(50, 20, -50);
  scene.add(fillLight);

  // Point lights near the finish marker for dramatic effect
  const finishLight1 = new THREE.PointLight(CONFIG.colors.gold, 1, 50);
  finishLight1.position.set(0, 55, 0);
  scene.add(finishLight1);

  const finishLight2 = new THREE.PointLight(0xffffff, 0.5, 30);
  finishLight2.position.set(10, 45, 10);
  scene.add(finishLight2);
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

  // Store base Y for animation
  const baseY = y;

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
  mesh.userData = { trial, disease, phaseNum, isMarker: true, baseY };
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
// FILTERS
// ============================================
function bindDiseaseToggle() {
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.dataset.disease;
      applyAllFilters();
    });
  });
}

function bindFilterControls() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filterType = btn.dataset.filter;
      const value = btn.dataset.value;

      // Update active state for this filter group
      document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      // Update filter state
      if (filterType === 'phase') currentPhaseFilter = value;
      else if (filterType === 'type') currentTypeFilter = value;
      else if (filterType === 'purpose') currentPurposeFilter = value;

      applyAllFilters();
    });
  });
}

function applyAllFilters() {
  trialMarkers.forEach(marker => {
    const trial = marker.userData.trial;
    const disease = marker.userData.disease;
    const phaseNum = marker.userData.phaseNum;

    // Disease filter
    const diseaseMatch = currentFilter === 'all' || currentFilter === disease;

    // Phase filter
    const phaseMatch = currentPhaseFilter === 'all' || currentPhaseFilter === phaseNum.toString();

    // Type filter
    const typeMatch = currentTypeFilter === 'all' || currentTypeFilter === trial.type;

    // Purpose filter
    const purposeMatch = currentPurposeFilter === 'all' || currentPurposeFilter === trial.purpose;

    const visible = diseaseMatch && phaseMatch && typeMatch && purposeMatch;

    marker.visible = visible;
    marker.parent.visible = visible;

    // Animate visibility change
    if (visible) {
      marker.parent.scale.set(1, 1, 1);
    } else {
      marker.parent.scale.set(0.1, 0.1, 0.1);
    }
  });

  updateStats();
}

function filterMarkers() {
  applyAllFilters();
}

// ============================================
// STATS PANEL
// ============================================
function updateStats() {
  let total = 0;
  let active = 0;
  let biologics = 0;
  let smallMolecules = 0;
  const phaseCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

  trialMarkers.forEach(marker => {
    if (!marker.visible) return;

    const trial = marker.userData.trial;
    const phaseNum = marker.userData.phaseNum;

    total++;
    if (trial.status === 'active' || trial.status === 'recruiting') active++;
    if (trial.type === 'biologic') biologics++;
    if (trial.type === 'small-molecule') smallMolecules++;
    phaseCounts[phaseNum]++;
  });

  // Update stat values
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-biologics').textContent = biologics;
  document.getElementById('stat-small').textContent = smallMolecules;

  // Update phase bars
  const maxCount = Math.max(...Object.values(phaseCounts), 1);
  for (let phase = 1; phase <= 4; phase++) {
    const count = phaseCounts[phase];
    const percentage = (count / maxCount) * 100;
    document.getElementById(`bar-p${phase}`).style.width = `${percentage}%`;
    document.getElementById(`count-p${phase}`).textContent = count;
  }
}

// ============================================
// JOURNEY MODE
// ============================================
function bindJourneyButton() {
  document.getElementById('journeyBtn').addEventListener('click', toggleJourneyMode);
}

function toggleJourneyMode() {
  const btn = document.getElementById('journeyBtn');
  const icon = btn.querySelector('.journey-icon');

  if (isJourneyMode) {
    // Stop journey
    isJourneyMode = false;
    btn.classList.remove('playing');
    icon.textContent = '▶';
    controls.autoRotate = true;
    journeyProgress = 0;
  } else {
    // Start journey
    isJourneyMode = true;
    btn.classList.add('playing');
    icon.textContent = '⏸';
    controls.autoRotate = false;
    journeyProgress = 0;
  }
}

function updateJourneyMode(delta) {
  if (!isJourneyMode) return;

  journeyProgress += delta * 0.05; // Speed of journey

  if (journeyProgress > 1) {
    journeyProgress = 0; // Loop
  }

  // Camera path: from valley (Phase 1) to summit (Approved)
  // Start position: wide view of valley
  // End position: close to finish marker

  const startPos = new THREE.Vector3(0, 60, 120);
  const endPos = new THREE.Vector3(0, 55, 20);

  // Add some curve to the path
  const curve = new THREE.QuadraticBezierCurve3(
    startPos,
    new THREE.Vector3(60, 80, 70),
    endPos
  );

  const point = curve.getPoint(journeyProgress);
  camera.position.copy(point);

  // Look at the center, gradually moving up
  const lookAtY = 5 + journeyProgress * 40;
  controls.target.set(0, lookAtY, -journeyProgress * 30);
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
let lastTime = 0;

function animate(currentTime = 0) {
  requestAnimationFrame(animate);

  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  const time = Date.now() * 0.001;

  controls.update();

  // Journey mode
  if (isJourneyMode && delta) {
    updateJourneyMode(delta);
  }

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

  // Animate active trial markers with smoother easing
  trialMarkers.forEach((marker, i) => {
    const trial = marker.userData.trial;
    if (!marker.visible) return;

    // Smooth floating animation for active trials
    if (trial.status === 'active' || trial.status === 'recruiting') {
      const floatY = Math.sin(time * 1.5 + i * 0.5) * 0.3;
      const targetY = marker.userData.baseY + floatY;
      marker.parent.position.y += (targetY - marker.parent.position.y) * 0.05;
      marker.rotation.y += 0.003;
    }

    // Smooth scale transitions
    const targetScale = marker.visible ? 1 : 0.1;
    const currentScale = marker.parent.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.1;
    marker.parent.scale.set(newScale, newScale, newScale);
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
