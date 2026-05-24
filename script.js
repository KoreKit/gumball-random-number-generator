const GUMBALL_IMAGES = [
    "bluegumball.png",
    "greengumball.png",
    "orangegumball.png",
    "pinkgumball.png",
    "redgumball.png",
    "yellowgumball.png",
];

const IDLE_GUMBALL_COUNT = 32;
const BOTTOM_GUMBALL_POSITIONS = [
    { x: 34, y: 83 },
    { x: 44, y: 86 },
    { x: 56, y: 87 },
    { x: 66, y: 84 },
];
const SIDE_GUMBALL_POSITIONS = [
    { x: 19, y: 38 },
    { x: 17, y: 52 },
    { x: 20, y: 66 },
    { x: 81, y: 38 },
    { x: 83, y: 52 },
    { x: 80, y: 66 },
];
const JUMBLE_DURATION_MS = 1400;
const SETTLE_DURATION_MS = 250;
const DISPENSE_ANIMATION_MS = 900;
const MACHINE_SOUND_FALLBACK_SEC = 3;
const GLOBE_INSET = 0.04;
const GUMBALL_MAX_RADIUS = 37;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const FALLBACK_GLOBE = { top: 10.1, left: 50, size: 32.1 };

const machineFrame = document.querySelector(".machine__frame");
const machineArt = document.querySelector(".machine__art");
const globe = document.getElementById("globe");
const minInput = document.getElementById("min-input");
const maxInput = document.getElementById("max-input");
const rangeError = document.getElementById("range-error");
const generateBtn = document.getElementById("generate-btn");
const resultGumball = document.getElementById("result-gumball");
const resultGumballImg = document.getElementById("result-gumball-img");
const resultNumber = document.getElementById("result-number");
const machineSound = document.getElementById("machine-sound");

let isAnimating = false;
let layoutReady = false;
let machineSoundDurationSec = MACHINE_SOUND_FALLBACK_SEC;

function pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function parseRangeInputs() {
    let min = Number.parseInt(minInput.value, 10);
    let max = Number.parseInt(maxInput.value, 10);

    if (Number.isNaN(min)) min = 1;
    if (Number.isNaN(max)) max = 100;

    return { min, max };
}

function validateRange() {
    let { min, max } = parseRangeInputs();
    const rangeSize = max - min + 1;

    rangeError.hidden = true;
    rangeError.textContent = "";

    if (min > max) {
        rangeError.textContent = "Minimum cannot be greater than maximum.";
        rangeError.hidden = false;
        return null;
    }

    if (rangeSize > Number.MAX_SAFE_INTEGER) {
        rangeError.textContent = "That range is too large. Use a smaller span.";
        rangeError.hidden = false;
        return null;
    }

    minInput.value = String(min);
    maxInput.value = String(max);

    return { min, max };
}

function isOutlinePixel(data, width, x, y) {
    const index = (y * width + x) * 4;
    return data[index] < 90 && data[index + 1] < 90 && data[index + 2] < 90;
}

function findOutlineSpan(data, width, centerX, rowY) {
    let left = -1;
    let right = -1;

    for (let x = centerX; x >= 0; x -= 1) {
        if (isOutlinePixel(data, width, x, rowY)) {
            left = x;
            break;
        }
    }

    for (let x = centerX; x < width; x += 1) {
        if (isOutlinePixel(data, width, x, rowY)) {
            right = x;
            break;
        }
    }

    if (left < 0 || right < 0) {
        return null;
    }

    return { left, right, span: right - left };
}

function measureGlobeFromImage(image) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);

    const { width, height, data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const centerX = Math.floor(width / 2);

    let bestRow = null;

    for (let y = Math.floor(height * 0.12); y < Math.floor(height * 0.48); y += 1) {
        const span = findOutlineSpan(data, width, centerX, y);
        if (!span) continue;

        if (!bestRow || span.span > bestRow.span) {
            bestRow = { y, ...span };
        }
    }

    if (!bestRow) {
        return null;
    }

    const globeCenterX = (bestRow.left + bestRow.right) / 2;
    const globeCenterY = bestRow.y;
    const diameter = bestRow.span * (1 - GLOBE_INSET * 2);

    return {
        top: ((globeCenterY - diameter / 2) / height) * 100,
        left: (globeCenterX / width) * 100,
        size: (diameter / width) * 100,
    };
}

