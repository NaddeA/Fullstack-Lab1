const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const Recipe = require('./views/recipeSchema');

dotenv.config();

const app = express();

mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/api/recipes/:title', async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ title: req.params.title });
        if (recipe) {
            res.json(recipe);
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/api/recipes', async (req, res) => {
    try {
        const existingRecipe = await Recipe.findOne({ title: req.body.title });
        if (existingRecipe) {
            return res.status(409).send('Recipe already exists');
        }
        const newRecipe = new Recipe(req.body);
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/api/recipes/:id', async (req, res) => {
    try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedRecipe) {
            res.json(updatedRecipe);
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

app.delete('/api/recipes/:id', async (req, res) => {
    try {
        const deletedRecipe = await Recipe.findByIdAndDelete(req.params.id);
        if (deletedRecipe) {
            res.json(deletedRecipe);
        } else {
            res.status(404).send('Error no recipe found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
