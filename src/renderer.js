const stage = document.getElementById('stage');
const people = Array.from({ length: 12 }, (_unused, index) => `person${index + 1}.jpg`);
let paused = false;
let lastTime = performance.now();
const pets = people.map((fileName, index) => createPet(fileName, index));

function createPet(fileName, index) {
  const pet = document.createElement('div');
  pet.className = 'pet';
  const direction = index % 2 === 0 ? 1 : -1;
  pet.style.setProperty('--dir', direction);
  pet.innerHTML = `
    <div class="bubble">爸</div>
    <div class="tail"></div>
    <div class="arm back"><span class="paw"></span></div>
    <div class="leg back"><span class="paw"></span></div>
    <div class="body"><span class="belly"></span></div>
    <div class="ear left"></div>
    <div class="ear right"></div>
    <div class="head"><img class="face-photo" src="../assets/people/${fileName}" draggable="false" /></div>
    <div class="arm front"><span class="paw"></span></div>
    <div class="leg front"><span class="paw"></span></div>
  `;
  stage.appendChild(pet);
  return {
    element: pet,
    x: 18 + index * 92,
    speed: 0.85 + (index % 5) * 0.16 + Math.random() * 0.2,
    dir: direction,
  };
}

const ground = document.createElement('div');
ground.className = 'ground';
stage.appendChild(ground);

function animate(now) {
  const delta = Math.min(34, now - lastTime) / 16.67;
  lastTime = now;
  const maxX = Math.max(180, window.innerWidth - 126);
  if (!paused) {
    for (const pet of pets) {
      pet.x += pet.speed * pet.dir * delta;
      if (pet.x <= 0) {
        pet.x = 0;
        pet.dir = 1;
      } else if (pet.x >= maxX) {
        pet.x = maxX;
        pet.dir = -1;
      }
      pet.element.style.setProperty('--dir', pet.dir);
    }
  }
  for (const pet of pets) {
    pet.element.style.setProperty('--x', `${pet.x}px`);
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.addEventListener('contextmenu', event => {
  event.preventDefault();
  window.monkeyPets.showContextMenu();
});

window.monkeyPets.onCommand(command => {
  if (command === 'dad') shoutDad();
  if (command === 'pause') setPaused(true);
  if (command === 'scatter') scatter();
});

function shoutDad() {
  for (const pet of pets) pet.element.classList.add('talking');
  clearTimeout(shoutDad.timer);
  shoutDad.timer = setTimeout(() => {
    for (const pet of pets) pet.element.classList.remove('talking');
  }, 2400);
}

function setPaused(nextPaused) {
  paused = nextPaused;
  for (const pet of pets) pet.element.classList.toggle('paused', paused);
}

function scatter() {
  setPaused(false);
  const maxX = Math.max(180, window.innerWidth - 126);
  const gap = maxX / Math.max(1, pets.length - 1);
  for (const [index, pet] of pets.entries()) {
    pet.x = Math.max(0, Math.min(maxX, index * gap + (Math.random() * 50 - 25)));
    pet.dir = Math.random() > 0.5 ? 1 : -1;
    pet.speed = 0.8 + Math.random() * 0.75;
  }
}
