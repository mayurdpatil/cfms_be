const express = require('express');
const connection = require('../connection');
const router = express.Router();
 

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');


router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) =>{

    let product = req.body;
    var query = "INSERT INTO product(name, category_id, description, price, status) values (?, ?, ?, ?, 'true')";

    connection.query(query, [product.name, product.category_id, product.description, product.price], (err, results) => {
        if(!err)
        {
            return res.status(200).json({message: "Product added successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    })
});

router.get('/get', auth.authenticateToken, (req, res) => {
    var query = "SELECT p.id, p.name, p.description, p.price, p.status, c.id as cat_id, c.name as cat_name " + 
    " FROM product as p INNER JOIN category as c ON p.category_id = c.id ORDER BY p.name DESC";
    connection.query(query, (err, results) =>{
        if(!err)
        {
            return res.status(200).json(results);
        }
        else{
            return res.status(500).json(err);
        }
    })
});

router.get('/getByCategoryId/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    var query = "SELECT id, name FROM product WHERE category_id=? AND status='true'";
    connection.query(query, [id], (err, results) => {
        if(!err)
        {
            return res.status(200).json(results);
        }
        else
        {
            return res.status(500).json(err);
        }
    })
})

router.get('/getById/:id', auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;
    var query = "SELECT id, name, description, price FROM product WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if(!err)
        {
            return res.status(200).json(results[0]);
        }
        else{
            return res.status(500).json(err);
        }
    })
})


router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res, next) =>{
    let product = req.body;
    var query = "UPDATE product SET name=?, category_id=?, description=?, price=? WHERE id=?";
    connection.query(query, [product.name, product.category_id, product.description, product.price, product.id], (err, results) => {
        if(!err)
        {
            if(results.affectedRows == 0)
            {
                return res.status(404).json({message: "Product id does not found"});
            }
            else{
                return res.status(200).json({message: "Product updated successfully"});
            }
        }
        else
        {
            return res.status(500).json(err);
        }
    });
});

router.delete('/delete/:id', auth.authenticateToken, checkRole.checkRole, (req, res, next) => {
    const id = req.params.id;

    query = "DELETE FROM product WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if(!err)
        {
            if(res.affectedRows == 0)
            {
                return res.status(404).json({message: "Product id does not found"});
            }
            return res.status(200).json({message: "Product deleted successfully"});
        }
        else{
            return res.status(500).json(err);
        }
    });
})

router.patch('/updateStatus/', auth.authenticateToken, checkRole.checkRole, (req, res, next) =>{
    let product = req.body;
    var query = "UPDATE product SET status=? WHERE id=?";
    connection.query(query, [product.status, product.id], (err, results) => {
        if(!err)
        {
            if(results.affectedRows == 0)
            {
                return res.status(404).json({message: "Product id does not found"});
            }
            else{
                return res.status(200).json({message: "Product updated successfully"});
            }
        }
        else
        {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;