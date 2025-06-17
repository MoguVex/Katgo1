const aboutButton = document.getElementById('about_button');
const aboutOverlay = document.getElementById('about-overlay');
const closeAboutButton = document.getElementById('close-about');
const menu = document.getElementById('menu');
const infoPanel = document.getElementById('info-panel');
const audioControls = document.getElementById('audio_controls');
const playButton = document.getElementById('play_button');
const toggleInfoButton = document.getElementById('toggle-info');
const infoContent = document.getElementById('info-content');
const paintingInfoPopup = document.getElementById('painting-info-popup');
const paintingTitle = document.getElementById('painting-title');
const paintingArtist = document.getElementById('painting-artist');
const paintingDescription = document.getElementById('painting-description');
const moreInfoButton = document.getElementById('more-info-button');
const paintingPrice = document.getElementById('painting-price');
const requestItemButton = document.getElementById('request-item-button');

const customAlertOverlay = document.getElementById('custom-alert-overlay');
const customAlertMessage = document.getElementById('custom-alert-message');
const customAlertOkButton = document.getElementById('custom-alert-ok-button');

// Joystick elements
const joystickContainer = document.getElementById('joystick-container');
const joystickBase = document.getElementById('joystick-base');
const joystickHandle = document.getElementById('joystick-handle');

let joystickActive = false;
let joystickCenterX, joystickCenterY;
let joystickRadius;
let touchStartX, touchStartY; // For camera look around

const showAboutOverlay = () => {
  aboutOverlay.classList.add('visible');
  menu.style.display = 'none';
};

const hideAboutOverlay = () => {
  aboutOverlay.classList.remove('visible');
  menu.style.display = 'flex';
};

if (aboutButton) {
  aboutButton.addEventListener('click', showAboutOverlay);
} else {
  console.error('About button not found!');
}

if (closeAboutButton) {
  closeAboutButton.addEventListener('click', hideAboutOverlay);
} else {
  console.error('Close about button not found!');
}

let isInfoPanelVisible = true;
if (toggleInfoButton && infoContent) {
    toggleInfoButton.addEventListener('click', () => {
        isInfoPanelVisible = !isInfoPanelVisible;
        infoContent.style.display = isInfoPanelVisible ? 'block' : 'none';
        toggleInfoButton.textContent = isInfoPanelVisible ? 'Hide' : 'Show';
    });
} else {
    console.error('Info panel elements not found!');
}


let scene, camera, renderer, playerObject;
let isPlaying = false;
let pictures = [];
let sculpture;
let currentDisplayedSculptureId = null;

const roomWidth = 20;
const roomDepth = 30;
const roomHeight = 10;

