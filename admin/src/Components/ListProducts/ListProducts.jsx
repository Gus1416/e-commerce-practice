import React, { useEffect, useState } from "react";
import "./ListProducts.css";
import cross_icon from "../../assets/cross_icon.png";

const ListProducts = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allproducts")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    await fetchInfo();
  };

  return (
    <div className="listproducts">
      <h1>All Products List</h1>
      <div className="listproducts-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproducts-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <div key={index}>
              <div className="listproducts-format-main listproducts-format"
              >
                <img
                  src={product.image}
                  alt=""
                  className="listproducts-product-icon"
                />
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <img
                  onClick={() => removeProduct(product.id)}
                  src={cross_icon}
                  alt=""
                  className="listproducts-remove-icon"
                />
              </div>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListProducts;
