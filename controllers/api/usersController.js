const Pokemon = require('../../models/Pokemon');
const User = require('../../models/User');
const bcrypt = require('bcrypt');

/* USERS: 
Jason, pass
JohnDoe, abc123
pokemonlover, pika
*/


async function createUser(userData) {
    try {
        // const salt = await bcrypt.genSalt(14);
        const encryptedPassword = await bcrypt.hash(userData.password, 14) // can do .hash(password, 14) instead of a salt variable
        const newUserData = {
            username: userData.username,
            password: encryptedPassword,
            favoritePokemon: [],
        }

        const newUser = await User.create(newUserData);
        return newUser;

    } catch (error) {
        throw error;
    }
}



const addFavorite = async (username, pokemonId) => {
    try {
        const user = await User.findOne({username});
        if (!user) {
            throw 'No user found with that username.';
        }

        if (await Pokemon.findById(pokemonId) == null) {
            throw 'No pokemon found with that id';
        }

        user.favoritePokemon.addToSet(pokemonId);
        await user.save();
        
        return user;

    } catch (error) {
        throw error;
    }
}




module.exports = {
    createUser,
    addFavorite
}