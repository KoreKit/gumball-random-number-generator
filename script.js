document.getElementById("generateBtn").addEventListener("click", function () {

    // JITTER ALL INTERNAL GUMBALLS
    const minis = document.querySelectorAll(".mini");
    minis.forEach(ball => {
        ball.classList.add("jitter");
        setTimeout(() => ball.classList.remove("jitter"), 500);
    });

    // RANDOM NUMBER
    const randomNum = Math.floor(Math.random() * 30) + 1;

    // UPDATE NUMBER GUMBALL
    document.getElementById("gumball").textContent = randomNum;
});
