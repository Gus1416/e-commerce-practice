import React, { useEffect, useState } from 'react'
import './Popular.css'
import Item from '../Item/Item'

const Popular = () => {

  const [data_product, setDataProduct] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/popularinwomen')
    .then(res => res.json())
    .then(data => setDataProduct(data))
  }, []);

  return (
    <div className="popular">
        <h1>POPULAR IN WOMEN</h1>
        <hr />
        <div className="popular-item">
            {data_product.map((item, index) => {
                return <Item key={index} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
            })}
        </div>
    </div>
  )
}

export default Popular