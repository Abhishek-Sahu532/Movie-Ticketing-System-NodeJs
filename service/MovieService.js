const pool = require("../db");

exports.addMovie = async ({ availability, date, movieName, showTime
}) => {
    if (
        [date, movieName, showTime].some((field) => field?.trim() === "")) {
        return {
            success: false,
            message: "Invalid movie information. Please check your inputs."
        }
    }

    if (!availability) {
        return {
            success: false,
            message: "Invalid movie information. Please check your inputs."
        }
    }


    let incomingDate = new Date(date)
    let today = new Date()
    let diffInMilliSeconds = today.getTime() - incomingDate.getTime()
    let diffInDays = diffInMilliSeconds / (1000 * 60 * 60 * 24)

    if (Math.floor(diffInDays) < 0) {
        return {
            "success": false,
            "message": "Ensure the movie date is in the future, as current or past dates are not allowed for scheduling."
        }
    }


    try {

        return await new Promise((resolve, reject) => {
            const query = 'insert into movies ( availability, date, movie_name, show_time) values (?,?,?,?)'
            pool.query(query, [availability, date, movieName, showTime], (err, result) => {
                if (err) {
                    reject(err)
                }
                if (result.affectedRows) {
                    const movie_id = result.insertId
                    const queryForResult = 'select * from movies where movie_id = ?'
                    pool.query(queryForResult, movie_id, (err, result1) => {
                        if (result1.length > 0) {
                            return resolve({
                                success: true,
                                "movieId": result1[0].movie_id,
                                "movieName": result1[0].movie_name,
                                "showTime": result1[0].show_time,
                                "date": result1[0].date,
                                "availability": result1[0].availability
                            })
                        }
                    })
                }
            })
        })
    } catch (error) {
        return {
            success: false,
            message: error?.message
        }
    }
}
exports.getMovie = () => {

    try {

        const query = 'select * from movies'

        return new Promise((resolve, reject) => {
            pool.query(query, [], (err, result) => {
                if (err) {
                    return reject(err)
                }
                if (result.length > 0) {
                    return resolve(result)
                } else {
                    return {
                        success: false,
                        "message": "Movies not found"
                    }
                }
            })
        })
    } catch (error) {
        return {
            success: false,
            message: error?.message
        }
    }
};