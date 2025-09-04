const router =require("express").Router()

router.use("/user",require("./user"))
router.use("/opengds",require("./Dataset"))


module.exports = router;