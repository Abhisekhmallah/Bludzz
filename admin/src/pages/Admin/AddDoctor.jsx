import React, { useContext, useState } from "react"
import { assets } from "../../assets/assets"
import { toast } from "react-toastify"
import axios from "axios"
import { AdminContext } from "../../context/AdminContext"
import { AppContext } from "../../context/AppContext"

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [experience, setExperience] = useState("1 Year")
  const [fees, setFees] = useState("")
  const [about, setAbout] = useState("")
  const [speciality, setSpeciality] = useState("General physician")
  const [degree, setDegree] = useState("")
  const [address1, setAddress1] = useState("")
  const [address2, setAddress2] = useState("")
  const [phone, setPhone] = useState("")

  const [services, setServices] = useState([
    { name: "", description: "", fee: "" },
  ])

  const { backendUrl } = useContext(AppContext)
  const { aToken } = useContext(AdminContext)

  const addService = () => {
    setServices([...services, { name: "", description: "", fee: "" }])
  }

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const handleServiceChange = (index, field, value) => {
    const updated = [...services]
    updated[index][field] = value
    setServices(updated)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!docImg) {
      return toast.error("Doctor image is required")
    }

    try {
      const formData = new FormData()
      formData.append("image", docImg)
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("experience", experience)
      formData.append("fees", Number(fees))
      formData.append("about", about)
      formData.append("speciality", speciality)
      formData.append("degree", degree)
      formData.append(
        "address",
        JSON.stringify({ line1: address1, line2: address2 })
      )
      formData.append("services", JSON.stringify(services))
      formData.append("phone", phone)

      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-doctor`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`, // ✅ FIXED
          },
        }
      )

      if (data.success) {
        toast.success(data.message)

        // reset form
        setDocImg(false)
        setName("")
        setEmail("")
        setPassword("")
        setExperience("1 Year")
        setFees("")
        setAbout("")
        setSpeciality("General physician")
        setDegree("")
        setAddress1("")
        setAddress2("")
        setPhone("")
        setServices([{ name: "", description: "", fee: "" }])
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to add doctor")
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className="m-5 w-full">
      <p className="mb-3 text-lg font-medium">Add Doctor</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll">
        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              alt=""
            />
          </label>
          <input
            type="file"
            id="doc-img"
            hidden
            onChange={(e) => setDocImg(e.target.files[0])}
          />
          <p>
            Upload doctor <br /> picture
          </p>
        </div>

        {/* --- FORM CONTENT UNCHANGED --- */}

        <button
          type="submit"
          className="bg-primary px-10 py-3 mt-6 text-white rounded-full"
        >
          Add Doctor
        </button>
      </div>
    </form>
  )
}

export default AddDoctor
