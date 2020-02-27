const config = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authService = require("../services/auth");
const userService = require("../services/user");

//Sisäänkirjautuminen. Tämä funktio juttelee frontin kanssa ja saa tiedon tietokantajutuista services.auth.js -tiedostosta. Jos käyttäjä löytyy, funktio saa tokenin ja opettajatunnuksen, jotka se palauttaa frontille.
function login(req, res) {
  return authService
    .authenticate(req.body)
    .then(result => {
      var token = result.token;
      var badge = result.teacher_badge
      res.send({
        success: true,
        data: token,
        badge: badge
      });
    })
    .catch(err => {
      res.send({
        success: false,
        message: err.message
      });
    });
}

//Rekistetöityminen. Funktio tarkistaa salasanan ja sähköpostiosoitteen pätevyyden ja sitten sen, onko sähköpostiosoitteella jo rekisteröity käyttäjä. Jos kaikki on ok, muodostaa user-olion, jonka lähettää servicen user.js:lle tietokantaan tallennettavaksi. Salasana hashataan tässä kohtaa ennen kuin se lähtee kohti tietokantaa.
function register(req, res) {
  var login = req.body.login;
  var pass = req.body.password;
  
  const validName = login => {
    var re = /\S+@\S+\.\S+/;
    return re.test(login);
  };
  const validPassword = pass => {
    var reP = /^(?=.*\d).{8,}$/;
    return reP.test(pass);
  };
  var isValidLogin = validName(login);
  var isValidPassword = validPassword(pass);
  return (
    userService
      .getUserByLogin(req.body.login || "")
      
      .then(exists => {
        if (!isValidLogin) {
          return res.send({
            success: false,
            message: "Rekisteröinti epäonnistui. Käytä sähköpostiosoitettasi"
          });
        } else if (!isValidPassword) {
          return res.send({
            success: false,
            message:
              "Rekisteröinti epäonnistui. Salasana on liian lyhyt. Vähintään 8 merkkiä, joista yksi numero."
          });
        } else if (exists) {
          return res.send({
            success: false,
            message:
              "Rekisteröinti epäonnistui. Tällä sähköpostiosoittella on jo rekisteröitynyt käyttäjä."
          });
        }

        var user = {
          login: req.body.login,
          password: bcrypt.hashSync(req.body.password, config.saltRounds),
          teacher_badge: req.body.teacher_badge
        };
        return userService
          .addUser(user)
          .then(() =>
            res.send({ success: true, message: "Rekisteröinti onnistui" })
          );
      })
  );
}

//
function logout(req, res) {
  return authService
    .authenticate(req.body)
    .then(token => {
      res.send({
        success: true,
        data: { token },
        tiedot: req.body
      });
    })
    .catch(err => {
      res.send({
        success: false,
        message: err.message
      });
    });
}

//Funktio, joka tarkistaa, onko opettajatunnus olemassa. Hakee siis käyttäjää opettajatunnuksella ja jos ei tule validia vastausta, palauttaa false-viestin frontille
function verifyTeacher(req, res) {
  return userService
    .verifyUser(req.body.badge)
    .then(exists => {
      if(exists) {
        return res.send({
          success: true,
          message: "Opettajanumero on validi"
        })
      } else {
        return res.send({
          success: false,
          message: "Opettajaa ei löydy"
        })
      }
    })
}

module.exports = {
  login,
  register,
  logout,
  verifyTeacher
};
