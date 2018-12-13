const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[environment];
const database = require('knex')(config);
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.set('port', process.env.PORT || 3000)

app.post('/api/v1/users', (request, response) => {
  const { user } = request.body
  let missingProperties = [];

  for (let requiredProperty of ['email', 'password']) {
    if (user[requiredProperty] === undefined) {
      missingProperties = [...missingProperties, requiredProperty];
    }
  }

  if (missingProperties.length) {
    response
      .status(422)
      .send({error: `missing required param/s: ${missingProperties}`});
    return;
  }

  database('users')
    .select(user.email, 'email')
    .then(databaseUser => {
      if (!databaseUser) {
        return response.status(404).json({ error: `User with email ${user.email} does not exist`})
      } else if (user.password !== databaseUser.password) {
        return response.status(400).json({ error: `Password is incorrect`})
      } else {
        return response.status(200).json({ id: user.id, name: user.name, email: user.email })
      }
    })
    .catch( error => {
      return response.status(500).json(error.message)
      
    })

})

app.post('/api/v1/users/new', (request, response) => {
  const user = request.body;
  let missingProperties = [];

  for (let requiredProperty of ['name', 'email', 'password']) {
    if (user[requiredProperty] === undefined) {
      missingProperties = [...missingProperties, requiredProperty];
    }
  }

  if (missingProperties.length) {
    response
      .status(422)
      .send({error: `missing required param/s: ${missingProperties}`});
    return;
  }

  database('users')
    .insert(user, 'id')
    .then(userIds => {
      response.status(201).json({ id: userIds[0], name: user.name, email: user.email });
    })
    .catch(error => ({error: error.message}));
});

app.post('/api/v1/users/favorites/new', (request, response) => {
  const favorite = request.body;
  let missingProperties = [];

  for (let requiredProperty of ['movie_id', 'user_id', 'title', 'poster_path', 'release_date', 'vote_average', 'overview']) {
    if (user[requiredProperty] === undefined) {
      missingProperties = [...missingProperties, requiredProperty];
    }
  }

  if (missingProperties.length) {
    response
      .status(422)
      .send({error: `missing required param/s: ${missingProperties}`});
    return;
  }

  database('favorites')
    .insert(favorite, 'id')
    .then(userIds => {
      response.status(201).json(favorite);
    })
    .catch(error => ({error: error.message}));
});


app.delete('/api/v1/users/:user_id/favorites/:movie_id', (request, response) => {
  database('favorites')
    .where('user_id', request.params.user_id)
    .andWhere('movie_id', request.params.movie_id)
    .del()
    .then(favorite => {
      if (favorite > 0) {
        response
          .status(204)
          .json({message: `favorite ${request.params.id} deleted`});
      } else if (favorite > 1) {
        response.status(500).json(error.message)
      } else {
        response.status(404).json({
          error: `No favorite with id ${request.params.id} exists`,
        });
      }
    })
    .catch(error => {
      response.status(500).json({error});
    });
});


app.get('/api/v1/users/:user_id/favorites', (request, response) => {
  database('favorites')
    .where('user_id', request.params.user_id)
    .select()
    .then(favorites => {
      if (!favorites) {
        response.status(200).json([])
        return;
      }


      response.status(200).json(favorites);
    })
    .catch(error => {
      response.status(500).json({error: error.message});
    });
});

app.listen(app.get('port'), () => {
  console.log(`App is running on localhost ${app.get('port')}`);
})

module.exports = app;