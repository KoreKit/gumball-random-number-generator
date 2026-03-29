const globe = document.getElementById("globe");
const outputGumball = document.getElementById("output-gumball");
const outputNumber = document.getElementById("output-number");

const gumballImages = [
    "gumball-red.png",
    "gumball-blue.png",
    "gumball-green.png",
    "gumball-yellow.png",
    "gumball-purple.png"
];

const globeWidth = 418;
const globeHeight = 418;

function loadGumballs() {
    globe.innerHTML = "";

    const gumballSize = 45;
    const cols = 7;
    const rows = 7;
    const spacing = 55;

    const startX = (globeWidth - (cols - 1) * spacing) / 2;
    const startY = (globeHeight - (rows - 1) * spacing) / 2;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            const img = document.createElement("img");
            img.src = gumballImages[Math.floor(Math.random() * gumballImages.length)];
            img.classList.add("gumball");

            const x = startX + c * spacing;
            const y = startY + r * spacing;

            img.style.left = (x - gumballSize / 2) + "px";
            img.style.top = (y - gumballSize / 2) + "px";

            globe.appendChild(img);
        }
    }
}

document.getElementById("generate-btn").addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * gumballImages.length);
    const randomNumber = Math.floor(Math.random() * 100) + 1;

    outputGumball.src = gumballImages[randomIndex];
    outputNumber.textContent = randomNumber;
});

loadGumballs();


