const allowedOrigins = [
  "https://ushi-xrzb.vercel.app", // Vercel frontend
  "http://localhost:3000",        // Khi chạy local dev
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow mobile apps / Postman (origin = undefined)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,              // Cho phép cookie/token
  optionsSuccessStatus: 200,      // Cho legacy browsers
};

module.exports = { corsOptions };
