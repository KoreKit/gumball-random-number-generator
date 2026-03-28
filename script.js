// Updated filenames — EXACTLY matching your repo
const gumballImages = [
    "bluegumball.png",
    "greengumball.png",
    "orangegumball.png",
    "pinkgumball.png",
    "redgumball.png",
    "yellowgumball.png"
];

let minNum = 1;
let maxNum = 30;

const setupScreen = document.getElementById("setup-screen");
const machineScreen = document.getElementById("machine-screen");
const globe = document.getElementById("globe");
const outputBall = document.getElementById("output-ball");

document.getElementById("startBtn").onclick = () => {
    minNum = parseInt(document.getElementById("minInput").value);
    maxNum = parseInt(document.getElementById("maxInput").value);

    setupScreen.classList.add("hidden");
    machineScreen.classList.remove("hidden");

    loadGumballs();
};

function loadGumballs() {
    const globeWidth = 520;
    const globeHeight = 520;
    const radius = globeWidth / 2;

    for (let i = 0; i < 40; i++) {
        const img = document.createElement("img");
        img.src = gumballImages[Math.floor(Math.random() * gumballImages.length)];
        img.classList.add("gumball");

        let x, y;
        do {
            x = Math.random() * globeWidth;
            y = Math.random() * globeHeight;
        } while ((x - radius) ** 2 + (y - radius) ** 2 > (radius - 60) ** 2);

        img.style.left = x + "px";
        img.style.top = y + "px";

        globe.appendChild(img);
    }
}

document.getElementById("dispenseBtn").onclick = () => {
    const gumballs = document.querySelectorAll(".gumball");

    gumballs.forEach(g => g.classList.add("jumble"));

    setTimeout(() => {
        gumballs.forEach(g => g.classList.remove("jumble"));

        const num = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

        const img = gumballImages[Math.floor(Math.random() * gumballImages.length)];

        outputBall.style.backgroundImage = `url('${img}')`;
        outputBall.textContent = num;

    }, 1200);
};

