const express = require('express');
const {createUser, addFavorite} = require('../../controllers/api/usersController')


const router = express.Router();



const handleErrorResponse = (res, error) => {
    console.log(error);
    res.status(500).json({message: 'failure', payload: error});
}



router.post('/', async (req, res) => {
    try {
        const user = await createUser(req.body);
        user.password = undefined; // won't send the encrypted password
        res.status(201).json({message:'success', payload: user})
    } catch (error) {
       handleErrorResponse(res, error) 
    }
})



router.patch('/', async (req, res) => {
    try {
        const user = await addFavorite(req.body.username, req.body.pokemonId); // addFavorite() will return a user - this is in usersController.js
        res.status(200).json({message: 'success', payload: user});
    } catch (error) {
        handleErrorResponse(res, error);
    }
})





module.exports = router;