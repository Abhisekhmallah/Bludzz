import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddDoctor = () => {

    const [docImg, setDocImg] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [experience, setExperience] = useState('1 Year')
    const [fees, setFees] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('General physician')
    const [degree, setDegree] = useState('')
    const [address1, setAddress1] = useState('')
    const [address2, setAddress2] = useState('')

    // ✅ New: Doctor Services (dynamic list)
    const [services, setServices] = useState([{ name: '', description: '', fee: '' }])

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    // ✅ Add new service row
    const addService = () => {
        setServices([...services, { name: '', description: '', fee: '' }])
    }

    // ✅ Remove a service row
    const removeService = (index) => {
        const updated = services.filter((_, i) => i !== index)
        setServices(updated)
    }

    // ✅ Handle input changes for service fields
    const handleServiceChange = (index, field, value) => {
        const newServices = [...services]
        newServices[index][field] = value
        setServices(newServices)
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (!docImg) {
                return toast.error('Image Not Selected')
            }

            const formData = new FormData();

            formData.append('image', docImg)
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            formData.append('experience', experience)
            formData.append('fees', Number(fees))
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('degree', degree)
            formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))

            // ✅ Append services to backend
            formData.append('services', JSON.stringify(services))

            // Debug log
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });

            const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                // Reset form
                setDocImg(false)
                setName('')
                setPassword('')
                setEmail('')
                setAddress1('')
                setAddress2('')
                setDegree('')
                setAbout('')
                setFees('')
                setServices([{ name: '', description: '', fee: '' }])
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-full'>
            <p className='mb-3 text-lg font-medium'>Add Doctor</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                {/* Upload Image */}
                <div className='flex items-center gap-4 mb-8 text-gray-500'>
                    <label htmlFor="doc-img">
                        <img className='w-16 bg-gray-100 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
                    </label>
                    <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id="doc-img" hidden />
                    <p>Upload doctor <br /> picture</p>
                </div>

                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    {/* Left column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Your name</p>
                            <input onChange={e => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Doctor Email</p>
                            <input onChange={e => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Set Password</p>
                            <input onChange={e => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='Password' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Experience</p>
                            <select onChange={e => setExperience(e.target.value)} value={experience} className='border rounded px-2 py-2'>
                                <option value="1 Year">1 Year</option>
                                <option value="2 Years">2 Years</option>
                                <option value="3 Years">3 Years</option>
                                <option value="4 Years">4 Years</option>
                                <option value="5 Years">5 Years</option>
                                <option value="6 Years">6 Years</option>
                                <option value="8 Years">8 Years</option>
                                <option value="9 Years">9 Years</option>
                                <option value="10 Years">10 Years</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Fees</p>
                            <input onChange={e => setFees(e.target.value)} value={fees} className='border rounded px-3 py-2' type="number" placeholder='Doctor fees' required />
                        </div>
                    </div>

                    {/* Right column */}
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select onChange={e => setSpeciality(e.target.value)} value={speciality} className='border rounded px-2 py-2'>
                                <option value="General physician">General physician</option>
                                <option value="Gynecologist">Gynecologist</option>
                                <option value="Dermatologist">Dermatologist</option>
                                <option value="Pediatricians">Pediatricians</option>
                                <option value="Neurologist">Neurologist</option>
                                <option value="Gastroenterologist">Gastroenterologist</option>
                            </select>
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Degree</p>
                            <input onChange={e => setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='Degree' required />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Address</p>
                            <input onChange={e => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='Address 1' required />
                            <input onChange={e => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='Address 2' required />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div>
                    <p className='mt-4 mb-2'>About Doctor</p>
                    <textarea onChange={e => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' rows={5} placeholder='Write about doctor'></textarea>
                </div>

                {/* ✅ New Doctor Services Section */}
                <div className='mt-6'>
                    <p className='text-lg font-medium mb-3'>Doctor Services</p>

                    {services.map((service, index) => (
                        <div key={index} className='border rounded-lg p-4 mb-3 bg-gray-50'>
                            <div className='flex flex-col sm:flex-row gap-3'>
                                <input
                                    type='text'
                                    placeholder='Service Name'
                                    className='border rounded px-3 py-2 flex-1'
                                    value={service.name}
                                    onChange={e => handleServiceChange(index, 'name', e.target.value)}
                                    required
                                />
                                <input
                                    type='number'
                                    placeholder='Fee'
                                    className='border rounded px-3 py-2 w-40'
                                    value={service.fee}
                                    onChange={e => handleServiceChange(index, 'fee', e.target.value)}
                                />
                            </div>
                            <textarea
                                placeholder='Description'
                                className='border rounded px-3 py-2 mt-2 w-full'
                                value={service.description}
                                onChange={e => handleServiceChange(index, 'description', e.target.value)}
                            ></textarea>

                            {services.length > 1 && (
                                <button
                                    type='button'
                                    onClick={() => removeService(index)}
                                    className='text-red-500 text-sm mt-2'
                                >
                                    Remove Service
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type='button'
                        onClick={addService}
                        className='bg-blue-100 text-blue-700 px-3 py-1 rounded'
                    >
                        + Add Another Service
                    </button>
                </div>

                {/* Submit Button */}
                <button type='submit' className='bg-primary px-10 py-3 mt-6 text-white rounded-full'>
                    Add Doctor
                </button>
            </div>
        </form>
    )
}

export default AddDoctor
