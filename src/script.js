// Clearing console for debugging
console.clear();

// UNCOMMENT TO ENABLE COOKIE CHECK //

// if (document.cookie.indexOf("hasPlayed=true") !== -1) {
//     // alert("You have already played the game.");
//     document.body.innerHTML = "<h1>You have already played the game. Please come back later.</h1>";
//     throw new Error("User has already played");
// }

const entriesContainer = document.getElementById("entries"),
    modal = document.querySelector(".modal");
let row = 0,
    col = 0,
    word = [], // correct word
    guess = [], // entered word
    correctLettersGuessed = new Set(),
    hasWon = false,
    gameOver = false;

const Colors = {
    green: getComputedStyle(document.documentElement).getPropertyValue("--green"),
    yellow: getComputedStyle(document.documentElement).getPropertyValue("--yellow"),
    darkGray: getComputedStyle(document.documentElement).getPropertyValue("--darkgray")
};

// INITIALIZE!!!!! //
word = "tetris".split("");
generateEntries(word.length);
row = 0;
col = 0;
guess = [];
correctLettersGuessed = new Set();
hasWon = false;
gameOver = false;
// console.log(word.join("")); // I can show you the word~

// set a cookie for user played
document.cookie = "hasPlayed=true; max-age=604800"; //set max age to 1 week

document.addEventListener("keydown", function(event) {
    keyPress(event.key);
});

// generates entries (columns) based on len of the word
function generateEntries(wordLength) {
    entriesContainer.innerHTML = "";
    for (let i = 0; i < 6; i++) { // fixed rows (6 attempts)
        const entry = document.createElement("div");
        entry.classList.add("entry");
        for (let j = 0; j < wordLength; j++) {
            const letter = document.createElement("div");
            letter.classList.add("letter", "empty");
            entry.appendChild(letter);
        }
        entriesContainer.appendChild(entry);
    }
}

function keyPress(key) {
    key = key.toLowerCase();
    if (!validateKey(key)) return;
    if (!hasWon && !gameOver) {
        if (key === "enter") {
            submitWord();
        } else if (key === "backspace") {
            backspace();
        } else {
            addLetter(key);
        }
    }
}

// add letter to the DOM/guess array
function addLetter(letter) {
    if (guess.length < word.length) {
        const square = entriesContainer.children[row].children[col];
        runLetterInputAnimationFor(square);
        square.innerHTML = letter.toUpperCase();
        guess.push(letter);
        col++;
    }
}

// reverse of addLetter bc of position of col
function backspace() {
    if (guess.length > 0) {
        col--;
        guess.pop();
        entriesContainer.children[row].children[col].innerHTML = "";
    }
}

// guess is a valid length and word
// checks against the answer word and updates DOM
function submitWord() {
    if (guess.length < word.length) {
        runRowShakeAnimation();
        sendMessage("Not enough letters");
    } else {
        const result = checkGuess();
        showResultSequentially(result);
        if (row === 5 && !hasWon) {
            gameOver = true;
            setTimeout(() => {
                sendMessage("You failed to guess it...\nTry again next week! :(", 5);
                runLossAnimation();
            }, 2000);
        }
        if (hasWon) {
            let message = "";
            // cool messages depending on how fast you solved it
            if (row === 0) {
                message = "INCREDIBLE!!!";
            } else if (row === 1) {
                message = "Amazing!!";
            } else if (row === 2) {
                message = "Yippee!";
            } else if (row === 3) {
                message = "Well done";
            } else if (row === 4) {
                message = "Nice";
            } else {
                message = "Close one, chief";
            }
            setTimeout(() => {
                sendMessage(message);
            }, 4500);
        }
    }
}

// is the letter correct?
// is letter in the word?
// is letter in right spot?
function checkGuess() {
    const diff = [];
    const letterCount = countLetters();

    // mark correct letters
    let guessLetter;
    let ansLetter;
    for (let i = 0; i < word.length; i++) {
        guessLetter = guess[i];
        ansLetter = word[i];
        if (guessLetter === ansLetter) {
            diff.push("correct");
            correctLettersGuessed.add(guessLetter);
            letterCount[guessLetter] -= 1;
        } else {
            diff.push("absent");
        }
    }

    // mark wrong position letters w/o overriding correct letters
    for (let i = 0; i < word.length; i++) {
        guessLetter = guess[i];
        if (word.includes(guessLetter) && diff[i] !== "correct" && letterCount[guessLetter] > 0) {
            diff[i] = "wrong-position";
            letterCount[guessLetter] -= 1;
        }
    }

    return diff;
}

// shows results sequentially
function showResultSequentially(result) {
    for (let i = 0; i < word.length; i++) {
        const letter = entriesContainer.children[row].children[i];
        setTimeout(() => {
            runRevealLetterAnimation(letter, result[i]);
        }, i * 350);
    }
    if (word.join("") === guess.join("")) {
        hasWon = true;
        setTimeout(runVictoryAnimation, word.length * 500);
    }
}

function sendMessage(msg, duration = 0.1) {
    modal.innerHTML = msg;
    runModalAnimation(duration);
}

// utility function to check if the string is actually a valid usable key
// used so the user cannot input weird characters & mess with things
function validateKey(key) {
    const regex = /^[a-z0-9]$/;
    return !!(key === "enter" || key === "backspace" || regex.test(key));
}