const picturesData = [
    {
      url: './p1.jpg',
      width: 5, height: 3.5,
      x: -6, y: roomHeight / 2, z: -roomDepth / 2 + 0.01,
      rotationY: 0,
      info: {
        title: "Serene Landscape",
        artist: "A. Visionary",
        description: "A calming landscape with soft hues and distant mountains, inviting contemplation.",
        fullDescription: "This piece captures the serene beauty of a sunrise over a vast, untouched landscape. The artist, A. Visionary, uses a subtle color palette to evoke a sense of peace and introspection, making the viewer feel as if they are truly present in this tranquil scene. The intricate details of the distant mountains and the gentle gradient of the sky highlight the artist's mastery of light and shadow.",
        price: "₱1,200,000"
      }
    },
    {
      url: './p9.jpg',
      width: 5, height: 3.5,
      x: 0, y: roomHeight / 2, z: -roomDepth / 2 + 0.01,
      rotationY: 0,
      info: {
        title: "Las Virgenes Cristianas Expuestas al Populacho",
        artist: "Félix Resurrección Hidalgo",
        Technique: "Oil on canvas",
        Date: "1884",

        description: "This painting was a silver medalist during the 1884 Exposicion General de Bellas Artes in Madrid, Spain, also known as the Madrid Exposition. Hidalgo’s winning the silver medal for the painting was a landmark achievement that proved the ability of Filipinos to match the work of Spaniards and laid claim to Filipino participation in European culture. Sadly, what we have now at the Bangko Sentral ng Filipinas is just a copy, because the original one was destroyed in a fire at the University of Valladolid in Spain.",
        fullDescription: "This painting, 'Las Virgenes Cristianas Expuestas al Populacho,' was a silver medalist at the 1884 Exposicion General de Bellas Artes in Madrid, Spain. Hidalgo’s achievement was a landmark, proving Filipinos could match European artists and claim participation in European culture. The original piece was tragically lost in a fire at the University of Valladolid, Spain, and what we have today at the Bangko Sentral ng Filipinas is a copy. The painting depicts two Christian virgins exposed to the populace, highlighting themes of sacrifice and enduring faith against oppression.",
        price: "₱5,000,000"
      }
    },
    {
      url: './p10.jpg',
      width: 5, height: 3.5,
      x: 6, y: roomHeight / 2, z: -roomDepth / 2 + 0.01,
      rotationY: 0,
      info: {
        title: "Fruit Gatherer",
        artist: "Fernando Amorsolo",
        Technique: "Oil on canvas",
        Date: "1950",
        
        description: "Amorsolo is one of the most important painters in Filipino Art History. His paintings were able to embody the simplicity of Filipinos, in its daily lives and beauty. Just by looking at this painting, we can all say that the “Fruit Gatherer” is the original dalagang filipina.",
        fullDescription: "Fernando Amorsolo, a pivotal figure in Filipino Art History, is celebrated for his ability to capture the simple beauty of everyday Filipino life in his paintings. 'Fruit Gatherer,' created in 1950, is a prime example, embodying the quintessential 'dalagang Filipina' (Filipina maiden) with its vibrant colors and serene depiction of rural life. Amorsolo's signature use of light illuminates the scene, emphasizing the grace and industriousness of the subject, making it a timeless representation of Filipino charm and resilience.",
        price: "₱3,500,000"
      }
    },
    {
      url: './p2.jpg',
      width: 4, height: 5,
      x: -roomWidth / 2 + 0.01, y: roomHeight / 2, z: -7.5,
      rotationY: Math.PI / 2,
      info: {
        title: "Las Virgenes Cristianas Expuestas al Populacho",
        artist: "Félix Resurrección Hidalgo",
        Technique: "	Oil on canvas",
        Date: "1950",
        
        description: "This painting was a silver medalist during the 1884 Exposicion General de Bellas Artes in Madrid, Spain, also known as the Madrid Exposition. Hidalgo’s winning the silver medal for the painting was a landmark achievement that proved the ability of Filipinos to match the work of Spaniards and laid claim to Filipino participation in European culture. Sadly, what we have now at the Bangko Sentral ng Filipinas is just a copy, because the original one was destroyed in a fire at the University of Valladolid in Spain.",
        fullDescription: "This painting, 'Las Virgenes Cristianas Expuestas al Populacho,' was a silver medalist at the 1884 Exposicion General de Bellas Artes in Madrid, Spain. Hidalgo’s achievement was a landmark, proving Filipinos could match European artists and claim participation in European culture. The original piece was tragically lost in a fire at the University of Valladolid, Spain, and what we have today at the Bangko Sentral ng Filipinas is a copy. The painting depicts two Christian virgins exposed to the populace, highlighting themes of sacrifice and enduring faith against oppression.",
        price: "₱4,800,000"
      }
    },
    {
      url: './p3.jpg',
      width: 4, height: 5,
      x: -roomWidth / 2 + 0.01, y: roomHeight / 2, z: 7.5,
      rotationY: Math.PI / 2,
      info: {
        title: "Madonna of the Slums",
        artist: "Vicente Manansala",
        Technique: "Oil paint",
        Date: "1950",
        
        description: "Manansala is a Filipino National Artist in Visual Arts and a Filipino cubist artist and illustrator. He developed a new imagery based on the postwar urban experience. The city of Manila, through the vision of the artist, assumed a strong folk character. He painted an innovative mother and child, Madonna of the Slums, in 1950, which reflected the poverty in postwar Manila.",
        fullDescription: "Vicente Manansala, a revered Filipino National Artist in Visual Arts and a cubist, pioneered a fresh artistic vision rooted in the post-World War II urban experience. His 1950 painting, 'Madonna of the Slums,' stands as a powerful testament to this, uniquely imbuing the city of Manila with a strong folk character. This innovative depiction of a mother and child starkly reflects the widespread poverty prevalent in Manila during the postwar era, offering a poignant social commentary through his distinct artistic style.",
        price: "Not For Sale"
      }
    },
    {
      url: './p4.jpg',
      width: 4, height: 4,
      x: roomWidth / 2 - 0.01, y: roomHeight / 2, z: -7.5,
      rotationY: -Math.PI / 2,
      info: {
        title: "España y Filipinas",
        artist: "Juan Luna",
        Technique: "Oil on wood",
        Date: "1886",

        description: "España y Filipinas, meaning “Spain and the Philippines”, is an 1886 oil on wood by Filipino painter, ilustrado, and revolutionary activist, Juan Luna. It is an allegorical depiction of two women together, one a representation of Spain and the other of the Philippines. The painting, also known as España Guiando a Filipinas (“Spain Leading the Philippines“), is regarded as one of the “enduring pieces of legacy” that the Filipinos inherited from Luna. The painting is a centerpiece art at the Luna Hall of the Lopez Memorial Museum.",
        fullDescription: "Juan Luna's 'España y Filipinas' (Spain and the Philippines), painted in 1886, is a significant allegorical oil on wood artwork. It portrays two women, symbolizing Spain and the Philippines, together. Also known as 'España Guiando a Filipinas' (Spain Leading the Philippines), the painting is a cherished part of the Filipino legacy inherited from Luna. This piece is prominently displayed at the Luna Hall of the Lopez Memorial Museum and visually represents the complex historical relationship between the two nations, with Spain often depicted as a guiding figure.",
        price: "Not For Sale"
      }
    },
    {
      url: './p5.jpg',
      width: 4, height: 4,
      x: roomWidth / 2 - 0.01, y: roomHeight / 2, z: 7.5,
      rotationY: -Math.PI / 2,
      info: {
        title: "Planting Rice",
        artist: "Fernando Amorsolo",
        description: "Amorsolo painted a few versions of this painting. He wanted to capture the traditional Filipino occupation and the farm life of men and women in a hot sunny day. This representation depicts how enduring they are, and how the farmers work together.",
        fullDescription: "Fernando Amorsolo, a prolific Filipino artist, created multiple versions of 'Planting Rice' to immortalize the traditional Filipino farming occupation. These paintings vividly portray the daily lives of men and women toiling in the fields under the bright sun. Through this artwork, Amorsolo not only captures the enduring spirit of the Filipino farmer but also emphasizes the communal effort and unity that define their agricultural practices, celebrating the dignity of rural labor.",
        price: "Not For Sale"
      }
    },
    {
      url: './p6.jpg',
      width: 5, height: 3.5,
      x: -6, y: roomHeight / 2, z: roomDepth / 2 - 0.01,
      rotationY: Math.PI,
      info: {
        title: "Abstract Flow",
        artist: "Fluid Forms",
        description: "Intertwining shapes and vibrant gradients creating a sense of continuous motion and harmony.",
        fullDescription: "Abstract Flow is an immersive piece by Fluid Forms, characterized by its intertwining shapes and vibrant gradients. The artwork masterfully creates a sense of continuous motion and harmony, drawing the viewer's eye through a dynamic interplay of color and form. It represents the artist's exploration of fluid dynamics and the beauty found in organic, evolving structures.",
        price: "₱850,000"
      }
    },
    {
      url: './p11.jpg',
      width: 5, height: 3.5,
      x: 0, y: roomHeight / 2, z: roomDepth / 2 - 0.01,
      rotationY: Math.PI,
      info: {
        title: "El asesinato del Gobernador Bustamante (The Assassination of Governor Bustamante)",
        artist: "Félix Resurrección Hidalgo",
        Technique: "Oil on Canvas",
        Date: "1886",
        description: "This painting is Hidalgo’s interpretation of a violent and historical event involving Fernando Bustamante and the Spanish friars in Manila during the Spanish colonial period.",
        //fullDescription: "Juan Luna's 'The Blood Compact' is a pivotal historical painting that vividly depicts the 1565 Sandugo (blood compact ritual) between Datu Sikatuna of Bohol and Miguel López de Legazpi. This iconic scene symbolizes the peaceful agreement and friendship between the indigenous Filipinos and the Spanish conquistadors, though Luna's composition subtly highlights the dominance of the Spanish figures. It remains a significant work in Filipino art, representing a crucial moment in the nation's colonial history.",
        price: "₱6,000,000"
      }
    },
    {
      url: './p12.jpg',
      width: 5, height: 3.5,
      x: 6, y: roomHeight / 2, z: roomDepth / 2 - 0.01,
      rotationY: Math.PI,
      info: {
        title: "Progress of Medicine in the Philippines",
        artist: "Carlos V. Francisco",
        description: "This painting completed in 1953 is composed of four parts. It  depicted the evolution of healing practices in the Philippines from the pre-colonial period to the modern period ",
        fullDescription: "Ephemeral Beauty by Momentary Glimpse is a delicate yet powerful artwork that captures the fleeting nature of beauty. The artist employs soft, diffused lighting and translucent layers to suggest the transient quality of natural light and forms. This piece encourages contemplation on the passage of time and the subtle, momentary wonders that often go unnoticed.",
        price: "₱900,000"
      }
    }
  ];


