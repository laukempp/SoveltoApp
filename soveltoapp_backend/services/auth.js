const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models').User;
const config = require('../config/config');

//Autentikointi. Funktio tarkistaa, löytyykö käyttäjä Users-taulusta. Jos löytyy, funktio luo tokenin ja palauttaa sen frontille yhdessä käyttäjän opettajatunnuksen kanssa. Jos ei löydy, palautetaan virheilmoitus, ettei käyttäjää ole. Jos salasanat eivät täsmää, palautetaan tieto siitä. 
const authenticate = params => {
      return Users.findOne({
          where: {
              login: params.login
          },
          raw: true
     }).then(user => {
          if (!user)
              throw new Error('Kirjautuminen epäonnistui. Käyttäjää ei löytynyt.');
          if (!bcrypt.compareSync(params.password || '', user.password))
              throw new Error('Kirjautuminen epäonnistui. Väärä käyttäjänimi tai salasana.');
          const payload = {
              login: user.login,
              id: user.id,
              time: new Date()
          };
          var token = jwt.sign(payload, config.jwtSecret, {
              expiresIn: config.tokenExpireTime
          });
          var teacher_badge = user.teacher_badge;
          return {token, teacher_badge};
      });
}

module.exports = {
    authenticate
}