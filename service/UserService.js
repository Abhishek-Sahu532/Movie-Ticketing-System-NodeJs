const pool = require("../db");

exports.addUsers = async ({ email, name, date, password, username }) => {
    try {
        if ([email, name, date, password, username].some((field) => field.trim() == '')) {
            return {
                success: false,
                message: 'User information is incomplete'
            };
        }

        const regexForNoNumber = /^\D*$/;
        if (name.length < 4 || !regexForNoNumber.test(name)) {
            return {
                success: false,
                message: 'Name should have a minimum length of 4 characters and must not contain any digits'
            };
        }

        if (username.length < 5) {
            return {
                success: false,
                message: 'Username must have a minimum length of 5 characters'
            };
        }

        const regexForMail = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if (!regexForMail.test(email)) {
            return {
                success: false,
                message: 'The email provided is not valid.'
            };
        }

        const passwordRegex = /^(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return {
                success: false,
                "message": "The password should be greater than or equal to 8 characters and must contain at least one digit."
            };
        }

        // Check if email is already in use
        const queryForExistingUserByEmail = 'SELECT * FROM my_users WHERE email = ?';
        const existingUserByEmail = await new Promise((resolve, reject) => {
            pool.query(queryForExistingUserByEmail, email, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (existingUserByEmail.length > 0) {
            return {
                success: false,
                "message": "Email already used by another user."
            };
        }

        // Check if email is already in use
        const queryForExistingUserByUsername = 'SELECT * FROM my_users WHERE username = ?';
        const existingUserByUsername = await new Promise((resolve, reject) => {
            pool.query(queryForExistingUserByUsername, username, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (existingUserByUsername.length > 0) {
            return {
                success: false,
                "message": "Username already taken. Please choose another username."
            };
        }



        // Insert new user
        const queryForCreatingUser = 'INSERT INTO my_users (date, email, name, password, username) VALUES (?, ?, ?, ?, ?)';
        let createdUser = await new Promise((resolve, reject) => {
            pool.query(queryForCreatingUser, [date, email, name, password, username], (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });

        if (createdUser.affectedRows > 0) {
            // Retrieve the newly inserted user data using the insertId
            const user_id = createdUser.insertId;
            const queryForNewUser = 'SELECT user_id, name, username, email, date FROM my_users WHERE user_id = ?';

            const newUser = await new Promise((resolve, reject) => {
                pool.query(queryForNewUser, [user_id], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            if (newUser.length > 0) {
                return {
                    success: true,
                    userId: newUser[0].user_id,
                    name: newUser[0].name,
                    username: newUser[0].username,
                    email: newUser[0].email,
                    date: newUser[0].date,
                };
            }
        }
    } catch (error) {
        return {
            success: false,
            message: 'Error while processing the request: ' + error.message
        };
    }
};





exports.getUser = async () => {
    try {
        const query = 'select user_id, date, email, name, username from my_users';

        return new Promise((resolve, reject) => {
            pool.query(query, [], (err, result) => {
                if (err) {
                    return reject({
                        success: false,
                        message: err.message,
                    });
                }
                if (result.length === 0) {
                    return resolve({
                        success: false,
                        message: "Users not found",
                    });
                }
                return resolve(result);
            });
        });
    } catch (error) {
        return {
            success: false,
            message: error?.message,
        };
    }
};