function createFramedPicture(picData, textureLoader) {
    const frameThickness = 0.1;
    const frameDepth = 0.05;

    textureLoader.load(
        picData.url,
        (loadedTexture) => {
            const pictureMaterial = new THREE.MeshBasicMaterial({ map: loadedTexture });
            const pictureGeometry = new THREE.PlaneGeometry(picData.width, picData.height);
            const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);
            pictureMesh.position.z = frameDepth / 2 + 0.001;

            const frameGeometry = new THREE.BoxGeometry(
                picData.width + frameThickness * 2,
                picData.height + frameThickness * 2,
                frameDepth
            );
            const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x5a2d0d, roughness: 0.8, metalness: 0.1 });

            const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
            frameMesh.position.z = 0;

            const framedGroup = new THREE.Group();
            framedGroup.add(frameMesh);
            framedGroup.add(pictureMesh);

            framedGroup.position.set(picData.x, picData.y, picData.z);
            framedGroup.rotation.y = picData.rotationY;

            framedGroup.userData = { id: picData.id, info: picData.info, isPainting: true };

            scene.add(framedGroup);
            pictures.push(framedGroup);
        },
        undefined,
        (err) => {
            console.error(`An error occurred loading texture for ${picData.url}:`, err);
            const fallbackMaterial = new THREE.MeshBasicMaterial({ color: 0x800080 });
            const fallbackGeometry = new THREE.PlaneGeometry(picData.width, picData.height);
            const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
            fallbackMesh.position.z = frameDepth / 2 + 0.001;

            const frameGeometry = new THREE.BoxGeometry(
                picData.width + frameThickness * 2,
                picData.height + frameThickness * 2,
                frameDepth
            );
            const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x5a2d0d, roughness: 0.8, metalness: 0.1 });
            const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);

            const framedGroup = new THREE.Group();
            framedGroup.add(frameMesh);
            framedGroup.add(fallbackMesh);
            framedGroup.position.set(picData.x, picData.y, picData.z);
            framedGroup.rotation.y = picData.rotationY;
            framedGroup.userData = { id: picData.id, info: picData.info, isPainting: true };
            scene.add(framedGroup);
            pictures.push(framedGroup);
        }
    );
}
// ... (existing code)

