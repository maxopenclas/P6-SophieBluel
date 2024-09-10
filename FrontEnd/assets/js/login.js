document.addEventListener("DOMContentLoaded", () => {



// variables utilisées

const email = document.querySelector("#email");
const form = document.querySelector("#formLogin");
const errorMessage = document.createElement("div")


const API = "http://localhost:5678/api/users/login";

const loginUser = async (email, password) => {
    try{
        const response = await fetch(API, {
            method: "POST", 
            headers: {
                "Accept": "application/json", 
                "Content-Type": "application/json;charset=utf-8",
            }, 
            body: JSON.stringify( {
                email, password
            })
        })
        const data = await response.json() 
        console.log("data contient", data)
        if(response.ok){
            localStorage.setItem("token",data.token)
            window.location = "index.html"
        }else {
            console.error("erreur de connexion")
            errorMessage.innerHTML= "identifiant ou mot de passe incorrects"
            errorMessage.style.background = "red"
            errorMessage.style.color = "white"
            errorMessage.style.display ="flex"
            form.appendChild(errorMessage)
            setTimeout(() => {
                errorMessage.style.display = "none"
            },5000)
        }
    }catch (error){
        console.log ("identifiant ou mot de passe incorrect", error)
        errorMessage.innerHTML= "identifiant ou mot de passe incorrects"
        errorMessage.style.background = "red"
        errorMessage.style.color = "white"
        form.appendChild(errorMessage)
        setTimeout(() => {
            errorMessage.style.display = "none"
        },5000)
    }
}

// se connecter lorsque qu'on clique sur le bouton 

form.addEventListener("submit", (event) => {
    event.preventDefault();
    // validation du formulaire
    
    // appel de la fonction loginUser
    loginUser(form.email.value, form.password.value)
})

})

