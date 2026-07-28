const stage = document.getElementById('stage');
const people = Array.from({ length: 12 }, (_unused, index) => `person${index + 1}.jpg`);
const dialoguePool = [
  '我是傻逼',
  '滚开',
  'gt是我爹',
  '别挡我进化',
  '猴急什么',
  '让我先爬',
  '你踩我尾巴了',
  '爹来了',
  '今天谁也别想下班',
  '我宣布这里归猴管',
  '你礼貌吗',
  '别逼我跪下求你',
  '这把高端局',
  '我 CPU 烧了',
  '退退退',
  '借过一下，爹要巡逻',
  '我不是猴，我是领导',
  '别碰瓷，我有录像',
  '你再撞一下试试',
  '报告，发现野生同事',
  '这屏幕归我了',
  '爬慢点，显得稳重',
  '我裂开了',
  '给我整不会了',
];
const petSize = 126;
const collisionDistance = 92;
const collisionCooldownMs = 1300;
const mouseIdleDelayMs = 120;
let paused = false;
let lastTime = performance.now();
let activeDrag = null;
let mouseInsidePets = 0;
let mouseLeaveTimer = null;
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
  const petState = {
    element: pet,
    bubble: pet.querySelector('.bubble'),
    x: 24 + (index % 6) * 132,
    y: 24 + Math.floor(index / 6) * 138,
    vx: randomVelocity(index),
    vy: randomVelocity(index + 7),
    dir: direction,
    lastCollisionAt: 0,
    talkTimer: null,
    dragging: false,
  };
  bindPetMouseEvents(petState);
  return petState;
}

function randomVelocity(seed) {
  const sign = seed % 2 === 0 ? 1 : -1;
  return sign * (0.75 + Math.random() * 1.35);
}

function bindPetMouseEvents(pet) {
  pet.element.addEventListener('mouseenter', () => {
    mouseInsidePets += 1;
    enableMouseCapture();
  });

  pet.element.addEventListener('mouseleave', () => {
    mouseInsidePets = Math.max(0, mouseInsidePets - 1);
    scheduleMouseRelease();
  });

  pet.element.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    enableMouseCapture();
    activeDrag = {
      pet,
      offsetX: event.clientX - pet.x,
      offsetY: event.clientY - pet.y,
    };
    pet.dragging = true;
    pet.element.classList.add('dragging');
    pet.element.setPointerCapture(event.pointerId);
    pet.vx = 0;
    pet.vy = 0;
  });

  pet.element.addEventListener('pointermove', event => {
    if (!activeDrag || activeDrag.pet !== pet) return;
    const bounds = getBounds();
    pet.x = clamp(event.clientX - activeDrag.offsetX, 0, bounds.maxX);
    pet.y = clamp(event.clientY - activeDrag.offsetY, 0, bounds.maxY);
    applyPetTransform(pet);
  });

  pet.element.addEventListener('pointerup', event => endDrag(pet, event));
  pet.element.addEventListener('pointercancel', event => endDrag(pet, event));
}

function endDrag(pet, event) {
  if (!activeDrag || activeDrag.pet !== pet) return;
  activeDrag = null;
  pet.dragging = false;
  pet.element.classList.remove('dragging');
  try {
    pet.element.releasePointerCapture(event.pointerId);
  } catch (_error) {}
  pet.vx = randomVelocity(Math.floor(Math.random() * 100));
  pet.vy = randomVelocity(Math.floor(Math.random() * 100));
  scheduleMouseRelease();
}

