// Gumball image filenames
const gumballImages = [
    "Green gumball.png",
    "Pink gumball.png",
    "blue gumball.png",
    "orange gumball.png",
    "red gumball.png",
    "yellow gumball.png"
];

let minNum = 1;
let maxNum = 30;

// DOM elements
const setupScreen = document.getElementById("setup-screen");
const machineScreen = document.getElementById("machine-screen");
const globe = document.getElementById("globe");
const outputBall = document.getElementById("output-ball");

// Start Machine
document.getElementById("startBtn").onclick = () => {
    minNum = parseInt(document.getElementById("minInput").value);
    maxNum = parseInt(document.getElementById("maxInput").value);

    setupScreen.classList.add("hidden");
    machineScreen.classList.remove("hidden");

    loadGumballs();
};

// Place gumballs inside the globe
function loadGumballs() {
    const globeWidth = 230;
    const globeHeight = 230;
    const radius = globeWidth / 2;

    for (let i = 0; i < 35; i++) {
        const img = document.createElement("img");
        img.src = "images/" + gumballImages[Math.floor(Math.random() * gumballImages.length)];
        img.classList.add("gumball");

        // Random position inside circle
        let x, y;
        do {
            x = Math.random() * globeWidth;
            y = Math.random() * globeHeight;
        } while (Math.pow(x - radius, 2) + Math.pow(y - radius, 2) > Math.pow(radius - 25, 2));

        img.style.left = x + "px";
        img.style.top = y + "px";

        globe.appendChild(img);
    }
}

// Dispense button
document.getElementById("dispenseBtn").onclick = () => {
    const gumballs = document.querySelectorAll(".gumball");

    // Start jumble animation
    gumballs.forEach(g => g.classList.add("jumble"));

    setTimeout(() => {
        gumballs.forEach(g => g.classList.remove("jumble"));

        // Random number
        const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

        // Pick a random gumball image for output
        const img = gumballImages[Math.floor(Math.random() * gumballImages.length)];

        outputBall.style.backgroundImage = `url('images/${img}')`;
        outputBall.textContent = num;

    }, 1200);
};