function init3DScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 0);

  playerObject = new THREE.Group();
  scene.add(playerObject);
  playerObject.add(camera);
  playerObject.position.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const threejsContainer = document.getElementById('threejs-container');
  if (threejsContainer) {
    threejsContainer.appendChild(renderer.domElement);
  } else {
    console.error('Three.js container not found!');
    return;
  }

  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const skyboxTextures = [
    './art1.jpg', '.art1.jpg', 'art1.jpg',
    '.art1.jpg', '.art1.jpg', '.art1.jpg'
  ];

  const skybox = cubeTextureLoader.load(skyboxTextures,
    () => {
      scene.background = skybox;
    },
    undefined,
    (err) => {
      console.error('An error occurred loading the skybox:', err);
      scene.background = new THREE.Color(0x1a1a1a);
    }
  );

  const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide });
  const floorTextureLoader = new THREE.TextureLoader();
  floorTextureLoader.load(
    './marbel.jpg',
    function (texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 5);
      floorMaterial.map = texture;
      floorMaterial.needsUpdate = true;
    },
    undefined,
    function (err) {
      console.error('An error occurred loading floor texture:', err);
    }
  );
  floorTextureLoader.load(
      'https://placehold.co/1024x1024/888888/FFFFFF?text=Floor+Normal',
      function (normalMap) {
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(5, 5);
        floorMaterial.normalMap = normalMap;
        floorMaterial.needsUpdate = true;
      },
      undefined,
      function (err) {
        console.error('An error occurred loading floor normal map:', err);
      }
  );
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
  const wallTextureLoader = new THREE.TextureLoader();
  
  wallTextureLoader.load(
    './wall.jpg',
    function (texture) {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      wallMaterial.map = texture;
      wallMaterial.needsUpdate = true;
    },
    undefined,
    function (err) {
      console.error('An error occurred loading wall texture:', err);
    }
  );
  
  wallTextureLoader.load(
      './marbel.jpg',
      function (normalMap) {
        normalMap.wrapS = THREE.ClampToEdgeWrapping;
        normalMap.wrapT = THREE.ClampToEdgeWrapping;
        wallMaterial.normalMap = normalMap;
        wallMaterial.needsUpdate = true;
      },
      undefined,
      function (err) {
        console.error('An error occurred loading wall normal map:', err);
      }
  );

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMaterial);
  backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
  scene.add(backWall);

  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth, roomHeight), wallMaterial);
  frontWall.position.set(0, roomHeight / 2, roomDepth / 2);
  scene.add(frontWall);

  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMaterial);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
  scene.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(roomDepth, roomHeight), wallMaterial);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
  scene.add(rightWall);

  const newWall1 = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth / 2, roomHeight), wallMaterial);
  newWall1.position.set(-roomWidth / 3, roomHeight / 2, -5.1); 
  scene.add(newWall1);

  const newWall2 = new THREE.Mesh(new THREE.PlaneGeometry(roomWidth / 2, roomHeight), wallMaterial);
  newWall2.rotation.y = Math.PI; 
  newWall2.position.set(roomWidth / 3, roomHeight / 2, 5.1); 
  scene.add(newWall2);

  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 0.5);
  scene.add(hemiLight);

  const textureLoader = new THREE.TextureLoader();
  

  const picturesData = [
    {
      url: './p1.jpg',
      width: 5, height: 3.5,
      x: -6, y: roomHeight / 2, z: -roomDepth / 2 + 0.01,
      rotationY: 0,
      info: {
        title: "Serene Landscape",
        artist: "A. Visionary",
        description: "A calming landscape with soft hues and distant mountains, inviting contemplation.",
        fullDescription: "This piece captures the serene beauty of a sunrise over a vast, untouched landscape. The artist, A. Visionary, uses a subtle color palette to evoke a sense of peace and introspection, making the viewer feel as if they are truly present in this tranquil scene. The intricate details of the distant mountains and the gentle gradient of the sky highlight the artist's mastery of light and shadow.",
        price: "₱1,200,000"
      }
    },
    {
      url: './p9.jpg',
      width: 5, height: 3.5,
      x: 0, y: roomHeight / 2, z: -roomDepth / 2 + 0.01,
      rotationY: 0,
      info: {
        title: "Las Virgenes Cristianas Expuestas al Populacho",
        artist: "Félix Resurrección Hidalgo",
        Technique: "Oil on canvas",
        Date: "1884",

        description: "This painting was a silver medalist during the 1884 Exposicion General de Bellas Artes in Madrid, Spain, also known as the Madrid Exposition. Hidalgo’s winning the silver medal for the painting was a landmark achievement that proved the ability of Filipinos to match the work of Spaniards and laid claim to Filipino participation in European culture. Sadly, what we have now at the Bangko Sentral ng Filipinas is just a copy, because the original one was destroyed in a fire at the University of Valladolid in Spain.",
        fullDescription: "This painting, 'Las Virgenes Cristianas Expuestas al Populacho,' was a silver medalist at the 1884 Exposicion General de Bellas Artes in Madrid, Spain. Hidalgo’s achievement was a landmark, proving Filipinos could match European artists and claim participation in European culture. The original piece was tragically lost in a fire at the University of Valladolid, Spain, and what we have today at the Bangko Sentral ng Filipinas is a copy. The painting depicts two Christian virgins exposed to the populace, highlighting themes of sacrifice and enduring faith against oppression.",
        price: "₱5,000,000"
      }
    },
    {
      url: './p10.jpg',
      width: 5, height: 3.5,
      x: 6, y: roomHeight / 2, z: -roomDepth / 2 + 0.01,
      rotationY: 0,
      info: {
        title: "Fruit Gatherer",
        artist: "Fernando Amorsolo",
        Technique: "Oil on canvas",
        Date: "1950",
        
        description: "Amorsolo is one of the most important painters in Filipino Art History. His paintings were able to embody the simplicity of Filipinos, in its daily lives and beauty. Just by looking at this painting, we can all say that the “Fruit Gatherer” is the original dalagang filipina.",
        fullDescription: "Fernando Amorsolo, a pivotal figure in Filipino Art History, is celebrated for his ability to capture the simple beauty of everyday Filipino life in his paintings. 'Fruit Gatherer,' created in 1950, is a prime example, embodying the quintessential 'dalagang Filipina' (Filipina maiden) with its vibrant colors and serene depiction of rural life. Amorsolo's signature use of light illuminates the scene, emphasizing the grace and industriousness of the subject, making it a timeless representation of Filipino charm and resilience.",
        price: "₱3,500,000"
      }
    },
    {
      url: './p2.jpg',
      width: 4, height: 5,
      x: -roomWidth / 2 + 0.01, y: roomHeight / 2, z: -7.5,
      rotationY: Math.PI / 2,
      info: {
        title: "Las Virgenes Cristianas Expuestas al Populacho",
        artist: "Félix Resurrección Hidalgo",
        Technique: "	Oil on canvas",
        Date: "1950",
        
        description: "This painting was a silver medalist during the 1884 Exposicion General de Bellas Artes in Madrid, Spain, also known as the Madrid Exposition. Hidalgo’s winning the silver medal for the painting was a landmark achievement that proved the ability of Filipinos to match the work of Spaniards and laid claim to Filipino participation in European culture. Sadly, what we have now at the Bangko Sentral ng Filipinas is just a copy, because the original one was destroyed in a fire at the University of Valladolid in Spain.",
        fullDescription: "This painting, 'Las Virgenes Cristianas Expuestas al Populacho,' was a silver medalist at the 1884 Exposicion General de Bellas Artes in Madrid, Spain. Hidalgo’s achievement was a landmark, proving Filipinos could match European artists and claim participation in European culture. The original piece was tragically lost in a fire at the University of Valladolid, Spain, and what we have today at the Bangko Sentral ng Filipinas is a copy. The painting depicts two Christian virgins exposed to the populace, highlighting themes of sacrifice and enduring faith against oppression.",
        price: "₱4,800,000"
      }
    },
    {
      url: './p3.jpg',
      width: 4, height: 5,
      x: -roomWidth / 2 + 0.01, y: roomHeight / 2, z: 7.5,
      rotationY: Math.PI / 2,
      info: {
        title: "Madonna of the Slums",
        artist: "Vicente Manansala",
        Technique: "Oil paint",
        Date: "1950",
        
        description: "Manansala is a Filipino National Artist in Visual Arts and a Filipino cubist artist and illustrator. He developed a new imagery based on the postwar urban experience. The city of Manila, through the vision of the artist, assumed a strong folk character. He painted an innovative mother and child, Madonna of the Slums, in 1950, which reflected the poverty in postwar Manila.",
        fullDescription: "Vicente Manansala, a revered Filipino National Artist in Visual Arts and a cubist, pioneered a fresh artistic vision rooted in the post-World War II urban experience. His 1950 painting, 'Madonna of the Slums,' stands as a powerful testament to this, uniquely imbuing the city of Manila with a strong folk character. This innovative depiction of a mother and child starkly reflects the widespread poverty prevalent in Manila during the postwar era, offering a poignant social commentary through his distinct artistic style.",
        price: "Not For Sale"
      }
    },
    {
      url: './p4.jpg',
      width: 4, height: 4,
      x: roomWidth / 2 - 0.01, y: roomHeight / 2, z: -7.5,
      rotationY: -Math.PI / 2,
      info: {
        title: "España y Filipinas",
        artist: "Juan Luna",
        Technique: "Oil on wood",
        Date: "1886",

        description: "España y Filipinas, meaning “Spain and the Philippines”, is an 1886 oil on wood by Filipino painter, ilustrado, and revolutionary activist, Juan Luna. It is an allegorical depiction of two women together, one a representation of Spain and the other of the Philippines. The painting, also known as España Guiando a Filipinas (“Spain Leading the Philippines“), is regarded as one of the “enduring pieces of legacy” that the Filipinos inherited from Luna. The painting is a centerpiece art at the Luna Hall of the Lopez Memorial Museum.",
        fullDescription: "Juan Luna's 'España y Filipinas' (Spain and the Philippines), painted in 1886, is a significant allegorical oil on wood artwork. It portrays two women, symbolizing Spain and the Philippines, together. Also known as 'España Guiando a Filipinas' (Spain Leading the Philippines), the painting is a cherished part of the Filipino legacy inherited from Luna. This piece is prominently displayed at the Luna Hall of the Lopez Memorial Museum and visually represents the complex historical relationship between the two nations, with Spain often depicted as a guiding figure.",
        price: "Not For Sale"
      }
    },
    {
      url: './p5.jpg',
      width: 4, height: 4,
      x: roomWidth / 2 - 0.01, y: roomHeight / 2, z: 7.5,
      rotationY: -Math.PI / 2,
      info: {
        title: "Planting Rice",
        artist: "Fernando Amorsolo",
        description: "Amorsolo painted a few versions of this painting. He wanted to capture the traditional Filipino occupation and the farm life of men and women in a hot sunny day. This representation depicts how enduring they are, and how the farmers work together.",
        fullDescription: "Fernando Amorsolo, a prolific Filipino artist, created multiple versions of 'Planting Rice' to immortalize the traditional Filipino farming occupation. These paintings vividly portray the daily lives of men and women toiling in the fields under the bright sun. Through this artwork, Amorsolo not only captures the enduring spirit of the Filipino farmer but also emphasizes the communal effort and unity that define their agricultural practices, celebrating the dignity of rural labor.",
        price: "Not For Sale"
      }
    },
    {
      url: './p6.jpg',
      width: 5, height: 3.5,
      x: -6, y: roomHeight / 2, z: roomDepth / 2 - 0.01,
      rotationY: Math.PI,
      info: {
        title: "Abstract Flow",
        artist: "Fluid Forms",
        description: "Intertwining shapes and vibrant gradients creating a sense of continuous motion and harmony.",
        fullDescription: "Abstract Flow is an immersive piece by Fluid Forms, characterized by its intertwining shapes and vibrant gradients. The artwork masterfully creates a sense of continuous motion and harmony, drawing the viewer's eye through a dynamic interplay of color and form. It represents the artist's exploration of fluid dynamics and the beauty found in organic, evolving structures.",
        price: "₱850,000"
      }
    },
    {
      url: './p7.jpg',
      width: 5, height: 3.5,
      x: 0, y: roomHeight / 2, z: roomDepth / 2 - 0.01,
      rotationY: Math.PI,
      info: {
        title: "The Blood Compact",
        artist: "Juan Luna",
        Technique: "Oil on Canvas",
        Date: "1886",
        description: "The Blood Compact is an “historic and historical” painting by Filipino painter Juan Luna. The scene painted by the artist portrays the 1565 Sandugo (blood compact ritual) between Datu Sikatuna of Bohol and Miguel López de Legazpi, surrounded by other conquistadores.",
        fullDescription: "Juan Luna's 'The Blood Compact' is a pivotal historical painting that vividly depicts the 1565 Sandugo (blood compact ritual) between Datu Sikatuna of Bohol and Miguel López de Legazpi. This iconic scene symbolizes the peaceful agreement and friendship between the indigenous Filipinos and the Spanish conquistadors, though Luna's composition subtly highlights the dominance of the Spanish figures. It remains a significant work in Filipino art, representing a crucial moment in the nation's colonial history.",
        price: "₱6,000,000"
      }
    },
    {
      url: './p8.jpg',
      width: 5, height: 3.5,
      x: 6, y: roomHeight / 2, z: roomDepth / 2 - 0.01,
      rotationY: Math.PI,
      info: {
        title: "Ephemeral Beauty",
        artist: "Momentary Glimpse",
        description: "Capturing the fleeting essence of beauty, inspired by natural phenomena and light.",
        fullDescription: "Ephemeral Beauty by Momentary Glimpse is a delicate yet powerful artwork that captures the fleeting nature of beauty. The artist employs soft, diffused lighting and translucent layers to suggest the transient quality of natural light and forms. This piece encourages contemplation on the passage of time and the subtle, momentary wonders that often go unnoticed.",
        price: "Not for sale"
      }
    },
    {
      url: './p12.jpg', 
      width: 4.5, height: 3,
      x: -6, y: roomHeight / 2, z: -4.99, 
      rotationY: 0,
      info: {
        title: "El asesinato del Gobernador Bustamante (The Assassination of Governor Bustamante",
        artist: "Félix Resurrección Hidalgo",
        description: "This painting is Hidalgo’s interpretation of a violent and historical event involving Fernando Bustamante and the Spanish friars in Manila during the Spanish colonial period.",
        //fullDescription: "This painting captures the vibrant energy of a city transitioning from day to night. The artist uses a rich palette of oranges, purples, and deep blues to depict the sky and the illuminated buildings, creating a sense of dynamic movement and urban grandeur. 'City at Dusk' invites viewers to reflect on the beauty and complexity of modern metropolitan environments.",
        price: "Not for sale"
      }
    },
    {
      url: './p11.jpg', 
      width: 4.5, height: 4,
      x: 6, y: roomHeight / 2, z: 4.99, 
      rotationY: Math.PI,
      info: {
        title: "Progress of Medicine in the Philippines",
        artist: "Carlos V. Francisco",
        description: "This painting completed in 1953 is composed of four parts. It  depicted the evolution of healing practices in the Philippines from the pre-colonial period to the modern period",
        //fullDescription: "Cosmic Dance is an expansive and breathtaking exploration of the universe's wonders. Stellar Art uses a dazzling array of colors and intricate patterns to bring to life the swirling forms of galaxies and the luminous beauty of nebulae. The painting invites contemplation on the vastness of space and humanity's place within it.",
        price: "₱2,000,000"
      }
    }
  ];

  picturesData.forEach((pic, index) => {
      pic.id = index;
      createFramedPicture(pic, textureLoader);
  });

  window.addEventListener('resize', onWindowResize, false);

  if (requestItemButton) {
      requestItemButton.addEventListener('click', () => {
          if (currentDisplayedPaintingId !== null) {
              const paintingData = picturesData[currentDisplayedPaintingId];
              console.log(`Requesting item: ${paintingData.info.title} by ${paintingData.info.artist}. Price: ${paintingData.info.price}`);
              showCustomAlert(`You have requested information for "${paintingData.info.title}". Please click OK to view seller details.`, () => {
                  disablePointerLock();
                  window.open('seller.html', '_blank'); // Assuming seller.html is the correct file
              });
          }
      });
  } else {
      console.error('Request Item button not found!');
  }

    if (joystickBase) {
        const rect = joystickBase.getBoundingClientRect();
        joystickCenterX = rect.left + rect.width / 2;
        joystickCenterY = rect.top + rect.height / 2;
        joystickRadius = rect.width / 2;
    }
}