function applyMachineLayout() {
    if (!machineArt.naturalWidth) {
        return false;
    }

    let globeLayout = FALLBACK_GLOBE;

    try {
        globeLayout = measureGlobeFromImage(machineArt) ?? FALLBACK_GLOBE;
    } catch {
        globeLayout = FALLBACK_GLOBE;
    }

    machineFrame.style.setProperty("--globe-top", `${globeLayout.top.toFixed(2)}%`);
    machineFrame.style.setProperty("--globe-left", `${globeLayout.left.toFixed(2)}%`);
    machineFrame.style.setProperty("--globe-size", `${globeLayout.size.toFixed(2)}%`);

    layoutReady = true;
    createIdleGumballs();
    return true;
}

function spreadPointInGlobe(index, total, centerX, centerY, maxRadius) {
    const angle = index * GOLDEN_ANGLE;
    const radius = Math.sqrt((index + 0.5) / total) * maxRadius;
    const jitter = (Math.random() - 0.5) * 4;

    return {
        x: centerX + radius * Math.cos(angle) + jitter,
        y: centerY + radius * Math.sin(angle) + jitter,
    };
}

function setIdleMotion(slot, { settled = false } = {}) {
    const duration = 4 + Math.random() * 3;
    const driftX = (Math.random() - 0.5) * (settled ? 2 : 3);
    const driftY = settled ? 0 : (Math.random() - 0.5) * 3;

    slot.style.setProperty("--float-duration", `${duration.toFixed(2)}s`);
    slot.style.setProperty("--float-delay", `${(-Math.random() * duration).toFixed(2)}s`);
    slot.style.setProperty("--drift-x", `${driftX.toFixed(1)}px`);
    slot.style.setProperty("--drift-y", `${driftY.toFixed(1)}px`);
}

function setJumbleMotion(slot) {
    const pct = () => `${(Math.random() * 6 - 3).toFixed(1)}%`;

    slot.style.setProperty("--jx", pct());
    slot.style.setProperty("--jy", pct());
    slot.style.setProperty("--jx2", pct());
    slot.style.setProperty("--jy2", pct());
    slot.style.setProperty("--jx3", pct());
    slot.style.setProperty("--jy3", pct());
    slot.style.setProperty("--jumble-duration", `${(0.24 + Math.random() * 0.12).toFixed(2)}s`);
    slot.style.setProperty("--jumble-delay", `${(-Math.random() * 0.3).toFixed(2)}s`);
}

function createGumballSlot({ isBase = false } = {}) {
    const slot = document.createElement("div");
    slot.className = isBase ? "gumball-slot gumball-slot--base" : "gumball-slot";

    const img = document.createElement("img");
    img.className = "gumball-slot__img";
    img.src = pickRandom(GUMBALL_IMAGES);
    img.alt = "";
    img.draggable = false;

    slot.appendChild(img);
    return slot;
}

function createIdleGumballs() {
    if (!layoutReady) {
        return;
    }

    globe.replaceChildren();

    for (let i = 0; i < IDLE_GUMBALL_COUNT; i += 1) {
        const slot = createGumballSlot();
        const point = spreadPointInGlobe(i, IDLE_GUMBALL_COUNT, 50, 50, GUMBALL_MAX_RADIUS);

        slot.style.left = `${point.x}%`;
        slot.style.top = `${point.y}%`;
        slot.style.zIndex = String(Math.floor(Math.random() * 10));

        setIdleMotion(slot, { settled: false });
        setJumbleMotion(slot);
        globe.appendChild(slot);
    }

    placeFillGumballs(BOTTOM_GUMBALL_POSITIONS, 12);
    placeFillGumballs(SIDE_GUMBALL_POSITIONS, 16);
}

