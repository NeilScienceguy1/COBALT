const express = require("express")
const router = express.Router()

const {identify} = require("../controllers/command.controller")

router.post("/identify", identify)

module.exports = router