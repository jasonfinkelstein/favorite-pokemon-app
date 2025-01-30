// Import express, set up router
const express = require("express");
const bcrypt = require('bcrypt');
const router = express.Router();

// Import functionality from the view controller

const {
  getAllPokemon,
  getOnePokemon,
  deleteOnePokemon,
  createOnePokemon,
  updateOnePokemon,
} = require('../../controllers/api/pokemonController');

const {
  createUser,
  addFavorite
} = require('../../controllers/api/usersController');

const User = require("../../models/User");
const Pokemon = require("../../models/Pokemon");

router.get("/", (req, res) => {
  res.render("index", {isLoggedIn: req.session.isAuth});
});


// localhost:3000/pokemons
router.get("/pokemons", async function (req, res) {
  try {
    const pokemons = await getAllPokemon();

    // Populates a web page with our entire collection data
    res.render("pokemons", { pokemons: pokemons, isLoggedIn: req.session.isAuth });
  } catch (error) {
    console.log(error);
  }
})

// localhost:3000/one-pokemon/:name
router.get("/one-pokemon/:name", async function (req, res) {
  try {
    const pokemon = await getOnePokemon(req.params.name);
    // Use pokemons.ejs file, all data will be in pokemon
    res.render("one-pokemon", { pokemon: pokemon, isLoggedIn: req.session.isAuth });
  } catch (error) {
    console.log(error);
  }
})

// localhost:3000/delete-pokemon/:name
router.delete('/delete-pokemon/:name', async function (req, res) {
  try {
    await deleteOnePokemon(req.params.name);
    res.redirect('/pokemons');
  } catch (error) {
    console.log(error);
    res.redirect('/pokemons');
  }
})

// localhost:3000/create-pokemon-form
router.get("/create-pokemon-form", async function(_, res) {
  try {
    res.render("create-pokemon", {isLoggedIn: req.session.isAuth});
  } catch (error) {
    console.log(error);
  }
})

// localhost:3000/create-pokemon
router.post("/create-pokemon", async function(req, res) {
  try {
    const newPokemon = {
      ...req.body,
      moves: req.body.moves
        .split(',')
        .map((move) => move.trim()),
    };

    const pokemon = await createOnePokemon(newPokemon);
    res.redirect(`/one-pokemon/${pokemon.name}`);
  } catch (error) {
    console.log(error);
    res.redirect("/pokemons");
  }
});


// localhost:3000/update-pokemon-form/:name
router.get("/update-pokemon-form/:name", async function(req, res) {
  try {
    // Target the correct document to be updated
    const pokemon = await getOnePokemon(req.params.name);

    // Render the update form with the filled-in original info
    res.render("update-pokemon", { pokemon: pokemon, isLoggedIn: req.session.isAuth });
  } catch (error) {
    console.log(error);
  }
})

// localhost:3000/update-pokemon/:name
router.patch('/update-pokemon/:name', async function (req, res) {
  try {
    const pokemon = await updateOnePokemon(req.params.name, req.body);
    res.redirect(`/one-pokemon/${pokemon.name}`);
  } catch (error) {
    console.log(error);
    res.redirect(`/one-pokemon/${req.params.name}`);
  }
})

// 6. Set up Signup and Login form-rendering routes.

router.get('/sign-up', (req, res) => {
  try {
    res.render('sign-up', {isLoggedIn: req.session.isAuth});
  } catch (error) {
    res.render('404', {isLoggedIn: req.session.isAuth});
  }
})


// localhost:3000/create-user

router.post('/create-user', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.redirect('/log-in');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
})

router.get('/log-in', (req, res) => {
  try {
    res.render('log-in', {isLoggedIn: req.session.isAuth});
  } catch (error) {
    res.render('error', {isLoggedIn: req.session.isAuth});
  }
})

router.post('/log-in-user', async (req, res) => {
  try {
    const user = await User.findOne({username: req.body.username});
    if(!user) {
      res.render('error', {errorMessage: 'Username is incorrect.', isLoggedIn: req.session.isAuth});
      return;
    }

    const isCorrectPassword = await bcrypt.compare(req.body.password, user.password)
    if (!isCorrectPassword) {
      res.render('error', {errorMessage: 'Password is incorrect', isLoggedIn: req.session.isAuth});
      return;
    }
    req.session.isAuth = true;
    req.session.username = user.username;
    res.redirect('/user');
  } catch (error) {
    console.log(error);
    res.render('error', {errorMessage: "Sorry, that shouldn't have happened! Some server error occurred.", isLoggedIn: req.session.isAuth});
  }
})



/*
  12. Set up front-end route for the user page
*/

router.get('/user', async (req, res) => {
  try {
    if (!req.session.isAuth) {
      res.redirect('/log-in');
      return;
    }

    const user = await User.findOne({username: req.session.username});
    const faves = await Pokemon.find({_id:{$in: user.favoritePokemon}});
    res.render('user', {favoritePokemon: faves, username: user.username, isLoggedIn: req.session.isAuth})
  } catch (error) {
    res.render('error', {errorMessage: 'Sorry, that should not have happened!', isLoggedIn: req.session.isAuth})
  }
})



/*
  17. Set up log out route to end sessions
*/

router.get('/logout', async (req, res) => {
  try {
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: false,
      maxAge: null,
    });

    req.session.destroy();
    res.redirect('/');

  } catch (error) {
    res.render('error', {errorMessage: 'Something weird happened... Try again.', isLoggedIn: req.session.isAuth})
  }
})



router.patch('/addFavorite/:pokemonId', async (req, res) => {
  try {
    if (!req.session.isAuth) {
      res.redirect('/sign-up');
      return;
    }

    const user = await addFavorite(req.session.username, req.params.pokemonId);
    res.redirect('/user');
  } catch (error) {
    res.render('error', {errorMessage: 'Something weird happened... Try again.'})
  }
})




router.all('*', (req, res) => {
  res.render('error', {errorMessage: 'Page not found.', isLoggedIn: req.session.isAuth})
})

module.exports = router;