function placeFillGumballs(positions, zIndexStart) {
    positions.forEach((position, index) => {
        const slot = createGumballSlot({ isBase: true });
        const jitterX = (Math.random() - 0.5) * 2;
        const jitterY = (Math.random() - 0.5) * 1.5;

        slot.style.left = `${position.x + jitterX}%`;
        slot.style.top = `${position.y + jitterY}%`;
        slot.style.zIndex = String(zIndexStart + index);

        setIdleMotion(slot, { settled: true });
        setJumbleMotion(slot);
        globe.appendChild(slot);
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function jumbleGlobe(durationMs = JUMBLE_DURATION_MS) {
    globe.classList.add("globe--jumbling");

    globe.querySelectorAll(".gumball-slot").forEach((slot) => {
        setJumbleMotion(slot);
    });

    await delay(durationMs);

    globe.classList.remove("globe--jumbling");
    await delay(SETTLE_DURATION_MS);
}

function updateMachineSoundDuration() {
    if (machineSound?.duration && Number.isFinite(machineSound.duration)) {
        machineSoundDurationSec = machineSound.duration;
    }
}

async function startMachineSound() {
    if (!machineSound) {
        return false;
    }

    updateMachineSoundDuration();
    machineSound.pause();
    machineSound.currentTime = 0;

    try {
        await machineSound.play();
        return true;
    } catch {
        return false;
    }
}

function waitForSoundTime(targetSeconds) {
    const target = Math.max(0, targetSeconds);

    return new Promise((resolve) => {
        if (!machineSound) {
            resolve();
            return;
        }

        const tick = () => {
            if (machineSound.ended || machineSound.currentTime >= target) {
                resolve();
                return;
            }

            requestAnimationFrame(tick);
        };

        tick();
    });
}

function waitForSoundEnd() {
    return new Promise((resolve) => {
        if (!machineSound || machineSound.ended) {
            resolve();
            return;
        }

        machineSound.addEventListener("ended", resolve, { once: true });
    });
}

function getDispenseStartSeconds() {
    const dispenseLeadSec = DISPENSE_ANIMATION_MS / 1000;
    return Math.max(0, machineSoundDurationSec - dispenseLeadSec);
}

function getJumbleDurationMs() {
    const dispenseStartMs = getDispenseStartSeconds() * 1000;
    return Math.max(600, Math.floor(dispenseStartMs - SETTLE_DURATION_MS));
}

function waitForAnimation(element) {
    return new Promise((resolve) => {
        const onEnd = (event) => {
            if (event.target !== element) return;
            element.removeEventListener("animationend", onEnd);
            resolve();
        };
        element.addEventListener("animationend", onEnd);
    });
}

function resetResultGumball() {
    resultGumball.classList.remove("is-dispensing", "is-visible");
    resultGumball.hidden = true;
    resultGumballImg.src = "";
    resultNumber.textContent = "";
}

async function dispenseNumber(number) {
    resetResultGumball();

    resultGumballImg.src = pickRandom(GUMBALL_IMAGES);
    resultNumber.textContent = String(number);
    resultGumball.hidden = false;

    void resultGumball.offsetWidth;

    resultGumball.classList.add("is-dispensing");
    await waitForAnimation(resultGumball);

    resultGumball.classList.remove("is-dispensing");
    resultGumball.classList.add("is-visible");
}

async function handleGenerate() {
    if (isAnimating) return;

    const range = validateRange();
    if (!range) return;

    isAnimating = true;
    generateBtn.disabled = true;

    const number = randomInRange(range.min, range.max);
    const soundPlaying = await startMachineSound();
    const dispenseStartSec = getDispenseStartSeconds();
    const jumbleMs = getJumbleDurationMs();

    if (soundPlaying) {
        await Promise.all([
            jumbleGlobe(jumbleMs),
            waitForSoundTime(dispenseStartSec),
        ]);
    } else {
        await jumbleGlobe();
        await delay(Math.max(0, dispenseStartSec * 1000 - jumbleMs - SETTLE_DURATION_MS));
    }

    await dispenseNumber(number);
    await waitForSoundEnd();

    isAnimating = false;
    generateBtn.disabled = false;
}

function handleRangeInput() {
    validateRange();
}

function initLayout() {
    if (applyMachineLayout()) {
        return;
    }

    machineArt.addEventListener("load", applyMachineLayout, { once: true });
}

generateBtn.addEventListener("click", handleGenerate);
minInput.addEventListener("change", handleRangeInput);
maxInput.addEventListener("change", handleRangeInput);
window.addEventListener("resize", () => {
    if (layoutReady) {
        createIdleGumballs();
    }
});

if (machineSound) {
    machineSound.addEventListener("loadedmetadata", updateMachineSoundDuration);
    updateMachineSoundDuration();
}

initLayout();
