const express = require('express');
const mongoose = require('mongoose');
const Animal = mongoose.model('Animal');
const requireAuth = require('../../middlewares/requireAuth');
const router = express.Router();

// Submits an animal entry
router.post('/submitAnimal', requireAuth, async (req, res) => {
    try {
        const { animal } = req.body;

        if (!animal) {
            console.log("Error with animal value");
            return res.status(422).send({ error: 'Must fill out all fields' });
        }

        const newAnimal = new Animal({
            group: animal.group,
            name: animal.name,
            species: animal.species,
            dateAddedToZoo: animal.dateAddedToZoo,
            dateLeftToZoo: animal.dateLeftToZoo,
            birthdate: animal.birthdate,
            deathDate: animal.deathDate,
            picture: animal.picture,
            link: animal.link,
            cardFeatures: animal.cardFeatures
        });

        // Save the animal
        await newAnimal.save();
        console.log("Animal submitted successfully");
        return res.send({ animal: newAnimal });
    } catch (err) {
        console.log("Unable to submit animal because: " + err.message);
        return res.status(422).send({ error: err.message });
    }
});

// Gets all the animals
router.get('/getAnimals', requireAuth, async (req, res) => {
    try {
        const LIMIT = 10;
        const animals = await Animal.find().sort({ createdAt: -1 }).limit(LIMIT);
        console.log("Fetched animals successfully");
        return res.send(animals);
    } catch (err) {
        console.log("Unable to send all animals: " + err.message);
        return res.status(422).send({ error: 'Unable to send all animals' });
    }
});

// Deletes an animal entry from the db
router.delete('/deleteAnimal', requireAuth, async (req, res) => {
    try {
        const { animalId } = req.body;

        if (!animalId) {
            console.log("Error with animalId value");
            return res.status(422).send({ error: 'animalId not passed to server' });
        }

        const result = await Animal.deleteOne({ _id: animalId });
        if (result.deletedCount === 0) {
            throw new Error('Animal not found or already deleted');
        }
        console.log("Animal deleted successfully");
        return res.send({ isDeleted: true });
    } catch (err) {
        console.log("Unable to delete animal: " + err.message);
        return res.status(422).send({ error: err.message });
    }
});

module.exports = router;
