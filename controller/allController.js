const express = require("express");
const router = express.Router();
const UserService = require("../service/UserService");
const MovieService = require("../service/MovieService");
const MovieTicketService = require("../service/MovieTicketService");

router.post("/addUsers", async (req, res) => {
  const { email, name, date, password, username
  } = req.body
  let result = await UserService.addUsers({ email, name, date, password, username });

  if (!result?.success) {
    return res.status(400).json(result)
  }
  if (result) {
    return res.status(200).json(result)
  }

});

router.get("/getUser", async (req, res) => {
  let result = await UserService.getUser();
  if (!result?.success) {
    return res.status(400).json(result)
  }

  return res.status(200).json(result)

});


router.post("/addMovie", async (req, res) => {
  const { availability, date, movieName, showTime
  } = req.body
  let result = await MovieService.addMovie({
    availability, date, movieName, showTime
  });
  console.log('result', result)

  if (!result?.success) {
    return res.status(400).json(result)
  }
  return res.status(200).json(result)

});
router.get("/getMovie", async (req, res) => {
  let result = await MovieService.getMovie();
  res.send(result);
});

router.post("/book/:movieId/numberOfTickets", async (req, res) => {
  const { userId, numberOfTickets } = req.body
  const {movieId} = req.params
  let result = await MovieTicketService.bookTickets({userId, numberOfTickets, movieId});
  if (!result?.success) {
    return res.status(400).json(result)
  }
  return res.status(200).json(result)
});
module.exports = router;