function showCustomAlert(message, callback) {
    if (customAlertOverlay && customAlertMessage && customAlertOkButton) {
        customAlertMessage.textContent = message;
        customAlertOverlay.classList.add('visible');

        const handleOkClick = () => {
            customAlertOverlay.classList.remove('visible');
            customAlertOkButton.removeEventListener('click', handleOkClick);
            if (callback && typeof callback === 'function') {
                callback();
            }
        };
        customAlertOkButton.addEventListener('click', handleOkClick);
    } else {
        console.error('Custom alert elements not found!');
        alert(message);
        if (callback && typeof callback === 'function') {
            callback();
        }
    }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

    if (joystickBase) {
        const rect = joystickBase.getBoundingClientRect();
        joystickCenterX = rect.left + rect.width / 2;
        joystickCenterY = rect.top + rect.height / 2;
        joystickRadius = rect.width / 2;
    }
}

let isPointerLocked = false;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
const moveSpeed = 0.1;
let currentDisplayedPaintingId = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(0, 0);
const interactionDistance = 5;

const enablePointerLock = () => {
  const targetElement = document.getElementById('threejs-container');
  if (targetElement && targetElement.requestPointerLock) {
    targetElement.requestPointerLock();
    console.log('Attempting to enable pointer lock on threejs-container');
  } else {
      console.warn('Pointer Lock API not supported or target element for requestPointerLock not found. Ensure you are interacting with a browser that supports pointer lock and the element exists.');
  }
};

