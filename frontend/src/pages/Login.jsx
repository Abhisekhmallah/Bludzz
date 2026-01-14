import { useContext, useEffect, useState } from "react"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const [state, setState] = useState("Sign Up")
  const [showOTP, setShowOTP] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [currentEmail, setCurrentEmail] = useState("")
  const [currentType, setCurrentType] = useState("")
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const navigate = useNavigate()
  const { backendUrl, token, setToken } = useContext(AppContext)

  // ---------------- SEND OTP ----------------
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/send-otp`,
        {
          name,
          email,
          password,
          type: state === "Sign Up" ? "register" : "login",
        }
      )

      if (!data.success) {
        toast.error(data.message)
        return
      }

      toast.success("OTP sent to your email")
      setCurrentEmail(email)
      setCurrentType(state === "Sign Up" ? "register" : "login")
      setShowOTP(true)
      setTimer(60)
      setCanResend(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------- VERIFY OTP ----------------
  const handleOTPVerification = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/verify-otp`,
        {
          email: currentEmail,
          otp,
          type: currentType,
        }
      )

      if (!data.success) {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      localStorage.setItem("token", data.token)
      setToken(data.token)
      navigate("/")
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed")
    } finally {
      setIsLoading(false)
    }
  }

  // ---------------- RESEND OTP ----------------
  const handleResendOTP = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/resend-otp`,
        { email: currentEmail }
      )

      if (data.success) {
        toast.success(data.message)
        setTimer(60)
        setCanResend(false)
        setOtp("")
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error("Failed to resend OTP")
    }
  }

  useEffect(() => {
    if (showOTP && timer > 0) {
      const id = setInterval(() => setTimer((t) => t - 1), 1000)
      return () => clearInterval(id)
    }
    if (timer === 0) setCanResend(true)
  }, [timer, showOTP])

  useEffect(() => {
    if (token) navigate("/")
  }, [token])

  if (showOTP) {
    return (
      <div className="min-h-screen flex justify-center pt-6 px-4 bg-[#f4f4ff]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-center">Verify Email</h2>

          <form onSubmit={handleOTPVerification}>
            <input
              className="w-full p-3 border rounded-xl text-center text-xl mt-4"
              maxLength="6"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <button
              className="w-full mt-4 py-3 bg-[#6b63ff] text-white rounded-xl"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="text-center mt-4">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                className="text-[#6b63ff] underline"
              >
                Resend OTP
              </button>
            ) : (
              <p>{timer}s</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center pt-6 px-4 bg-[#f4f4ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <input
              className="w-full mb-4 p-3 border rounded-xl"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full mb-4 p-3 border rounded-xl"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="w-full mb-4 p-3 border rounded-xl"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            className="w-full py-3 bg-[#6b63ff] text-white rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center mt-4">
          {state === "Sign Up" ? (
            <>
              Already have an account?
              <span
                className="ml-1 text-[#6b63ff] underline cursor-pointer"
                onClick={() => setState("Login")}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?
              <span
                className="ml-1 text-[#6b63ff] underline cursor-pointer"
                onClick={() => setState("Sign Up")}
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default Login
