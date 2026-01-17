import jwt from "jsonwebtoken"

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.body.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid token",
    })
  }
}

export default authUser
