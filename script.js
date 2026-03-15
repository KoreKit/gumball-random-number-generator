document.getElementById("generateBtn").addEventListener("click", function() {
    
    // Generate a random number between 1 and 30
    let randomNum = Math.floor(Math.random() * 30) + 1;

    // Show the gumball
    let gumball = document.getElementById("gumball");
    let number = document.getElementById("number");

    number.textContent = randomNum;
    gumball.classList.remove("hidden");
});
