import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

class BoxVisualization {
  constructor(containerDimensions, smallerBoxes) {
    // Container dimensions
    this.containerLength = containerDimensions.length;
    this.containerBreadth = containerDimensions.breadth;
    this.containerHeight = containerDimensions.height;
    this.containerVolume = containerDimensions.totalVolume;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0); // Light gray background
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // Font loader
    this.fontLoader = new FontLoader();

    // Prepare boxes with collision detection
    this.smallerBoxes = this.optimizeBoxPlacement(smallerBoxes);

    this.init();
  }

  // New method to prevent box overlap
  optimizeBoxPlacement(boxes) {
    const placedBoxes = [];

    // Sort boxes from largest to smallest to optimize placement
    const sortedBoxes = [...boxes].sort((a, b) =>
      (b.length * b.breadth * b.height) - (a.length * a.breadth * a.height)
    );

    for (const box of sortedBoxes) {
      let placed = false;

      // Try different positions within the container
      for (let x = 0; x <= this.containerLength - box.length; x += 0.1) {
        for (let z = 0; z <= this.containerBreadth - box.breadth; z += 0.1) {
          // Check vertical stacking
          for (let y = 0; y <= this.containerHeight - box.height; y += 0.1) {
            const potentialPosition = {
              ...box,
              x,
              y,
              z
            };

            // Check if this position conflicts with any placed boxes
            if (!this.checkBoxCollision(potentialPosition, placedBoxes)) {
              placedBoxes.push(potentialPosition);
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }

      // If box couldn't be placed, log a warning
      if (!placed) {
        console.warn(`Could not place box with id ${box.id} in the container`);
      }
    }

    return placedBoxes;
  }

  // Collision detection method
  checkBoxCollision(newBox, existingBoxes) {
    return existingBoxes.some(existingBox => {
      return (
        newBox.x < existingBox.x + existingBox.length &&
        newBox.x + newBox.length > existingBox.x &&
        newBox.y < existingBox.y + existingBox.height &&
        newBox.y + newBox.height > existingBox.y &&
        newBox.z < existingBox.z + existingBox.breadth &&
        newBox.z + newBox.breadth > existingBox.z
      );
    });
  }

  init() {
    // Renderer setup
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Camera positioning
    const maxDimension = Math.max(
      this.containerLength,
      this.containerBreadth,
      this.containerHeight
    );
    this.camera.position.set(maxDimension * 2, maxDimension * 2, maxDimension * 2);
    this.camera.lookAt(0, 0, 0);

    // Orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Create container
    this.createContainer();

    // Load font and create boxes
    this.fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      this.font = font;
      this.createSmallBoxes();
    });

    // Add lighting
    this.addLighting();

    // Start animation
    this.animate();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  createContainer() {
    // Create container with open top
    const containerGeometry = new THREE.BoxGeometry(
      this.containerLength,
      this.containerHeight,
      this.containerBreadth
    );

    // Create materials for each face
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.3 }), // Right
      new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.3 }), // Left
      new THREE.MeshStandardMaterial({ visible: false }), // Top (removed)
      new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.3 }), // Bottom
      new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.3 }), // Front
      new THREE.MeshStandardMaterial({ color: 0x888888, transparent: true, opacity: 0.3 })  // Back
    ];

    const container = new THREE.Mesh(containerGeometry, materials);
    this.scene.add(container);

    // Add a wireframe to help visualize the container
    const wireframeGeometry = new THREE.EdgesGeometry(containerGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    this.scene.add(wireframe);
  }

  createSmallBoxes() {
    console.log('Creating small boxes:', this.smallerBoxes);

    this.smallerBoxes.forEach((box, index) => {
      // Create geometry for each small box
      const boxGeometry = new THREE.BoxGeometry(
        box.length,
        box.height,
        box.breadth
      );

      // Generate a unique color based on the box's index
      const hue = (index * 137.508) % 360; // Golden angle method for color distribution
      const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);

      const boxMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
      });

      const smallBox = new THREE.Mesh(boxGeometry, boxMaterial);

      // Adjusted positioning to center within the container
      smallBox.position.set(
        box.x - this.containerLength / 2 + box.length / 2,
        box.y + box.height / 2,
        box.z - this.containerBreadth / 2 + box.breadth / 2
      );

      // Log box position for debugging
      console.log(`Box ${box.id} position:`, {
        x: smallBox.position.x,
        y: smallBox.position.y,
        z: smallBox.position.z
      });

      // Add box edges for better visibility
      const edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
      const boxEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      boxEdges.position.copy(smallBox.position);

      // Create 3D text for box ID
      if (this.font) {
        const textGeometry = new TextGeometry(`ID: ${box.id}`, {
          font: this.font,
          size: Math.min(box.length, box.breadth, box.height) / 2,
          height: 0.05,
        });

        const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Position text above and slightly to the side of the box
        textMesh.position.set(
          smallBox.position.x + box.length / 2,
          smallBox.position.y + box.height + 0.1,
          smallBox.position.z
        );

        // Rotate text to be more readable
        textMesh.rotation.y = Math.PI / 4;

        this.scene.add(textMesh);
      }

      this.scene.add(smallBox);
      this.scene.add(boxEdges);
    });
  }

  addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Additional point light
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);
  }

  animate() {
    const animation = () => {
      requestAnimationFrame(animation);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animation();
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Example usage with more spread out boxes
const containerDimensions = {
  length: 10,
  breadth: 5,
  height: 4,
  totalVolume: 200,
};

const smallerBoxes = [
  { id: 1, length: 2, breadth: 1.5, height: 1, volume: 3, x: 2, y: 0, z: 0 },
  { id: 2, length: 1.5, breadth: 1, height: 2, volume: 3, x: 3.5, y: 0, z: 0 },
  { id: 3, length: 3, breadth: 1, height: 1, volume: 3, x: 6.5, y: 0, z: 0 },
  { id: 4, length: 0.5, breadth: 0.5, height: 0.5, volume: 0.125, x: 7, y: 0, z: 0 },
  { id: 5, length: 4, breadth: 2, height: 1.5, volume: 12, x: 0, y: 0, z: 0 }
];

/* 
const containerDimentions = {
  length: 10,
  breadth: 5,
  height: 4,
  totalVolume: 200,
};

const smallerBoxes = [
  { id: 1, length: 2, breadth: 1.5, height: 1, volume: 3, x: 2, y: 0, z: 0 },
  { id: 2, length: 1.5, breadth: 1, height: 2, volume: 3, x: 3.5, y: 0, z: 0 },
  { id: 3, length: 3, breadth: 1, height: 1, volume: 3, x: 6.5, y: 0, z: 0 },
  { id: 4, length: 0.5, breadth: 0.5, height: 0.5, volume: 0.125, x: 7, y: 0, z: 0 },
  { id: 5, length: 4, breadth: 2, height: 1.5, volume: 12, x: 0, y: 0, z: 0 }
];
*/

// Initialize the visualization
// const boxVisualization = new BoxVisualization(containerDimensions, smallerBoxes);