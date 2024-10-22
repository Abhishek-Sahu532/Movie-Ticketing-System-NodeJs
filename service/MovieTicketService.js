const pool = require("../db");

exports.bookTickets = async ({ userId, numberOfTickets, movieId }) => {

    try {
       return await new Promise((resolve, reject) => {
            //check for registrer user
            const queryForUser = 'select * from my_users where user_id = ?'

            pool.query(queryForUser, userId, (err, result) => {
                if (err) {
                    return reject(err)
                }
                if (result.length == 0) {
                    return reject({
                        "success": false,
                        "message": "User not found"
                    })
                }
            })
            //check for movieID
            const queryForMovieId = 'select * from movies where movie_id = ?'
            pool.query(queryForMovieId, movieId, (err, result) => {
                if (err) {
                    return reject(err)
                }
                if (result.length == 0) {
                    return reject({
                        "success": false,
                        "message": "Tickets failed to book. Movie not found."
                    })
                }

                //check the availibility
                if (result[0]?.availability < numberOfTickets) {
                    return reject({
                        "success": false,
                        "message": "Tickets failed to book. Number of tickets exceeds the maximum limit."
                    })
                }

                let balancedTickets = result[0]?.availability - numberOfTickets

                if (balancedTickets < 0) {
                    return reject({
                        "success": false,
                        "message": "Tickets are not available in request numbers, Please try less number"
                    })

                }
                const updateTheMoviesTable = 'update movies set availability = ? where movie_id = ? '
                pool.query(updateTheMoviesTable, [balancedTickets, movieId], (err, result) => {
                    if (err) {
                        return reject(err)
                    }
                    if (result.affectedRows > 0) {
                        const queryForInsertMovieTicket = 'insert into movie_ticket (movie_id, number_of_tickets, user_id) values (?,?,?)'
                        pool.query(queryForInsertMovieTicket, [movieId, numberOfTickets, userId], (err, result) => {
                            if (err) {
                                return reject(err)
                            }
                            if (result.affectedRows > 0) {
                                const queryForFinalResult = 'select * from movie_ticket where movie_ticket_id = ?'
                                const insertId = result.insertId
                                pool.query(queryForFinalResult, insertId, (err, result) => {
                                    if (err) {
                                        return reject(err)
                                    }
                                    return resolve({
                                        success: true,
                                        "movieTicketId": result[0].movie_ticket_id,
                                        "userId": result[0].user_id,
                                        "movieId": result[0].movie_id,
                                        "numberOfTickets": result[0].number_of_tickets
                                    })
                                })
                            }
                        })
                    }
                })
            })
        })
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }


};

