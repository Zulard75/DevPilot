import express from "express";
import v1Routes from "./v1/index.js";

const router = express.Router();

router.get("/", (req, res) => {
	res.json({
		service: "DevPilot API",
		health: "/api/v1/health"
	});
});

router.get("/health", (req, res) => {
	res.json({ status: "ok", service: "api" });
});

router.get("/test", (req, res) => {
	res.json({ message: "TEST ROUTE WORKING" });
});

router.use("/api/v1", v1Routes);

export default router;