function animate(now) {
  const delta = Math.min(34, now - lastTime) / 16.67;
  lastTime = now;
  if (!paused) {
    movePets(delta);
    checkCollisions(now);
  }
  for (const pet of pets) applyPetTransform(pet);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function movePets(delta) {
  const bounds = getBounds();
  for (const pet of pets) {
    if (pet.dragging) continue;
    pet.x += pet.vx * delta;
    pet.y += pet.vy * delta;
    if (pet.x <= 0 || pet.x >= bounds.maxX) {
      pet.x = clamp(pet.x, 0, bounds.maxX);
      pet.vx *= -1;
    }
    if (pet.y <= 0 || pet.y >= bounds.maxY) {
      pet.y = clamp(pet.y, 0, bounds.maxY);
      pet.vy *= -1;
    }
    if (Math.random() < 0.003) pet.vy += (Math.random() - 0.5) * 0.8;
    pet.vx = clampVelocity(pet.vx);
    pet.vy = clampVelocity(pet.vy);
    pet.dir = pet.vx >= 0 ? 1 : -1;
    pet.element.style.setProperty('--dir', pet.dir);
  }
}

function checkCollisions(now) {
  for (let firstIndex = 0; firstIndex < pets.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < pets.length; secondIndex += 1) {
      const first = pets[firstIndex];
      const second = pets[secondIndex];
      if (first.dragging || second.dragging) continue;
      const dx = first.x - second.x;
      const dy = first.y - second.y;
      const distance = Math.hypot(dx, dy);
      if (distance > collisionDistance) continue;
      if (now - first.lastCollisionAt < collisionCooldownMs || now - second.lastCollisionAt < collisionCooldownMs) continue;
      first.lastCollisionAt = now;
      second.lastCollisionAt = now;
      bounceApart(first, second, dx, dy, distance || 1);
      if (Math.random() < 0.72) {
        speak(first, randomDialogue());
        if (Math.random() < 0.55) speak(second, randomDialogue());
      }
    }
  }
}

function bounceApart(first, second, dx, dy, distance) {
  const normalX = dx / distance;
  const normalY = dy / distance;
  const push = (collisionDistance - distance) / 2 + 2;
  const bounds = getBounds();
  first.x = clamp(first.x + normalX * push, 0, bounds.maxX);
  first.y = clamp(first.y + normalY * push, 0, bounds.maxY);
  second.x = clamp(second.x - normalX * push, 0, bounds.maxX);
  second.y = clamp(second.y - normalY * push, 0, bounds.maxY);
  first.vx = clampVelocity(first.vx + normalX * 1.2);
  first.vy = clampVelocity(first.vy + normalY * 1.2);
  second.vx = clampVelocity(second.vx - normalX * 1.2);
  second.vy = clampVelocity(second.vy - normalY * 1.2);
}

function speak(pet, text, duration = 2200) {
  pet.bubble.textContent = text;
  pet.element.classList.add('talking');
  clearTimeout(pet.talkTimer);
  pet.talkTimer = setTimeout(() => pet.element.classList.remove('talking'), duration);
}

function randomDialogue() {
  return dialoguePool[Math.floor(Math.random() * dialoguePool.length)];
}

function applyPetTransform(pet) {
  pet.element.style.setProperty('--x', `${pet.x}px`);
  pet.element.style.setProperty('--y', `${pet.y}px`);
}

function getBounds() {
  return {
    maxX: Math.max(0, window.innerWidth - petSize),
    maxY: Math.max(0, window.innerHeight - petSize),
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampVelocity(value) {
  const sign = value >= 0 ? 1 : -1;
  const magnitude = clamp(Math.abs(value), 0.65, 2.35);
  return sign * magnitude;
}

function enableMouseCapture() {
  clearTimeout(mouseLeaveTimer);
  window.monkeyPets.setMouseEventsIgnored(false);
}

function scheduleMouseRelease() {
  clearTimeout(mouseLeaveTimer);
  mouseLeaveTimer = setTimeout(() => {
    if (!activeDrag && mouseInsidePets === 0) {
      window.monkeyPets.setMouseEventsIgnored(true);
    }
  }, mouseIdleDelayMs);
}

window.addEventListener('contextmenu', event => {
  event.preventDefault();
  enableMouseCapture();
  window.monkeyPets.showContextMenu();
  scheduleMouseRelease();
});

window.monkeyPets.onCommand(command => {
  if (command === 'dad') shoutDad();
  if (command === 'pause') setPaused(true);
  if (command === 'scatter') scatter();
});

function shoutDad() {
  for (const pet of pets) speak(pet, '爸', 2400);
}

function setPaused(nextPaused) {
  paused = nextPaused;
  for (const pet of pets) pet.element.classList.toggle('paused', paused);
}

function scatter() {
  setPaused(false);
  const bounds = getBounds();
  for (const pet of pets) {
    pet.x = Math.random() * bounds.maxX;
    pet.y = Math.random() * bounds.maxY;
    pet.vx = randomVelocity(Math.floor(Math.random() * 100));
    pet.vy = randomVelocity(Math.floor(Math.random() * 100));
  }
}
