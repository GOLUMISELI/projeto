document.addEventListener("DOMContentLoaded", function () {
    // Cadastro de usuário
    const cadastroForm = document.getElementById("cadastroForm");
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const errorMessage = document.getElementById("error-message");

            if (username === "" || password === "") {
                errorMessage.textContent = "Os campos não podem estar vazios.";
                return;
            }

            let users = JSON.parse(localStorage.getItem("users")) || {};

            if (users[username]) {
                errorMessage.textContent = "Este nome de usuário já está cadastrado.";
                return;
            }

            users[username] = { password: password, saldo: 0 };
            localStorage.setItem("users", JSON.stringify(users));

            alert("Cadastro realizado com sucesso!");
            window.location.href = "login.html";
        });
    }

    // Login de usuário
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();
            const errorMessage = document.getElementById("error-message");

            let users = JSON.parse(localStorage.getItem("users")) || {};

            if (!users[username] || users[username].password !== password) {
                errorMessage.textContent = "Usuário ou senha incorretos.";
                return;
            }

            localStorage.setItem("loggedInUser", username);
            window.location.href = "dashboard.html"; // Redireciona para o jogo
        });
    }

    // Dashboard e jogo de esquiva
    const usernameDisplay = document.getElementById("usernameDisplay");
    const saldoDisplay = document.getElementById("saldo");
    const logoutButton = document.getElementById("logout");

    let loggedInUser = localStorage.getItem("loggedInUser");
    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (usernameDisplay && saldoDisplay) {
        if (!loggedInUser || !users[loggedInUser]) {
            window.location.href = "login.html";
        } else {
            usernameDisplay.textContent = loggedInUser;
            saldoDisplay.textContent = users[loggedInUser].saldo;
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "login.html";
        });
    }

    // Configuração do jogo de esquiva
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");

        canvas.width = 800;
        canvas.height = 500;

        let player = { x: 400, y: 450, width: 40, height: 40, speed: 7 };
        let obstacles = [];
        let saldo = users[loggedInUser] ? users[loggedInUser].saldo : 0;
        let frameCount = 0;

        function updateGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Desenha o jogador
            ctx.fillStyle = "blue";
            ctx.fillRect(player.x, player.y, player.width, player.height);

            // Movimenta os obstáculos
            obstacles.forEach((obstacle, index) => {
                obstacle.y += obstacle.speed;
                ctx.fillStyle = "red";
                ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

                if (obstacle.y > canvas.height) {
                    obstacles.splice(index, 1);
                    saldo += 10; // Ganha moedas ao evitar obstáculos
                }

                // Verifica colisão
                if (
                    player.x < obstacle.x + obstacle.width &&
                    player.x + player.width > obstacle.x &&
                    player.y < obstacle.y + obstacle.height &&
                    player.y + player.height > obstacle.y
                ) {
                    saldo -= 10; // Perde moedas se for atingido
                    obstacles.splice(index, 1);
                }
            });

            saldoDisplay.textContent = saldo;
            users[loggedInUser].saldo = saldo;
            localStorage.setItem("users", JSON.stringify(users));

            frameCount++;
            if (frameCount % 50 === 0) {
                obstacles.push({
                    x: Math.random() * (canvas.width - 40), // Ajustado para não sair da borda
                    y: 0,
                    width: 40,
                    height: 40,
                    speed: 3 + Math.random() * 3,
                });
            }

            requestAnimationFrame(updateGame);
        }

        document.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft" && player.x > 0) {
                player.x -= player.speed;
            } else if (event.key === "ArrowRight" && player.x < canvas.width - player.width) {
                player.x += player.speed;
            }
        });

        updateGame();
    }
});
