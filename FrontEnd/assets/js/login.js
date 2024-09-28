document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:5678/api/users/login";
    const ERROR_MESSAGE = "Identifiant ou mot de passe incorrects";

    // Variables utilisées
    const form = document.querySelector("#formLogin");
    const errorMessage = document.createElement("div");

    // Fonction pour afficher les erreurs
    const displayError = (message) => {
        errorMessage.innerHTML = message;
        errorMessage.style.background = "red";
        errorMessage.style.color = "white";
        errorMessage.style.display = "flex";
        form.appendChild(errorMessage);
        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 5000);
    };

    // Fonction pour connecter l'utilisateur
    const login = async (email, password) => {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log("data contient", data);

            if (response.ok) {
                localStorage.setItem("token", data.token);
                window.location = "index.html";
            } else {
                console.error("Erreur de connexion");
                displayError(ERROR_MESSAGE);
            }
        } catch (error) {
            console.log(ERROR_MESSAGE, error);
            displayError(ERROR_MESSAGE);
        }
    };

    // Se connecter lorsque qu'on clique sur le bouton
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const { email, password } = form;
        // Appel de la fonction login
        login(email.value, password.value);
    });
});