module.exports = (err, req, res, _next) => {
  try {
    console.error("\n--- ERROR START ---");
    console.error("Time:", new Date().toISOString());
    console.error(err && (err.stack || err));
    if (req) {
      try {
        console.error("Request:", req.method, req.originalUrl);
        const body = req.body && Object.keys(req.body).length ? req.body : null;
        if (body) console.error("Body:", body);
      } catch (e) {
        // ignore
      }
    }
    console.error("--- ERROR END ---\n");
  } catch (e) {
    console.error("Failed to log error properly:", e && (e.stack || e));
  }

  const code = err && (err.statusCode || err.code) ? (err.statusCode || 500) : 500;
  res.status(code).json({ message: err && err.message ? err.message : "Server error" });
};
