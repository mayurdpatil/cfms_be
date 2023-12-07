const express = require('express');
const connection = require('../connection');
const router = express.Router();

var auth = require('../services/authentication');

router.get('/details', auth.authenticateToken, (req, res, next) => {
    var categoryCount;
    var productCount;
    var billingCount;
    var query = "SELECT count(id) as categoryCount FROM category";
    connection.query(query, (err, results) => {
        if(!err)
        {
            categoryCount = results[0].categoryCount;
        }
        else
            return res.status(500).json(err);
    });

    var query = "SELECT count(id) as productCount FROM product";
    connection.query(query, (err, results) => {
        if(!err)
        {
            productCount = results[0].productCount;
        }
        else
            return res.status(500).json(err);
    });

    var query = "SELECT count(id) as billingCount FROM bill";
    connection.query(query, (err, results) => {
        if(!err)
        {
            var data = {
                category: categoryCount,
                product: productCount,
                bill: results[0].billingCount
            };
            return res.status(200).json(data);
        }
        else
            return res.status(500).json(err);
    });
});

module.exports = router;
