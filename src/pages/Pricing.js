import React from 'react';
import price from "../img/price.jpg"

const PriceItem = ({ service, price, isLast }) => (
  <div className={`d-flex justify-content-between ${isLast ? '' : 'border-bottom'} py-2`}>
    <h6 className="text-uppercase mb-0">{service}</h6>
    <span className="text-uppercase text-primary">{price}</span>
  </div>
);

const Pricing = () => {
  const priceList = [
    { service: "Haircut", price: "$29.00" },
    { service: "Beard Trim", price: "$35.00" },
    { service: "Mans Shave", price: "$23.00" },
    { service: "Hair Dyeing", price: "$19.00" },
    { service: "Mustache", price: "$15.00" },
    { service: "Stacking", price: "$39.00" }
  ];

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="row g-0">
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
            <div className="bg-secondary h-100 d-flex flex-column justify-content-center p-5">
              <p className="d-inline-flex bg-dark text-primary py-1 px-4 me-auto">Price & Plan</p>
              <h1 className="text-uppercase mb-4">Check Out Our Barber Services And Prices</h1>
              <div>
                {priceList.map((item, index) => (
                  <PriceItem 
                    key={index}
                    service={item.service}
                    price={item.price}
                    isLast={index === priceList.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
            <div className="h-100">
              <img className="img-fluid h-100" src={price} alt="Pricing" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;