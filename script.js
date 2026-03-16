document.getElementById("generateBtn").addEventListener("click", function () {

    // MACHINE SHAKE
    const machine = document.querySelector(".machine");
    machine.classList.add("shake");

    setTimeout(() => {
        machine.classList.remove("shake");
    }, 400);

    // RANDOM NUMBER
    const randomNum = Math.floor(Math.random() * 30) + 1;

    // UPDATE GUMBALL
    document.getElementById("gumball").textContent = randomNum;
});
