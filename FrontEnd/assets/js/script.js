// Constantes pour les URLs de l'API
const API_WORKS_URL = "http://localhost:5678/api/works";
const API_CATEGORIES_URL = "http://localhost:5678/api/categories";

// Sélection des éléments DOM
const elements = {
    galleryContainer: document.querySelector(".gallery"),
    categoriesContainer: document.querySelector(".categoriesContainer"),
    log: document.querySelector("#log"),
    modifier: document.querySelector(".modifier"),
    banner: document.querySelector(".banner"),
    mainModal: document.querySelector("#modalPrincipal"),
    worksIconContainer: document.querySelector(".worksIcon"),
    galleryButtonsClose: document.querySelectorAll(".modal .galleryClose"),
    openSecondModal: document.querySelector(".ajoutPicture"),
    secondModal: document.querySelector("#secondModal"),
    fileInput: document.querySelector("#fileUpload"),
    imgPreview: document.querySelector("#imagePreview"),
    formModal: document.querySelector("#formModal"),
    categorieSelected: document.querySelector("#category"),
    addPhotoButton: document.querySelector(".addPhoto"),
    iconPreview: document.querySelector("#iconPreview"),
    extensions: document.querySelector(".extensions"),
    submitButton: document.querySelector("#formModal button"),
    returnArrow: document.querySelector(".return")
};

let allWorks = [];
let allCategories = [];

/**
 * Fonction asynchrone pour récupérer les données des œuvres depuis l'API.
 */
const getWorks = async () => {
    try {
        const result = await fetch(API_WORKS_URL);
        const data = await result.json();
        allWorks = data;
        console.log("Réponse API des œuvres: ", data);
        displayWorks(allWorks);
    } catch (error) {
        console.error(error);
    }
};

/**
 * Affiche les œuvres dans la galerie.
 * @param {Array} works - Les œuvres à afficher.
 */
const displayWorks = (works) => {
    elements.galleryContainer.innerHTML = "";
    works.forEach((work) => {
        const figure = createFigure(work);
        elements.galleryContainer.appendChild(figure);
    });
};

const createFigure = (work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;
    figure.appendChild(img);
    const figureCaption = document.createElement("figcaption");
    figureCaption.textContent = work.title;
    figure.appendChild(figureCaption);
    return figure;
};

const getCategories = async () => {
    try {
        const result = await fetch(API_CATEGORIES_URL);
        allCategories = await result.json();
        allCategories.unshift({id: 0, name: "Tous"});
        console.log("Réponse API des catégories: ", allCategories);
        addCategoryButtons();
        addEventListenerToButtons();
    } catch (error) {
        console.error(error);
    }
};

const addCategoryButtons = () => {
    elements.categoriesContainer.innerHTML = "";
    allCategories.forEach((category) => {
        const button = createCategoryButton(category);
        elements.categoriesContainer.appendChild(button);
    });
};

const createCategoryButton = (category) => {
    const button = document.createElement("button");
    button.setAttribute("category_id", category.id);
    button.innerHTML = category.name;
    button.classList.add("categoriesButton");
    return button;
};

const addEventListenerToButtons = () => {
    const buttonTab = document.querySelectorAll(".categoriesContainer button");
    buttonTab.forEach((button) => {
        button.addEventListener("click", () => {
            buttonTab.forEach((btn) => btn.classList.remove("categoriesButtonActive"));
            button.classList.add("categoriesButtonActive");
            const categoryId = Number(button.getAttribute("category_id"));
            const filteredWorks = categoryId !== 0 ? allWorks.filter((work) => work.categoryId === categoryId) : allWorks;
            displayWorks(filteredWorks);
        });
    });
};

const isUserConnected = () => {
    const token = localStorage.getItem("token");
    const isConnected = !!token;
    console.log("isConnected", isConnected);
    elements.log.innerHTML = isConnected ? "logout" : "login";
    elements.categoriesContainer.style.display = isConnected ? "none" : "flex";
    elements.modifier.style.visibility = isConnected ? "visible" : "hidden";
    elements.banner.style.display = isConnected ? "flex" : "none";
    return isConnected;
};

