const router = require("express").Router();
const { UsersModel } = require("../models");
const { UniqueConstraintError } = require("sequelize/lib/errors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validateJWT = require("../middleware/validate-jwt");

router.post("/register", async (req, res) => {
 let { email, password, isAdmin } = req.body.user;
try {
  const User = await UsersModel.create({
        email,
        password: bcrypt.hashSync(password, 13),
        isAdmin 
    });

let token = jwt.sign({id: User.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});

   res.status(201).json({
       message: "User successfully registered",
       user: User,
       sessionToken: token
   });
} catch (err) {
    if (err instanceof UniqueConstraintError) {
        res.status(409).json({
            message: "Email already in use",
        });
    } else {
    res.status(500).json({
         message: "Failed to register user",
    });
   }
  }
 });

 router.post("/login", async (req, res) => {
    let { email, password } = req.body.user;

try {
    let loginUser = await UsersModel.findOne({
        where: {
            email: email,
        },
    });

    if (loginUser) {

        let passwordComparison = await bcrypt.compare(password, loginUser.password);

        if (passwordComparison) {

        let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60 * 60 * 24});

        res.status(200).json({
            user: loginUser,
            message: "User successfully logged in!",
            sessionToken: token
        });
        } else {
            res.status(401).json({
                message: "Incorrect email or password"
            })
        }
        
    } else {
        res.status(401).json({
            message: "Incorrect email or password"
        });
    }
  } catch (error) {
      res.status(500).json({
          message: "Failed to log user in"
      })
    }
 });




 /* 
  =======================
     Delete a User
  =======================
*/
//    router.delete("/delete/:id", validateJWT, async (req, res) => {
//          const { email, password, isAdmin } = req.body.user;
//          const userId = req.params.id;
//        
//          try {
//            const query = {
//              where: {
//                 email: email,
//                 password: password,
//                 userId: userId,
//                 isAdmin: true
//              }
//            };
//        
//            await UserModel.destroy(query);
//            res.status(200).json({ message: "User successfully deleted" });
//          } catch (err) {
//            res.status(500).json({ error: err });
//          }
//        });

module.exports = router;