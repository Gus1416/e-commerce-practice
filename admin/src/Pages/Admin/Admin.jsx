import React from 'react'
import './Admin.css'
import Sidebar from '../../Components/Sidebar/Sidebar'
import { Routes, Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProducts from '../../Components/ListProducts/ListProducts'

const Admin = () => {
  return (
    <div className="admin">
        <Sidebar />
        <Routes>
          <Route path='/addproduct' element={<AddProduct/>} />
          <Route path='/listproduct' element={<ListProducts/>} />
        </Routes>
    </div>
  )
}

export default Admin