const disablePointerLock = () => {
  if (document.exitPointerLock) {
    document.exitPointerLock();
    console.log('Exiting pointer lock.');
  }
};

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === document.getElementById('threejs-container');
  console.log('Pointer Lock state changed. isPointerLocked:', isPointerLocked);

  if (isPointerLocked) {
    isPlaying = true;
    infoPanel.style.display = 'block';
    audioControls.style.display = 'flex';
    menu.style.display = 'none';
    // Hide joystick on desktop when pointer is locked
    if (window.innerWidth > 768) { // Only hide if it's a desktop
        joystickContainer.style.display = 'none';
    }
  } else {
    isPlaying = false;
    infoPanel.style.display = 'none';
    audioControls.style.display = 'none';
    paintingInfoPopup.classList.remove('visible');
    currentDisplayedPaintingId = null;
    requestItemButton.style.display = 'none';

    menu.style.display = 'flex';
    // Show joystick on mobile when pointer is not locked (or when leaving the game)
    if (window.innerWidth <= 768) { // Only show if it's a mobile device
        joystickContainer.style.display = 'block';
    }
  }
});

// For desktop mouse look
document.addEventListener('mousemove', (event) => {
  if (isPointerLocked && window.innerWidth > 768) { // Only apply for desktop and pointer lock
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    playerObject.rotation.y -= movementX * 0.002;
    camera.rotation.x -= movementY * 0.002;

    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
  }
});

// Touch event for mobile camera look
let lastTouchX, lastTouchY;
document.getElementById('threejs-container').addEventListener('touchstart', (event) => {
    if (event.target !== joystickHandle && isPlaying) { // Only for camera if not touching joystick
        lastTouchX = event.touches[0].clientX;
        lastTouchY = event.touches[0].clientY;
        event.preventDefault(); // Prevent scrolling
    }
}, { passive: false });

