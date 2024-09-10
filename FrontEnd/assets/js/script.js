/* les variables globales */

const galleryContainer = document.querySelector(".gallery");
const categoriesContainer = document.querySelector(".categoriesContainer");
const API = "http://localhost:5678/api/works"
let allWorks = []
const log = document.querySelector("#log")
const modifier = document.querySelector(".modifier")
const banner = document.querySelector(".banner")
const mainModal = document.querySelector("#modalPrincipal")
const closeModal = document.querySelector(".galleryClose")
const galleryInterface = document.querySelector(".galleryInterface")
const worksIconContainer = document.querySelector(".worksIcon")
const galleryClose = document.querySelector(".galleryClose")
const openSecondModal = document.querySelector(".ajoutPicture")
const secondModal = document.querySelector("#secondModal")
const fileInput = document.querySelector("#file-upload")
const imgPreview = document.querySelector(".imgPreview")

/* méthodes pour afficher tout le work dans la gallerie */ 

const getWorks = async () => {
    try {
        const result = await fetch (`${API}`);
        const data = await result.json();
        allWorks = data;
        console.log("la réponse de l'API est ",data);
        for(let work of allWorks) {
            const figure = createFigure(work)
            galleryContainer.appendChild(figure);
        }
    } catch(error) {
        console.error(error);
    }
    
}

getWorks()

const displayWorks = (works) => {
    galleryContainer.innerHTML = ""
    works.forEach((work)=>{
       const figure = createFigure(work)
       galleryContainer.appendChild(figure)
    })
}

const createFigure = (work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);
    const figureCaption = document.createElement("figcaption");
    figureCaption.textContent = work.title;
    figure.appendChild(figureCaption);
    return figure
}

let allCategories = []

const API_CATEGORIES = "http://localhost:5678/api/categories"
const getCategories = async () => {
    try {
        const result = await fetch (`${API_CATEGORIES}`);
        const dataCategories = await result.json();
        allCategories = dataCategories;
        allCategories.unshift({
            id:0, name:"Tous"
        })
        console.log("la réponse de l'API_CATEGORIES est ",allCategories);
    for(let category of allCategories) {
        const cat = buttonCategory(category)
        categoriesContainer.appendChild(cat)
    }
        
    addEventListenerToButtons()

    } catch(error) {
        console.error(error);
    }
}

const buttonCategory = (category) => {
    const button = document.createElement("button");
    button.setAttribute("category_id", category.id);
    button.innerHTML = category.name;
    button.classList.add("categoriesButton")
    return button 
}

const addEventListenerToButtons = () => {
    const buttonTab = document.querySelectorAll(".categoriesContainer button");
    buttonTab.forEach((button)=> {
        button.addEventListener("click",() => {
            buttonTab.forEach((btn)=>btn.classList.remove("categoriesButtonActive"))  //on retire la classe de n'importe quels boutons.
            button.classList.add("categoriesButtonActive") // on ajoute la classe sur le bouton cliqué
            const categoryId = button.getAttribute("category_id")
            if(categoryId !== "0") {
                const filterWorks = allWorks.filter((work)=>work.categoryId == categoryId)
                displayWorks(filterWorks)
            }else{
                displayWorks(allWorks)
            }
        })
    })
}

getCategories() 
let isConnected = false 
const isUserConnected = () => {
const token = localStorage.getItem("token")
if (token) {
    isConnected = true 
} 
console.log("isConnected" , isConnected)
if (isConnected) {
    log.innerHTML = "logout"
    categoriesContainer.style.display = "none" 
    modifier.style.visibility = "visible"
    banner.style.display = "flex"
} else {
    log.innerHTML = "login"
    categoriesContainer.style.display = "flex" 
    modifier.style.visibility = "hidden"
}
}

isUserConnected()

log.addEventListener("click", (event) => {
    event.preventDefault()
    if (isConnected) {
        localStorage.removeItem("token")
        isUserConnected()
        window.location.href = "index.html"
    } else {
        window.location.href = "login.html"
    }
})

let trash = []
let snaps = []

// fonction pour récupérer les image de l'api et y mettre le logo poubelle

const populateModalPrincipal = async () => {
    try {
    const works = await fetch(`${API}`) // récupération des données depuis l'API 
    let worksData = await works.json() 
    worksIconContainer.innerHTML = ""
    worksData.forEach((workData)=>{
        let img = document.createElement("img")
        img.src = workData.imageUrl
        snaps[workData.id] = document.createElement("figure")
        snaps[workData.id].appendChild(img)
        trash[workData.id] = document.createElement("i")
        trash[workData.id].classList.add("fa-solid" , "fa-trash-can","trash")
        snaps[workData.id].appendChild(trash[workData.id])
        worksIconContainer.appendChild(snaps[workData.id])
        let url = `http://localhost:5678/api/works/${workData.id}`
       
        trash[workData.id].addEventListener("click", () => {
            deleteWork(url)
            mainModal.style.display = "none"
        })
    })
} catch(error) {
console.error("error fetching work", error)
throw new Error(`API error status with status ${response.status}`)
} 
}

const deleteWork = async (url) => {
    const token = localStorage.getItem("token")
    if(!token) {
        alert("vous n'êtes pas connectés")
        return 
    }
    const confirmation = confirm("êtes vous sûr de vouloir supprimer ce work")
    if(!confirmation) return 
    try {
        let response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token} `
            }
        })
        if (!response.ok) {
            throw new Error(`error http ${response.status}`)
        }
        console.log("work deleted");
    } catch (error) {
        console.error("error deleting work", error)
    }
     
    galleryContainer.innerHTML = ""

    // il faut raffraichir la gallerie

    getWorks() 
    populateModalPrincipal()
    mainModal.style.display = "none"
}

// pour ouvrir la galerie

modifier.addEventListener("click", () => {
    mainModal.style.display = "flex"
    galleryInterface.style.display = "flex"
    populateModalPrincipal()
} ) 

// pour fermer la galerie

galleryClose.addEventListener("click" , () => {
    mainModal.style.display = "none"
})

openSecondModal.addEventListener("click" , () => {
    secondModal.style.display = "flex"
} )

fileInput.addEventListener("change" , (event) => {
    const file = event.target.files[0]
    console.log(file)
    const ACCEPTED_EXTENSIONS = ["jpg", "png"]
    const fileName = file.name 
    const extension = fileName.split(".").pop().toLowerCase()
    if(file && file.size < 4 * 1024 * 1024 && ACCEPTED_EXTENSIONS.includes(extension)) {
        const reader = new FileReader()
        reader.onload = (e) => {
            imgPreview.src = e.target.result
            imgPreview.style.display = "flex"
        }
        reader.readAsDataURL(file)
    } else {
        alert("erreur lors du chargement de l'image")
    }
})

