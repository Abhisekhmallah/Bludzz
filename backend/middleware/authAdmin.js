import jwt from "jsonwebtoken"

// Admin authentication middleware (PRODUCTION STANDARD)
const authAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    // 1️⃣ Token missing or malformed
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      })
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1]

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 4️⃣ Optional: sanity check role or email (if you embed it later)
    // For now, just trust the JWT
    req.body.adminId = decoded.id

    next()
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error.message)
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    })
  }
}

export default authAdmin