document.getElementById('threejs-container').addEventListener('touchmove', (event) => {
    if (event.target !== joystickHandle && isPlaying) { // Only for camera if not touching joystick
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;

        const movementX = touchX - lastTouchX;
        const movementY = touchY - lastTouchY;

        playerObject.rotation.y -= movementX * 0.002;
        camera.rotation.x -= movementY * 0.002;

        camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

        lastTouchX = touchX;
        lastTouchY = touchY;
        event.preventDefault(); // Prevent scrolling
    }
}, { passive: false });


// Joystick touch events
joystickHandle.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent default touch actions (like scrolling)
    joystickActive = true;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    joystickHandle.style.transition = 'none'; // Disable transition for immediate movement
});

joystickHandle.addEventListener('touchmove', (e) => {
    if (!joystickActive) return;
    e.preventDefault();

    const touch = e.touches[0];
    let newX = touch.clientX - joystickCenterX;
    let newY = touch.clientY - joystickCenterY;

    const distance = Math.sqrt(newX * newX + newY * newY);
    if (distance > joystickRadius) {
        const angle = Math.atan2(newY, newX);
        newX = joystickRadius * Math.cos(angle);
        newY = joystickRadius * Math.sin(angle);
    }

    joystickHandle.style.transform = `translate(${newX}px, ${newY}px)`;

    // Calculate movement based on joystick position
    moveForward = newY < -joystickRadius * 0.2;
    moveBackward = newY > joystickRadius * 0.2;
    moveLeft = newX < -joystickRadius * 0.2;
    moveRight = newX > joystickRadius * 0.2;
});

joystickHandle.addEventListener('touchend', () => {
    joystickActive = false;
    joystickHandle.style.transition = 'transform 0.2s ease-out'; // Re-enable transition for smooth return
    joystickHandle.style.transform = 'translate(0, 0)'; // Reset handle position
    moveForward = false;
    moveBackward = false;
    moveLeft = false;
    moveRight = false;
});


document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
        case 'Space':
            if (isPointerLocked) {
                disablePointerLock();
            } else {
                enablePointerLock();
            }
            break;
        case 'KeyM':
        case 'Escape':
            if (isPointerLocked) {
                disablePointerLock();
            }
            break;
        case 'Enter':
            if (!isPlaying && menu.style.display !== 'none') {
                startGame();
            }
            break;
        case 'KeyG':
            if (sound && sound.buffer) {
                if (!sound.isPlaying) {
                    sound.play();
                    console.log("Audio guide started via G key.");
                }
            } else {
                console.warn("Audio not loaded yet or buffer is null for G key.");
            }
            break;
        case 'KeyP':
            if (sound && sound.isPlaying) {
                sound.stop();
                console.log("Audio guide stopped via P key.");
            }
            break;
        case 'KeyF':
            if (isPlaying && paintingInfoPopup.classList.contains('visible') && currentDisplayedPaintingId !== null) {
                const paintingData = picturesData[currentDisplayedPaintingId];
                if (paintingData && paintingData.info.fullDescription) {
                    if (paintingDescription.classList.contains('full-description')) {
                        paintingDescription.textContent = paintingData.info.description;
                        if (paintingData.info.Technique) {
                            paintingDescription.textContent += `\nTechnique: ${paintingData.info.Technique}`;
                        }
                        if (paintingData.info.Date) {
                            paintingDescription.textContent += `\nDate: ${paintingData.info.Date}`;
                        }
                        if (paintingData.info.price) {
                            paintingPrice.textContent = `Price: ${paintingData.info.price}`;
                            paintingPrice.style.display = 'block';
                        } else {
                            paintingPrice.textContent = '';
                        }
                        paintingDescription.classList.remove('full-description');
                        moreInfoButton.textContent = 'More Info';
                        if (paintingData.info.price && paintingData.info.price !== "Not For Sale") {
                            requestItemButton.style.display = 'block';
                        }
                    } else {
                        paintingDescription.textContent = paintingData.info.fullDescription;
                        paintingDescription.classList.add('full-description');
                        moreInfoButton.textContent = 'Less Info';
                        paintingPrice.style.display = 'none';
                        requestItemButton.style.display = 'none';
                    }
                }
            }
            break;
          case 'KeyB':
                console.log("B key pressed.");
                if (isPlaying) {
                    console.log("isPlaying is true.");
                    if (paintingInfoPopup.classList.contains('visible') && currentDisplayedPaintingId !== null) {
                        console.log("Painting info popup is visible and currentDisplayedPaintingId is not null:", currentDisplayedPaintingId);
                        disablePointerLock();

                        const paintingData = picturesData[currentDisplayedPaintingId];
                        if (paintingData) {
                            console.log("Painting data found:", paintingData);
                            if (paintingData.info.price && paintingData.info.price !== "Not For Sale") {
                                console.log(`Requesting item (via B key): ${paintingData.info.title} by ${paintingData.info.artist}. Price: ${paintingData.info.price}`);
                                showCustomAlert(`You have requested information for "${paintingData.info.title}". Please click OK to view seller details.`, () => {
                                    window.open('g.html', '_blank'); // Make sure g.html is your seller page
                                });
                            } else if (paintingData.info.price === "Not For Sale") {
                                console.log(`Attempted to request item (via B key) for "${paintingData.info.title}", but it is Not For Sale.`);
                                showCustomAlert(`"${paintingData.info.title}" is not for sale.`);
                            } else {
                                console.log("Painting data has no price property or price is undefined.");
                                showCustomAlert("Could not process request: Painting price information is unavailable.");
                            }
                        } else {
                            console.log("No painting data found for currentDisplayedPaintingId.");
                            showCustomAlert("No painting information available to request.");
                        }
                    } else {
                        console.log("Painting info popup is not visible or no painting is selected. Cannot request item.");
                    }
                } else {
                    console.log("isPlaying is false. Cannot request item.");
                }
                break;
    }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
      moveForward = false;
      break;
    case 'KeyS':
      moveBackward = false;
      break;
    case 'KeyA':
      moveLeft = false;
      break;
    case 'KeyD':
      moveRight = false;
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  if (isPlaying) {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const right = new THREE.Vector3().crossVectors(direction, camera.up);

    const moveVector = new THREE.Vector3();
    if (moveForward) {
      moveVector.add(direction);
    }
    if (moveBackward) {
      moveVector.sub(direction);
    }
    if (moveLeft) {
      moveVector.sub(right);
    }
    if (moveRight) {
      moveVector.add(right);
    }

    if (moveVector.length() > 0) {
      moveVector.normalize().multiplyScalar(moveSpeed);
      playerObject.position.add(new THREE.Vector3(moveVector.x, 0, moveVector.z));
    }

    playerObject.position.x = Math.max(-roomWidth / 2 + 0.5, Math.min(roomWidth / 2 - 0.5, playerObject.position.x));
    playerObject.position.z = Math.max(-roomDepth / 2 + 0.5, Math.min(roomDepth / 2 - 0.5, playerObject.position.z));

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(pictures, true);

    let foundPainting = false;
    if (intersects.length > 0) {
        const intersection = intersects[0];
        let intersectedObject = intersection.object;
        let paintingGroup = null;
        while (intersectedObject) {
            if (intersectedObject.userData && intersectedObject.userData.isPainting) {
                paintingGroup = intersectedObject;
                break;
            }
            intersectedObject = intersectedObject.parent;
        }

        if (paintingGroup && intersection.distance < interactionDistance) {
            foundPainting = true;
            const paintingInfo = paintingGroup.userData.info;

            if (currentDisplayedPaintingId !== paintingGroup.userData.id) {
                paintingTitle.textContent = paintingInfo.title;
                paintingArtist.textContent = `Artist: ${paintingInfo.artist}`;
                let descriptionText = paintingInfo.description;
                if (paintingInfo.Technique) {
                    descriptionText += `\nTechnique: ${paintingInfo.Technique}`;
                }
                if (paintingInfo.Date) {
                    descriptionText += `\nDate: ${paintingInfo.Date}`;
                }
                paintingDescription.textContent = descriptionText;

                if (paintingInfo.price) {
                    paintingPrice.textContent = `Price: ${paintingInfo.price}`;
                    paintingPrice.style.display = 'block';
                } else {
                    paintingPrice.textContent = '';
                }

                if (paintingInfo.price && paintingInfo.price !== "Not For Sale") {
                    requestItemButton.style.display = 'block';
                } else {
                    requestItemButton.style.display = 'none';
                }


                if (paintingInfo.fullDescription && paintingInfo.fullDescription.length > paintingInfo.description.length) {
                    moreInfoButton.style.display = 'block';
                    paintingDescription.classList.remove('full-description');
                    moreInfoButton.textContent = 'More Info';
                } else {
                    moreInfoButton.style.display = 'none';
                }
                paintingInfoPopup.classList.add('visible');
                currentDisplayedPaintingId = paintingGroup.userData.id;
            }
        }
    }

    if (!foundPainting && currentDisplayedPaintingId !== null) {
        paintingInfoPopup.classList.remove('visible');
        currentDisplayedPaintingId = null;
        requestItemButton.style.display = 'none';
    }
  }

  renderer.render(scene, camera);
}

