function loadGumballs() {
    const globeWidth = 390;
    const globeHeight = 390;
    const radius = globeWidth / 2;

    const placed = [];
    const gumballSize = 45;   // smaller = denser
    const minSpacing = 48;    // distance between centers

    for (let i = 0; i < 70; i++) {
        const img = document.createElement("img");
        img.src = gumballImages[Math.floor(Math.random() * gumballImages.length)];
        img.classList.add("gumball");

        let x, y, valid;

        do {
            x = Math.random() * globeWidth;
            y = Math.random() * globeHeight;

            const distFromCenter = Math.sqrt((x - radius) ** 2 + (y - radius) ** 2);
            const insideCircle = distFromCenter < (radius - gumballSize / 2);

            valid = insideCircle && placed.every(p => {
                const dx = p.x - x;
                const dy = p.y - y;
                return Math.sqrt(dx * dx + dy * dy) > minSpacing;
            });

        } while (!valid);

        placed.push({ x, y });

        img.style.left = (x - gumballSize / 2) + "px";
        img.style.top = (y - gumballSize / 2) + "px";

        globe.appendChild(img);
    }
}


