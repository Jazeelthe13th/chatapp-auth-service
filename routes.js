'use strict';
import express from 'express';
import userModel from './models'
import crypto from 'crypto';
import { Promise } from 'bluebird';
import fs from 'fs';
import jwt from 'jsonwebtoken';


// PRIVATE and PUBLIC key
const privateKEY = fs.readFileSync('./keys/private.key', 'utf8');
const publicKEY = fs.readFileSync('./keys/public.key', 'utf8');

const router = express.Router();

const generateSalt = async () => {
      let randomBytes = Promise.promisify(crypto.randomBytes);
      let salt = await randomBytes(128).then(value => { return value.toString('base64') });
      return salt;
}
const generateHash = async (password, salt, iterations = 1000) => {

      const hashingData = {}
      let pbkdf2 = Promise.promisify(crypto.pbkdf2);
      const keylen = 512;
      const digest = 'sha256';
      let hashPassword = await pbkdf2(password, salt, iterations, keylen, digest).then(key => key.toString('hex'));

      hashingData['password'] = hashPassword;
      hashingData['salt'] = salt;
      hashingData['iterations'] = iterations;

      return hashingData;
}

const generateJWT = user => {


      let payload = {
            data1: 'DATA1',
            data2: 'DATA2'
      }
      const i = 'mature.bag';
      const s = user;
      const a = 'abc@gmail.com';

      let signingOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: '1h',
            algorithm: 'RS256'
      }

      let token = jwt.sign(payload, privateKEY, signingOptions);

      return token;

}
const verifyToken = async (token) => {
      const i = 'mature.bag';
      const s = "key id";
      const a = 'abc@gmail.com';

     let verifyOptions = {
            issuer: i,
            subject: s,
            audience: a,
            expiresIn: '1h',
            algorithm: ["RS256"]
      }

      let legit = jwt.verify(token, publicKEY, verifyOptions);

      console.log('legit: ', legit);
      return legit;

}

const userController = {
      register: async (req, res, next) => {

            const email = req.body.email;
            const password = req.body.password;
            const salt = await generateSalt();

            try {
                  const hashingData = await generateHash(password, salt);
                  console.log('hashingData: ' + JSON.stringify(hashingData));
                  userModel.create({ email: email, password: hashingData.password, salt: hashingData.salt, iterations: hashingData.iterations }, (err, resut) => {
                        if (err) next(err);
                        else res.json({ status: 'success', message: 'registered successfully', data: null })
                  })
            } catch (error) {
                  console.log(error);
            }


      },
      authenticate: async (req, res, next) => {
            const email = req.body.email;
            const password = req.body.password;

            userModel.findOne({ email: email }, async (err, result) => {
                  if (err) {
                        throw err;
                  }
                  else if (result == null) {
                        res.json({ status: 'failure', message: 'email is not registered' });
                  }
                  else {
                        //console.log('Result::', result);
                        const dbSalt = result.salt;
                        const dbIterations = result.iterations;
                        const dbHashedPassword = result.password;

                        try {
                              const hashingData = await generateHash(password, dbSalt, dbIterations);

                              if (hashingData.password == dbHashedPassword) {
                                    const token = generateJWT(email);
                                    res.json({ status: 'ok', message: 'Your password is correct', token: token });

                              } else {
                                    res.json({ status: 'failed', message: 'Password does not matches. Try again' });
                              }
                        } catch (error) {
                              console.log(error);
                        }

                  }
            })

      },

      authorization: async (req, res, next) => {
            //console.log('req.headers: ',req.headers);
            let tokenBearer =  req.headers["authorization"];
            
            let token = tokenBearer.replace('Bearer ','');
            //console.log('req Token :'+token);
            const message = { auth: 'failed', message: 'Access denied. Token has not provided' };

            if (!token) {
                  res.status(401).json(message);
            } else {
                  try {
                       let legit =  await verifyToken(token);
                       console.log('legit', legit);
                  } catch (error) {
                        
                        res.json({status: 'faild', error: error.name, message: error.message});
                  }
            }
      },
      
      chat: (req, res, next) => {
            console.log('chat req: ', req);
      },



}

//Routes and their handler functions
router.route('/register').post(userController.register);

router.route('/login').post(userController.authenticate);

router.route('/chat').post(userController.authorization,userController.chat);



module.exports = router;