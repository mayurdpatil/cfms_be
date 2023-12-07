const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res) => {
    let user = req.body;

    query = "select email, password, role, status from user WHERE email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "INSERT INTO user (name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "User registered successfully." });
                    }
                    else {
                        return res.status(500).json({ message: "Unable to process record" + err });
                    }
                });
            }
            else {
                return res.status(400).json("User already exists.");
            }
        }
        else {

            return res.status(500).json(err);
        }
    });
});


router.post('/login', (req, res) => {
    const user = req.body;
    query = "SELECT email, password, role, status FROM user WHERE email=?";

    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                res.status(401).json({ message: "Incorrect username or password" });
            }
            else if (results[0].status == 'false') {
                res.status(401).json({ message: "Please contact your admin for approval" });
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' });
                res.status(200).json({ token: accessToken });
            }
            else {
                res.status(400).json({ message: "Something went wrong, Please try again later." });
            }
        }
        else {
            res.status(500).json(err);
        }
    });
})

var transporter = nodemailer.createTransport({
    server: 'gmail',
    auth: {
        user: process.env.MAILING_EMAIL,
        pass: process.env.MAILING_PASSWORD
    }
});

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    query = "SELECT email, password FROM user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                console.log("no user found");
                return res.status(200).json({ message: "Password sent successfully to your email." });
            }
            else {
                //ucut ntzu dxmu ubgk
                const mailOptions = {
                    from: process.env.MAILING_EMAIL,
                    html: "<p>Your login details for CFMS is follows<br/><b>Username:</b>" + results[0].email
                        + "<br/><b>Password:</b>" + results[0].password + "</p>",
                    //to: results[0].email,
                    to: 'mayur@gmail.com',
                    subject: "Forgot Password",
                    context: {
                        name: "mail from mayur",
                        company: 'KARN'
                    },
                };
                try {
                    console.log("Email sent successfully");
                    transporter.sendMail(mailOptions);
                } catch (error) {
                    console.log('Nodemailer error sending email to', error);
                }
                return res.status(200).json({ message: "Password sent successfully to your email." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    });
});


router.get('/getUsers', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "SELECT id, name, email, contactNumber, status from user where role='user'"
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.patch('/updateStatus', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "UPDATE user SET status=? WHERE id=?"
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ messsage: "User id does not exists" });
            }
            return res.status(200).json({ message: "User updated successfully" });
        }
        else {
            return res.status(500).json(err);
        }
    })
})

router.get('/checkToken', (req, res) => {
    return res.status(200).json({ message: "true" });
})

router.post('/changePassword', auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "SELECT * FROM user WHERE email=? AND password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {

        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect Old password" });
            }
            else if (results[0].password == user.oldPassword) {
                query = "UPDATE user SET password=? WHERE email=?"
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password updated successfully" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Something went wrong, Please try again later." })
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;