const handleLogClick = (event) => {
    event.preventDefault();
    if (isUserConnected()) {
        localStorage.removeItem("token");
        isUserConnected();
        window.location.href = "index.html";
    } else {
        window.location.href = "login.html";
    }
};

elements.log.addEventListener("click", handleLogClick);

// Appels des fonctions au chargement de la page
getWorks();
getCategories();
isUserConnected();

let trash = []
let snaps = []

// fonction pour récupérer les image de l'api et y mettre le logo poubelle

const populateModalPrincipal = async () => {
    try {
        const works = await fetch(API_WORKS_URL) // récupération des données depuis l'API
        let worksData = await works.json()
        elements.worksIconContainer.innerHTML = ""
        worksData.forEach((workData) => {
            let img = document.createElement("img")
            img.src = workData.imageUrl
            snaps[workData.id] = document.createElement("figure")
            snaps[workData.id].appendChild(img)
            trash[workData.id] = document.createElement("i")
            trash[workData.id].classList.add("fa-solid", "fa-trash-can", "trash")
            snaps[workData.id].appendChild(trash[workData.id])
            elements.worksIconContainer.appendChild(snaps[workData.id])
            let url = `http://localhost:5678/api/works/${workData.id}`

            trash[workData.id].addEventListener("click", () => {
                deleteWork(url)
                elements.mainModal.style.display = "none"
            })
        })
    } catch (error) {
        console.error("error fetching work", error)
        throw new Error("Error fetching work data", error)
    }
}


/**
 * Supprime de manière asynchrone une œuvre du serveur.
 *
 * Cette fonction envoie une requête DELETE à l'URL donnée pour supprimer une œuvre.
 * Elle vérifie d'abord si l'utilisateur est authentifié en vérifiant la présence d'un token dans le localStorage.
 * Si le token n'est pas présent, une alerte est affichée indiquant que l'utilisateur n'est pas connecté.
 * Si l'utilisateur confirme l'action de suppression, une requête DELETE est envoyée au serveur.
 * Si la suppression réussit, la fonction procède à la mise à jour de la galerie en
 * vidant le contenu actuel, en récupérant la liste mise à jour des œuvres et en peuplant la galerie modale.
 *
 * @param {string} url - L'URL du point de terminaison à laquelle envoyer la requête DELETE.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque l'œuvre a été supprimée et que la galerie est mise à jour.
 */
