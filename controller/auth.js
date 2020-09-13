const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const con = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
})

exports.login = async (req, res) => {

    try {
        
        const { email, password } = req.body;
        if ( !email || !password ) {
            return res.status(400).render('login', {
                message : 'Please provide an email and password'
            });
        }

        con.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {

            
            if( err ) {
                return res.status(400).render('login', {
                    message: 'Email or password ist incorrect'
                })
            }

            
            if( result.length == 0 || !( await bcrypt.compare(password, result[0].password))) {
                return res.status(401).render('login', {
                    message : 'Email or Password ist incorrect!'
                });
            } else {
                const id = result[0].id;

                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                //console.log("My Token : " +token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/");
            }
        });
    } catch (error) {
        return res.status(400).render('login', {
            message: 'Email or password ist incorrect'
        });
        
    }
}

exports.register = (req, res) => {
    
    const { vorname, nachname, email, password, passwordConfirm } = req.body;

    

    const query = 'SELECT * FROM users WHERE email = ?';
    con.query(query, [email], async (err, result) => {
        if(err) {
            throw err;
        }
        
        if( result.length > 0 ) {
            return res.render('register', {
                alert: 'That email is already in use!!!!'
            });
        } 
        else if ( password !== passwordConfirm ) {
            return res.render('register', {
                alert: 'Passwords don`t match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);

        con.query('INSERT INTO users SET ?', {vorname:vorname, nachname:nachname, email:email, password:hashedPassword}, (err, result) => {

            if(err) {
                throw err;
            } else {
                return res.render('register', {
                    message: 'User registered.'
                });
            }
    
            
        });
    });

    

    
    
}