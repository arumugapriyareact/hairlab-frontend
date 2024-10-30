import React from 'react';
import haircut from  "../img/haircut.png";
import shave from  "../img/mans-shave.png";
import dyeing from  "../img/hair-dyeing.png";
import mustache from "../img/mustache.png";
import stacking from "../img/stacking.png";
import trim from "../img/beard-trim.png";

const ServiceItem = ({ image, title, description, price, delay }) => (
  <div className={`col-lg-4 col-md-6 wow fadeInUp`} data-wow-delay={delay}>
    <div className="service-item position-relative overflow-hidden bg-secondary d-flex h-100 p-5 ps-0">
      <div className="bg-dark d-flex flex-shrink-0 align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
        <img className="img-fluid" src={image} alt={title} />
      </div>
      <div className="ps-4">
        <h3 className="text-uppercase mb-3">{title}</h3>
        <p>{description}</p>
        <span className="text-uppercase text-primary">{price}</span>
      </div>
      <a className="btn btn-square" href="">
        <i className="fa fa-plus text-primary"></i>
      </a>
    </div>
  </div>
);

const Services = () => {
  const services = [
    { image: haircut, title: "Haircut", description: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam.", price: "From $15", delay: "0.1s" },
    { image: trim, title: "Beard Trim", description: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam.", price: "From $15", delay: "0.3s" },
    { image: shave, title: "Mans Shave", description: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam.", price: "From $15", delay: "0.5s" },
    { image: dyeing, title: "Hair Dyeing", description: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam.", price: "From $15", delay: "0.1s" },
    { image: mustache, title: "Mustache", description: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam.", price: "From $15", delay: "0.3s" },
    { image: stacking, title: "Stacking", description: "Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam.", price: "From $15", delay: "0.5s" },
  ];

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: "600px" }}>
          <p className="d-inline-block bg-secondary text-primary py-1 px-4">Services</p>
          <h1 className="text-uppercase">What We Provide</h1>
        </div>
        <div className="row g-4">
          {services.map((service, index) => (
            <ServiceItem key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;