const deleteWork = async (url) => {
    const token = localStorage.getItem("token")
    if (!token) {
        alert("vous n'êtes pas connectés")
        return
    }
    const confirmation = confirm("êtes vous sûr de vouloir supprimer ce work")
    if (!confirmation) return
    try {
        let response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token} `
            }
        })
        if (!response.ok) {
            return Promise.reject(new Error(`error http ${response.status}`));
        }
        console.log("work deleted");
    } catch (error) {
        console.error("error deleting work", error)
    }

    elements.galleryContainer.innerHTML = ""

    // il faut raffraichir la gallerie

    await getWorks()
    await populateModalPrincipal()
    elements.mainModal.style.display = "none"
}

// Pour ouvrir la galerie ou première modal

elements.modifier.addEventListener("click", async () => {
    elements.mainModal.style.display = "flex"
    //elements.galleryInterface.style.display = "flex"
    await populateModalPrincipal()
})

// Pour fermer la galerie

//Generic method to close a modal
const closeModal = (modal) => {
    modal.style.display = "none"
}

elements.galleryButtonsClose.forEach((buttonClose) => {
    buttonClose.addEventListener("click", () => {
        const modal = buttonClose.closest(".modal")
        if (modal === elements.mainModal) {
            closeModal(elements.mainModal)
        } else if (modal === elements.secondModal) {
            closeModal(elements.secondModal)
        }
    });
})

elements.openSecondModal.addEventListener("click", () => {
    elements.secondModal.style.display = "flex";
    elements.mainModal.style.display = "none";
    selectCategories();
    validateFormButton();
    resetForm();
})

//Pour le bouton "return"
elements.returnArrow.addEventListener("click", () => {
    elements.secondModal.style.display = "none";
    elements.mainModal.style.display = "flex";
})

/**
 * Une liste des extensions de fichiers acceptées pour les téléchargements d'images.
 *
 * Ce tableau contient les extensions de fichiers qui sont autorisées
 * pour le téléchargement de fichiers image. Les formats acceptés
 * sont actuellement 'jpg' et 'png'.
 *
 * @type {string[]}
 */
const ACCEPTED_EXTENSIONS = ["jpg", "png"];


/**
 * Gère l'événement de changement de fichier.
 *
 * Cette fonction traite le fichier sélectionné par l'utilisateur lors d'un événement de changement d'entrée.
 * Elle vérifie si le fichier est valide et, si tel est le cas, télécharge l'image. Si le fichier n'est pas valide,
 * elle affiche un message d'erreur.
 *
 * @param {Event} event - L'événement de changement d'entrée déclenché par la sélection d'un fichier.
 */
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && isValidFile(file)) {
        uploadImage(file);
    } else {
        alert("Erreur lors du chargement de l'image");
    }
};


/**
 * Vérifie si un fichier donné est valide en fonction de sa taille et de son extension.
 *
 * Le fichier est considéré comme valide si sa taille est inférieure à 4Mo et si son
 * extension est incluse dans la liste des extensions acceptées.
 *
 * @param {Object} file - L'objet fichier à valider.
 * @param {string} file.name - Le nom du fichier, y compris son extension.
 * @param {number} file.size - La taille du fichier en octets.
 * @returns {boolean} - Retourne vrai si le fichier est valide, sinon faux.
 */
const isValidFile = (file) => {
    const fileName = file.name;
    const extension = fileName.split(".").pop().toLowerCase();
    return file.size < 4 * 1024 * 1024 && ACCEPTED_EXTENSIONS.includes(extension);
};


/**
 * uploadImage is a function that reads an image file and processes it by converting it to a data URL.
 *
 * @param {File} file - The image file to be uploaded and processed.
 */
const uploadImage = (file) => {
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsDataURL(file);
};


/**
 * Gère l'événement de chargement de fichier déclenché lorsqu'un fichier est sélectionné.
 *
 * Cette fonction met à jour la source de l'aperçu de l'image avec le résultat de l'événement,
 * change le style d'affichage de différents éléments dans l'interface utilisateur pour afficher l'aperçu de l'image,
 * et cache le bouton d'ajout de photo, l'icône d'aperçu, et l'indice des extensions.
 *
 * @param {Event} event - L'événement de chargement de fichier contenant le résultat à prévisualiser.
 */
const handleFileLoad = (event) => {
    elements.imgPreview.src = event.target.result;
    elements.imgPreview.style.display = "flex";
    elements.addPhotoButton.style.display = "none";
    elements.iconPreview.style.display = "none";
    elements.extensions.style.display = "none";
};


elements.fileInput.addEventListener("change", handleFileChange);


//Pour créer le menu déroulant
const selectCategories = () => {
    elements.categorieSelected.innerHTML = ""
    let option = document.createElement("option")
    elements.categorieSelected.appendChild(option)
    console.log(allCategories)
    const allCategoriesWithoutTous = allCategories.filter((categorie) => categorie.id !== 0)
    console.log("texte", allCategoriesWithoutTous)
    allCategoriesWithoutTous.forEach((categorie) => {
        let option = document.createElement("option")
        option.value = categorie.name
        option.innerText = categorie.name
        option.id = categorie.id
        elements.categorieSelected.appendChild(option)

    })
}

elements.formModal.addEventListener("submit", async (e) => {
    e.preventDefault()
    await upLoadFile()

})


/**
 * Gère de manière asynchrone le téléchargement d'un fichier ainsi que ses métadonnées (titre et catégorie) vers un point de terminaison de serveur spécifié.
 *
 * La fonction récupère un token depuis le stockage local à des fins d'autorisation et prépare les données de formulaire nécessaires
 * à partir des entrées utilisateur. Elle valide que tous les champs requis sont remplis avant de continuer. Si une quelconque entrée requise est manquante,
 * elle alerte l'utilisateur et arrête l'opération.
 *
 * Après validation réussie, elle demande à l'utilisateur de confirmer le téléchargement du fichier. Si confirmé, la fonction envoie
 * une requête HTTP POST au serveur avec le fichier et les métadonnées. Si le téléchargement est réussi, un message de succès est affiché
 * à l'utilisateur et la galerie est rafraîchie. En cas d'erreur pendant le processus de téléchargement, elle enregistre l'erreur dans la console.
 *
 * @returns {Promise<void>} Renvoie une promesse qui se résout lorsque l'opération est terminée.
 */

const upLoadFile = async () => {
    const token = localStorage.getItem("token")

    const formData = new FormData();
    formData.append("image", elements.fileInput.files[0]);
    formData.append("title", elements.formModal.title.value);
    formData.append("category", elements.categorieSelected.selectedIndex);

    //On arrète le script si un des input manque
    if (!elements.fileInput.files[0] || !elements.formModal.title.value || elements.categorieSelected.selectedIndex === 0) {
        alert("Veuillez remplir tous les champs");
        return;
    }

    //Message de confirmation
    const confirmation = confirm(`Voulez-vous vraiment ajouter le work ${elements.formModal.title.value} ?`);
    if (!confirmation) {
        return
    }

    try {
        const response = await fetch(API_WORKS_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) {
            return Promise.reject(new Error(`Error uploading file: ${response.status}`));
        }
        alert(`${elements.formModal.title.value} a été ajouté avec succès`)
        console.log("File uploaded successfully");
        //Vider et raffraichir la galerie
        elements.galleryContainer.innerHTML = "";
        await getWorks();
        await populateModalPrincipal();
        elements.secondModal.style.display = "none";
    } catch (error) {
        console.error("Error uploading file", error);
    }
}

/**
 * Active ou désactive le bouton de soumission en fonction de la validation du formulaire.
 * Le bouton est activé si le formulaire a un titre valide, une catégorie sélectionnée, et un fichier valide est téléchargé.
 * Le bouton activé est en vert et désactivé est en gris
 */
const validateFormButton = () => {
    const titleValid = elements.formModal.title.value.trim() !== "";//trim() enlève les espaces sur les 2 extrémités
    const categoryValid = elements.categorieSelected.selectedIndex > 0;
    const fileValid = elements.fileInput.files.length > 0 && isValidFile(elements.fileInput.files[0]);
    elements.submitButton.disabled = !(titleValid && categoryValid && fileValid);
};

elements.formModal.addEventListener("input", validateFormButton);
elements.fileInput.addEventListener("change", validateFormButton);
elements.categorieSelected.addEventListener("change", validateFormButton);

/**
 * Réinitialise tous les champs et les données du formulaire à leur état par défaut.
 * Cela inclut le nettoyage de l'entrée de fichier, la réinitialisation de l'entrée du titre,
 * la mise par défaut du sélecteur de catégorie, et la dissimulation de l'aperçu de l'image.
 */
const resetForm = () => {
    // Clear the file input
    elements.fileInput.value = "";

    // Reset the title input
    elements.formModal.title.value = "";

    // Set the category dropdown to its default option
    elements.categorieSelected.selectedIndex = 0;

    // Hide the image preview
    elements.imgPreview.src = "";
    elements.imgPreview.style.display = "none";

    // Show the add photo button, icon preview, and extensions hint
    elements.addPhotoButton.style.display = "inline-block";
    elements.iconPreview.style.display = "";
    elements.extensions.style.display = "";

    // Disable the submit button
    elements.submitButton.disabled = true;
};

// ajouter un écouteurd'évènements pour fermer les modales lorqu'on clique à l'exterieur

window.addEventListener("click", (event) => {
    if (event.target === elements.formModal) {
        elements.formModal.style.display = "none";
    } if (event.target === elements.secondModal) {
        elements.secondModal.style.display = "none"
    }
})