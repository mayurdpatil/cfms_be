const express = require('express');
const connection = require('../connection');
const router = express.Router();

let ejs = require('ejs');
let pdf = require('html-pdf');
let path = require('path');
var fs = require('fs');
var uuid = require('uuid');

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/generateReport', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    const productDetails = JSON.parse(orderDetails.product_details);

    var query = "INSERT INTO bill(name, uuid, email, contact_number, payment_method, total, product_details, created_by) values(?, ?, ?, ?, ?, ?, ?, ?)";
    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contact_number, orderDetails.payment_method, orderDetails.total, orderDetails.productDetails, res.locals.email], (err, results) => {
        if (!err) {
            ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
                productDetails: productDetails,
                name: orderDetails.name,
                email: orderDetails.email,
                contact_number: orderDetails.contact_number,
                payment_method: orderDetails.payment_method,
                total_amount: orderDetails.totalAmount
            }, (err, results) => {
                if (!err) {
                    pdf.create(results).toFile('./generated_pdf/' + generatedUuid + ".pdf", function (err, data) {
                        if (!err) {
                            return res.status(200).json({ uuid: generatedUuid });
                        }
                        else {
                            return res.status(500).json(err);
                        }
                    });
                }
                else {
                    return res.status(500).json(err);
                }
            });
        }
        else {
            return res.status(500).json(err);
        }
    });

})

router.post('/getPdf', auth.authenticateToken, function (req, res) {
    const orderDetails = req.body;
    const pdfPath = './generated_pdf/' + orderDetails.uuid + '.pdf';
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    }
    else {
        var productDetails = JSON.parse(orderDetails.product_details);
        ejs.renderFile(path.join(__dirname, '', "report.ejs"), {
            productDetails: productDetails,
            name: orderDetails.name,
            email: orderDetails.email,
            contact_number: orderDetails.contact_number,
            payment_method: orderDetails.payment_method,
            total_amount: orderDetails.totalAmount
        }, (err, results) => {
            if (!err) {
                pdf.create(results).toFile('./generated_pdf/' + orderDetails.uuid + ".pdf", function (err, data) {
                    if (!err) {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                    else {
                        return res.status(500).json(err);
                    }
                });
            }
            else {
                return res.status(500).json(err);
            }
        });
    }
})


router.get('/getBills', auth.authenticateToken, (req, res, next) => {
    var query = "SELECT * FROM bill ORDER BY id DESC";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results)
        }
        else {
            return res.status(500).json(err);
        }
    })
});

router.delete('/deleteBill/:id', auth.authenticateToken, (req, res) => {
    id = req.params.id;
    var query = "DELETE FROM bill WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows <= 0) {
                return res.status(404).json({ message: "Unable to find bill id record" });
            }
            else {
                return res.status(200).json({ message: "Bill record deleted successfully." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    });
});



module.exports = router;