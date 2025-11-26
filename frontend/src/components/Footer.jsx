import React from 'react'
import { assets } from '../assets/assets'
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        {/* Brand + Description */}
        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>
            At Bludz, we’re redefining healthcare by bringing high-quality lab testing right to your doorstep. 
            Our platform enables users to book lab tests and full-body health checkups from the comfort of their home 
            — no waiting rooms, no hassle.
          </p>
        </div>

        {/* Company Section */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-gray-600'>

            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About us</Link></li>

            {/* ⭐ NEW → Register as Doctor */}
            <li>
              <Link 
                to="/register-doctor" 
                className="text-primary font-medium hover:underline"
              >
                Register as Doctor
              </Link>
            </li>

            <li>Delivery</li>
            <li>Privacy policy</li>

          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li>+91 7894456123</li>
            <li>helpblood24@gmail.com</li>

            {/* Optional: Contact Page Link */}
            <li>
              <Link to="/contact" className="text-blue-600 hover:underline">
                Contact Page
              </Link>
            </li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>
          Copyright 2025 @bludz - All Right Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer
