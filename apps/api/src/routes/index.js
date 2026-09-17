import express from "express";
import v1Routes from "./v1/index.js";

const router = express.Router();

router.get("/test", (req, res) => {
	res.json({ message: "TEST ROUTE WORKING" });
});

router.use("/api/v1", v1Routes);

export default router;