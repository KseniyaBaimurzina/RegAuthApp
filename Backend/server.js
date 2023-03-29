import express from 'express';
import cors from "cors";
import date from 'date-and-time';
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import * as dotenv from 'dotenv';
import connection from "./database.js";

const config = dotenv.config(".env").parsed;
var corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3000/"],
    methods: ['GET', 'PUT', 'POST', "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200
}
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions))
app.use(express.json());
app.use(cookieParser());
const urlencodedParser = express.urlencoded({ extended: false });

function GetExistedUsers() {
    return new Promise(function(resolve, reject) {
        var sqlQuery = "SELECT id, name, email, reg_date, last_login_date, status FROM users;";
        connection.query(sqlQuery, function(err, rows) {
            if (err) reject(new Error("Failed to get users from DB"))
            else resolve(rows);
        });
    })
}

function CreateUser(user) {
    var newUser = {
        name: user.name,
        email: user.email,
        password: GetHashedPassword(user.password),
        reg_date: date.format(new Date(), "YYYY/MM/DD"),
        last_login_date: date.format(new Date(), "YYYY/MM/DD"),
        status: "active"
    };
    let userKeys = Object.keys(newUser);
    let userValues = '"' + Object.values(newUser).join('", "') + '"';
    connection.query(`INSERT INTO users (${userKeys}) VALUES (${userValues});`,
        function(err, res, fields) {
            if (err) {
                return false;
            } else { return true; }
        });
    return true;
}

function AuthenticateUser(email, password) {
    if (!email || !password) return Promise.reject(new Error("Fields cannot be empty"));
    return new Promise(function(resolve, reject) {
        connection.query(`SELECT * FROM users WHERE email = '${email}';`, function(err, res, fields) {
            if (err) reject(new Error("Failed to get user from DB"));
            else if (res.length != 0) {
                if (VerifyPassword(password, res[0].password)) {
                    if (res[0].status != 'blocked') {
                        resolve(true);
                    } else {
                        reject({ status: 403, message: "Access forbidden" })
                    }
                } else {
                    reject({ status: 401, message: "Unauthorized" });
                }
            } else reject(new Error("User not found"));
        })
    })
}

function AuthorizeUser(access_token) {
    if (!access_token) {
        return Promise.resolve(false);
    }
    try {
        var test = jwt.verify(access_token, config["SECRET_JWT_KEY"]);
        if (test) {
            return new Promise(function(resolve, reject) {
                var sqlQuery = `SELECT * FROM users WHERE email = '${test.email}'`;
                connection.query(sqlQuery, function(error, results, fields) {
                    if (error) {
                        reject(false);
                    } else {
                        if (results.length > 0 && results[0].status === "active") {
                            resolve(true);
                        } else {
                            reject(false);
                        }
                    }
                });
            });
        }
    } catch {
        return Promise.resolve(false);
    }
}

function GenerateJWT(email) {
    return jwt.sign({ email: email }, config["SECRET_JWT_KEY"], { expiresIn: '18000s' });
}

function GetHashedPassword(password) {
    var key = config["SECRET_KEY"];
    var hmac = crypto.createHmac('sha256', key);
    var hashedPassword = hmac.update(password).digest('hex');
    return hashedPassword;
}

function VerifyPassword(plainPassword, hashedPassword) {
    return GetHashedPassword(plainPassword) == hashedPassword;
}

app.post('/registration', cors(corsOptions), urlencodedParser, function(req, res) {
    if (Object.keys(req.body).length === 0) {
        res.status(400)
        res.send("Fields cannot be empty")
        return
    }
    connection.query(`SELECT * FROM users WHERE email=${req.body.email};`,
        function(err, existed, fields) {
            if (err) {
                var result = CreateUser(req.body);
                if (result) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            }
            if (existed) {
                res.sendStatus(500);
            }
        });
})

app.post("/login", cors(corsOptions), urlencodedParser, function(req, res) {
    if (Object.keys(req.body).length === 0) {
        res.status(400);
        res.send("Fields cannot be empty");
        return;
    }
    AuthenticateUser(req.body.email, req.body.password)
        .then(auth => {
            let email = '"' + req.body.email + '"';
            let logDate = date.format(new Date(), "YYYY/MM/DD")
            connection.query(`UPDATE users SET last_login_date = '${logDate}' WHERE email = ${email};`,
                function(err) {
                    if (err) throw new Error(err);
                });
            var token = GenerateJWT(req.body.email);
            res.cookie("access_token", token);
            res.send({ "access_token": token, "token_type": "bearer" })
            return;
        }).catch(err => {
            if (err.status === 403) {
                res.status(403);
                res.send(err.message);
                return;
            }
            res.status(401);
            res.send("Incorrect email or password. Please try again");
            return;
        })
})

app.get("/users", cors(corsOptions), function(req, res) {
    AuthorizeUser(req.cookies.access_token)
        .then(function(result) {
            GetExistedUsers()
                .then(function(result) {
                    res.send(result)
                })
                .catch(function(err) {
                    res.sendStatus(500)
                })
        })
        .catch(function(error) {
            return res.sendStatus(401)
        });
})

app.put("/users", cors(corsOptions), function(req, res) {
    var auth = AuthorizeUser(req.cookies.access_token);
    if (!auth) {
        return res.sendStatus(401)
    }
    let status = req.body["data"][0]
    for (let userEmail of req.body["data"][1]) {
        userEmail = '"' + userEmail + '"';
        connection.query(`UPDATE users SET status = '${status}' WHERE email = ${userEmail};`,
            function(err) {
                if (err) throw new Error(err);
            });
    }
    return res.status(200)
})

app.delete("/users", cors(corsOptions), function(req, res) {
    var auth = AuthorizeUser(req.cookies.access_token);
    if (!auth) {
        return res.sendStatus(401)
    }
    for (let userEmail of req.body) {
        userEmail = '"' + userEmail + '"';
        connection.query(`DELETE FROM users WHERE email = ${userEmail};`,
            function(err) {
                if (err) throw new Error(err);
            });
    }
    return res.status(200);
})

app.listen(config["PORT"], () => {
    console.log(`Example app listening on port ${config["PORT"]}`)
})