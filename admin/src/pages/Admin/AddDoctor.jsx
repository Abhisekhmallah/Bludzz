import React, { useContext, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { AdminContext } from "../../context/AdminContext"
import { AppContext } from "../../context/AppContext"
import { assets } from "../../assets/assets"

const AddDoctor = () => {
  const { backendUrl } = useContext(AppContext)
  const { aToken } = useContext(AdminContext)

  const [docImg, setDocImg] = useState(null)

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

  /* ---------------- SERVICES ---------------- */

  const addService = () => {
    setServices([...services, { name: "", description: "", fee: "" }])
  }

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const updateService = (index, field, value) => {
    const updated = [...services]
    updated[index][field] = value
    setServices(updated)
  }

  /* ---------------- SUBMIT ---------------- */

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!docImg) return toast.error("Doctor image required")
    if (!name || !email || !password || !fees || !degree || !address1) {
      return toast.error("Please fill all required fields")
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
            Authorization: `Bearer ${aToken}`,
          },
        }
      )

      if (data.success) {
        toast.success(data.message)

        // reset
        setDocImg(null)
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

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={onSubmitHandler} className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add Doctor</h1>

      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-8">

        {/* IMAGE */}
        <div className="flex items-center gap-5">
          <label htmlFor="doc-img" className="cursor-pointer">
            <img
              src={docImg ? URL.createObjectURL(docImg) : assets.upload_area}
              className="w-20 h-20 rounded-full border object-cover"
              alt=""
            />
          </label>
          <input
            id="doc-img"
            type="file"
            hidden
            onChange={(e) => setDocImg(e.target.files[0])}
          />
          <div>
            <p className="font-medium">Doctor photo</p>
            <p className="text-sm text-gray-500">JPG / PNG</p>
          </div>
        </div>

        {/* BASIC INFO */}
        <section>
          <h2 className="font-semibold mb-3">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (+91…)" />
          </div>
        </section>

        {/* PROFESSIONAL */}
        <section>
          <h2 className="font-semibold mb-3">Professional Details</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <select className="input" value={speciality} onChange={e => setSpeciality(e.target.value)}>
              <option>General physician</option>
              <option>Gynecologist</option>
              <option>Dermatologist</option>
              <option>Neurologist</option>
              <option>Gastroenterologist</option>
            </select>

            <input className="input" value={degree} onChange={e => setDegree(e.target.value)} placeholder="Degree" />
            <select className="input" value={experience} onChange={e => setExperience(e.target.value)}>
              <option>1 Year</option>
              <option>2 Years</option>
              <option>3 Years</option>
              <option>5 Years</option>
              <option>10 Years</option>
            </select>

            <input className="input md:col-span-3" type="number" value={fees} onChange={e => setFees(e.target.value)} placeholder="Consultation fee (₹)" />
          </div>
        </section>

        {/* ABOUT */}
        <section>
          <h2 className="font-semibold mb-3">About Doctor</h2>
          <textarea className="input h-28" value={about} onChange={e => setAbout(e.target.value)} />
        </section>

        {/* ADDRESS */}
        <section>
          <h2 className="font-semibold mb-3">Clinic Address</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input" value={address1} onChange={e => setAddress1(e.target.value)} placeholder="Address line 1" />
            <input className="input" value={address2} onChange={e => setAddress2(e.target.value)} placeholder="Address line 2" />
          </div>
        </section>

        {/* SERVICES */}
        <section>
          <h2 className="font-semibold mb-3">Services</h2>

          {services.map((s, i) => (
            <div key={i} className="border rounded-xl p-4 mb-3 bg-gray-50">
              <div className="grid md:grid-cols-3 gap-3">
                <input className="input" placeholder="Service name" value={s.name} onChange={e => updateService(i, "name", e.target.value)} />
                <input className="input" type="number" placeholder="Fee" value={s.fee} onChange={e => updateService(i, "fee", e.target.value)} />
                <textarea className="input md:col-span-3" placeholder="Description" value={s.description} onChange={e => updateService(i, "description", e.target.value)} />
              </div>

              {services.length > 1 && (
                <button type="button" onClick={() => removeService(i)} className="text-red-500 text-sm mt-2">
                  Remove service
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addService} className="text-primary font-medium">
            + Add another service
          </button>
        </section>

        <button type="submit" className="bg-primary text-white px-10 py-3 rounded-full text-lg">
          Add Doctor
        </button>
      </div>
    </form>
  )
}

export default AddDoctor
