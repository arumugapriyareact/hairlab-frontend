import React, { useState, useEffect } from 'react';
import carousel1 from "../img/carousel-1.jpg";
import carousal2 from "../img/carousel-2.jpg";

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselItems = [
    {
      image: carousel1,
      title: "We Will Keep You An Awesome Look",
      address: "20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
      phone: "+91 9353515799"
    },
    {
      image: carousal2,
      title: "Luxury Haircut at Affordable Price",
      address: "20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
      phone: "+91 9353515799"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="container-fluid p-0 mb-5 wow fadeIn" data-wow-delay="0.1s">
      <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          {carouselItems.map((item, index) => (
            <div key={index} className={`carousel-item ${index === activeIndex ? 'active' : ''}`}>
              <img className="w-100" src={item.image} alt={`Carousel Image ${index + 1}`} />
              <div className="carousel-caption d-flex align-items-center justify-content-center text-start">
                <div className="mx-sm-5 px-5" style={{maxWidth: "900px"}}>
                  <h1 className="display-2 text-white text-uppercase mb-4 animated slideInDown">{item.title}</h1>
                  <h4 className="text-white text-uppercase mb-4 animated slideInDown">
                    <i className="fa fa-map-marker-alt text-primary me-3"></i>{item.address}
                  </h4>
                  <h4 className="text-white text-uppercase mb-4 animated slideInDown">
                    <i className="fa fa-phone-alt text-primary me-3"></i>{item.phone}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" onClick={handlePrev}>
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" onClick={handleNext}>
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export default Home;