const startGame = () => {
  menu.style.display = 'none';
  // Check if it's a mobile device to show joystick
  if (window.innerWidth <= 768) {
      joystickContainer.style.display = 'block';
  }
  enablePointerLock(); // Still try to enable for full-screen immersive experience
};

if (playButton) {
  playButton.addEventListener('click', startGame);
} else {
  console.error('Play button not found!');
}

window.onload = function() {
    init3DScene();
    animate();
    menu.style.display = 'flex';
};

const startAudioButton = document.getElementById('start_audio');
const stopAudioButton = document.getElementById('stop_audio');

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();

const audioFilePath = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

audioLoader.load(audioFilePath,
  function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    console.log("Audio loaded successfully!");
  },
  function(xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded audio');
  },
  function(err) {
    console.error('An error happened while loading audio:', err);
  }
);

if (startAudioButton) {
  startAudioButton.addEventListener('click', () => {
    if (sound && sound.buffer) {
      if (!sound.isPlaying) {
        sound.play();
        console.log("Audio guide started.");
      }
    } else {
      console.warn("Audio not loaded yet or buffer is null.");
    }
  });
}

if (stopAudioButton) {
  stopAudioButton.addEventListener('click', () => {
    if (sound && sound.isPlaying) {
      sound.stop();
      console.log("Audio guide stopped.");
    }
  });
}


if (moreInfoButton) {
  moreInfoButton.addEventListener('click', () => {
    if (currentDisplayedPaintingId !== null) {
      const paintingData = picturesData[currentDisplayedPaintingId];
      if (paintingData && paintingData.info.fullDescription) {
        if (paintingDescription.classList.contains('full-description')) {
          paintingDescription.textContent = paintingData.info.description;
          
          if (paintingData.info.Technique) {
              paintingDescription.textContent += `\nTechnique: ${paintingData.info.Technique}`;
          }
          if (paintingData.info.Date) {
              paintingDescription.textContent += `\nDate: ${paintingData.info.Date}`;
          }
          if (paintingData.info.price) {
              paintingPrice.textContent = `Price: ${paintingData.info.price}`;
              paintingPrice.style.display = 'block';
          }

          paintingDescription.classList.remove('full-description');
          moreInfoButton.textContent = 'More Info';
          if (paintingData.info.price && paintingData.info.price !== "Not For Sale") {
              requestItemButton.style.display = 'block';
          }
        } else {
          paintingDescription.textContent = paintingData.info.fullDescription;
          paintingDescription.classList.add('full-description'); 
          moreInfoButton.textContent = 'Less Info';
          paintingPrice.style.display = 'none';
          requestItemButton.style.display = 'none';
        }
      }
    }
  });
}