// utility function that creates a map of the frequency of each
// letter in a guess. This is used when checking the guess against
// the real answer
function countLetters() {
    const counts = {};
    for (const letter of word) {
        if (counts[letter]) {
            counts[letter] += 1;
        } else {
            counts[letter] = 1;
        }
    }
    return counts;
}

// GSAP ANIMATIONS :D #WeLoveGSAP

function runPressedAnimationFor(key) {
    const keyDOM = document.querySelector(`[data-key='${key}']`);
    const duration = 0.08;
    gsap.to(keyDOM, {
        scale: 0.9,
        duration,
        onComplete: function() {
            gsap.to(keyDOM, {
                scale: 1,
                duration
            });
        }
    });
}

function runLetterInputAnimationFor(square) {
    const duration = 0.08;
    gsap.to(square, {
        scale: 1.15,
        duration,
        onComplete: function() {
            gsap.to(square, {
                scale: 1,
                duration
            });
        }
    });
}

function runRevealLetterAnimation(letter, result) {
    const duration = 0.3;
    gsap.to(letter, {
        scaleX: 0,
        duration,
        onComplete: function() {
            if (result === "correct") {
                letter.style.backgroundColor = Colors.green;
                letter.style.color = "white";
            } else if (result === "wrong-position") {
                letter.style.backgroundColor = Colors.yellow;
                letter.style.color = "white";
            } else {
                letter.style.backgroundColor = Colors.darkGray;
                letter.style.color = "white";
            }
            gsap.to(letter, {
                scaleX: 1,
                duration
            });
        }
    });
}

function runModalAnimation(duration) {
    gsap.to(modal, {
        scale: 1,
        ease: "elastic.out(1, 0.7)",
        onComplete: function() {
            gsap.to(modal, {
                scale: 0,
                delay: duration,
                ease: "elastic.in(1, 0.7)"
            });
        }
    });
}

function runRowShakeAnimation() {
    const rowDOM = entriesContainer.children[row];
    gsap.to(rowDOM, {
        x: -5,
        duration: 0.05,
        ease: "linear",
        onComplete: function() {
            gsap.to(rowDOM, {
                x: 0,
                duration: 0.5,
                ease: "elastic(4, 0.2)"
            });
        }
    });
}

function runVictoryAnimation() {
    const lettersDOM = entriesContainer.children[row - 1].children; // Fixing to use correct row
    const overlayDOM = document.querySelector("#overlay");
    const timeline = gsap.timeline();

    // makes letters appear on top of the rest
    for (let i = 0; i < word.length; i++) {
        timeline.set(lettersDOM[i], { zIndex: 20 });
    }

    // mimics explosion of letters by setting positions
    timeline.add("explode");
    const startDelay = 0;
    const explodePos = [{ x: -50, y: -40, rotation: -245 }, { x: -3, y: 60, rotation: -260 }, {
        x: 10,
        y: -50,
        rotation: -220
    }, { x: 30, y: 80, rotation: 260 }, { x: 50, y: -10, rotation: 240 }];

    // creates dark overlay
    overlayDOM.style.display = "flex";
    timeline.to(overlayDOM, {
        opacity: 0.5,
        duration: 0.5,
        delay: startDelay
    }, "explode");

    // tweens the letters to explosion positions
    for (let i = 0; i < word.length; i++) {
        timeline.to(lettersDOM[i], {
            x: explodePos[i].x,
            y: explodePos[i].y,
            rotation: explodePos[i].rotation,
            ease: "power2.out",
            duration: 0.6
        }, "explode");
    }

    // brings letters back together
    timeline.add("together");
    for (let i = 0; i < word.length; i++) {
        timeline.to(lettersDOM[i], {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.3,
            ease: "elastic.out(0.7, 0.7)"
        }, "together");
    }

    // scales the letters up and widens the gaps
    timeline.add("scale");
    for (let i = 0; i < word.length; i++) {
        const factor = 20;
        let x = 0;
        if (i === 0) {
            x = -factor * 2;
        } else if (i === 1) {
            x = -factor;
        } else if (i === 3) {
            x = factor;
        } else if (i === 4) {
            x = factor * 2;
        }
        timeline.to(lettersDOM[i], {
            scale: 1.2,
            x,
            duration: 0.7,
            delay: 0.1
        }, "together");
    }

    // aaand back to reality
    timeline.add("return");
    for (let i = 0; i < word.length; i++) {
        timeline.to(lettersDOM[i], {
            scale: 1,
            x: 0,
            duration: 0.1
        }, "return");
    }

    // dark overlay stays permanently
    timeline.set(overlayDOM, {
        opacity: 0.5,
        display: "flex"
    });

    // resets z-indexes
    for (let i = 0; i < word.length; i++) {
        timeline.set(lettersDOM[i], { zIndex: 10, delay: 0.3 });
    }

    // play animation
    timeline.play();
}

// run loss animation
function runLossAnimation() {
    const overlayDOM = document.querySelector("#overlay");
    overlayDOM.style.display = "flex";
    gsap.to(overlayDOM, {
        opacity: 0.5,
        duration: 1,
        ease: "power2.inOut"
    });
    // overlay stays permanently dark
}
