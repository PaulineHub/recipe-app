//***SELECT ITEMS ***//

const mealsBody = document.getElementById('meals');
const favoriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById('search-term');//input
const searchBtn = document.getElementById('search');//btn
const mealPopup = document.getElementById("meal-popup");
const mealInfoContainer = document.getElementById("meal-info");
const popupCloseBtn = document.getElementById("close-popup");

//***REQUETES API ***//

getRandomMeal();
fetchFavMeals();

async function getRandomMeal(){
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
    const respData = await resp.json();
    const randomMeal= respData.meals[0];
    addMeal(randomMeal, true);
}

async function getMealById(id){
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealBySearch(term){
    const resp = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
    const respData = await resp.json();
    const meals = respData.meals;
    return meals;
}

//*** AJOUTER PLAT VISIBLE DANS BODY (SEARCH OU RANDOM)***//

function addMeal(mealData, random = false){ 
    console.log(mealData)
    const meal = document.createElement('div');
    meal.classList.add('meal');
    //si recette random, on affiche span random recipe, sinon on affiche que la recette
    meal.innerHTML = `<div class="meal-header">
    ${random ? `<span class="random"> Random Recipe </span>`: ""} 
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    />
    </div>
    <div class="meal-body">
    <h4>${mealData.strMeal}</h4>
    <button class="fav-btn">
        <i class="fas fa-heart"></i>
    </button>
    </div>`;
    meals.appendChild(meal);
    //activer btn favoris et passer les meals fav ds le LS
    const btnFav = meal.querySelector(".meal-body .fav-btn");
    btnFav.addEventListener("click", ()=>{
        if(btnFav.classList.contains('active')){
            removeLocalStorage(mealData.idMeal);
            btnFav.classList.remove('active');
        }else{
            addLocalStorage(mealData.idMeal);
            btnFav.classList.add('active');
        }
        fetchFavMeals();
    });
    //afficher la recette
    meal.addEventListener('click',()=> {
        showMealInfo(mealData);
    });
}

//***LOCAL STORAGE ***//

function addLocalStorage(mealId){
    const mealIds = getLocalStorage();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));//convertit items en JSON et les ajoute au storage
}

function removeLocalStorage(mealId){
    const mealIds = getLocalStorage();
    localStorage.setItem('mealIds',JSON.stringify(mealIds.filter((id) => 
        id !== mealId))
        );
}

function getLocalStorage(){
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}

//*** SECTION FAVORIS ***//
// OBTENIR RECETTES COMPLETES PLATS MIS EN FAVORIS ET AJOUTER A UL

async function fetchFavMeals(){
    favoriteContainer.innerHTML = '';
    const mealIds = getLocalStorage();
    for(let i = 0; i < mealIds.length; i++){//parcourir tb LS pr recup ts les id
        const mealId = mealIds[i];
        const mealRecipe = await getMealById(mealId);//demander chaque recette complete des id correspondants
        addMealToFav(mealRecipe); // mettre ces recettes ds ul des fav
    }
}

function addMealToFav(mealData){
    const favMeal = document.createElement('li');
    favMeal.innerHTML = `<img
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-window-close"></i></button>`;
    favoriteContainer.appendChild(favMeal);
    //activer btn clear fav
    const btnFavClear = favMeal.querySelector(".clear");
    btnFavClear.addEventListener('click', ()=> {
        removeLocalStorage(mealData.idMeal);
        fetchFavMeals();
    });
    //afficher la recette
    favMeal.addEventListener('click',()=> {
        showMealInfo(mealData);
    });
}

//***CHERCHER RECETTES ET LES FAIRE APPARAITRE DS BODY***//

searchBtn.addEventListener('click', async () => {
    const search = searchTerm.value; //renvoie la valeur rentree ds input
    const meals = await getMealBySearch(search);
    mealsBody.innerHTML = '';
    meals.forEach(meal => {
        addMeal(meal);// considere 2eme argument random comme undefined
    })
});

//*** FENETRE POP UP RECETTE ***//

function showMealInfo(mealData){
    mealPopup.classList.remove('hidden');
    mealInfoContainer.innerHTML = '';
    const mealInfo = document.createElement('div');

    const ingredients = [];
    for(let i = 1; i <= 20; i++){
        if(mealData['strIngredient' + i]){
            ingredients.push(`${mealData['strIngredient' + i]} - ${mealData['strMeasure' + i]}`);
        }else{
            break;
        };
        //console.log(ingredients);
    }

    mealInfo.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    />
    <p>
    ${mealData.strInstructions}
    </p>
    <h3>Ingredients:</h3>
    <ul>
        ${ingredients
            .map(
                ing => 
                `<li>${ing}</li>`
                )
            .join("")}
    </ul>`;
    mealInfoContainer.appendChild(mealInfo);
}

//fermer pop up recipe
popupCloseBtn.addEventListener('click', ()=> {
    mealPopup.classList.add('hidden');
})

