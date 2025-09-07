// Vercel serverless entry that forwards any /api/* route to our Express app
// Ensure MongoDB is connected on cold start before handling requests.
const { connectDB } = require('../src/config/database');
const app = require('../src/app');

let dbReady = global.__EK_DB_READY__;
if (!dbReady) {
	try {
		const p = connectDB();
		// If connectDB threw synchronously (e.g., missing MONGODB_URI), fall back to a resolved promise
		dbReady = p && typeof p.then === 'function' ? p.catch((e) => {
			console.error('DB connect error on cold start:', e?.message || e);
		}) : Promise.resolve();
	} catch (e) {
		console.error('DB connect threw synchronously:', e?.message || e);
		dbReady = Promise.resolve();
	}
	global.__EK_DB_READY__ = dbReady;
}

module.exports = async (req, res) => {
	// Skip DB wait for health check to avoid coupling uptime to DB
	const url = req.url || '';
	if (!url.startsWith('/api/health')) {
		try { await dbReady; } catch (_) {}
	}
	return app(req, res);
};
