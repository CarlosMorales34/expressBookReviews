const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const bookdb = require('./router/booksdb.js')

const app = express();

app.use(express.json());

app.use("/customer",session(
    {
        secret:"fingerprint_customer",
        resave: true, 
        saveUninitialized: true
    }
    ));

    app.use("/customer/auth/*", function auth(req, res, next) {
        const authorization = req.session.authorization;
    
        if (authorization && authorization.accessToken) {
            jwt.verify(authorization.accessToken, "access", (err, user) => {
                if (!err) {
                    req.user = user;  // Agrega la información del usuario al objeto de solicitud
                    next();  // Pasa al siguiente middleware o ruta
                } else {
                    return res.status(403).json({ message: "User not authenticated" });
                }
            });
        } else {
            return res.status(403).json({ message: "User not logged in" });
        }
    });
    
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}/`));

