import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { useState } from "react"
import OTPInput from "../components/OTPInput"

export default function Verify() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) return

    setLoading(true)

    try {
      const { data } = await axios.post("/api/user/verify-otp", {
        email: state.email,
        otp,
        type: state.type, // "login" or "register"
      })

      if (data.success) {
        localStorage.setItem("token", data.token)
        navigate("/")
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error(err)
      alert("OTP verification failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Verify Email OTP</h2>

      <OTPInput value={otp} onChange={setOtp} />

      <button
        onClick={handleVerify}
        disabled={loading || otp.length !== 6}
        style={{ marginTop: 16 }}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  )
}
