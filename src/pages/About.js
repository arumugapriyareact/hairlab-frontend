import React from 'react';
import about from  "../img/about.jpg"

const About = () => {
  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
            <div className="d-flex flex-column">
              <img className="img-fluid w-75 align-self-end" src={about} alt="About Us" />
              <div className="w-50 bg-secondary p-5" style={{ marginTop: "-25%" }}>
                <h1 className="text-uppercase text-primary mb-3">25 Years</h1>
                <h2 className="text-uppercase mb-0">Experience</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
            <p className="d-inline-block bg-secondary text-primary py-1 px-4">About Us</p>
            <h1 className="text-uppercase mb-4">More Than Just A Haircut. Learn More About Us!</h1>
            <p>Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos. Clita erat ipsum et lorem et sit, sed stet lorem sit clita duo justo magna dolore erat amet</p>
            <p className="mb-4">Stet no et lorem dolor et diam, amet duo ut dolore vero eos. No stet est diam rebum amet diam ipsum. Clita clita labore, dolor duo nonumy clita sit at, sed sit sanctus dolor eos.</p>
            <div className="row g-4">
              <div className="col-md-6">
                <h3 className="text-uppercase mb-3">Since 1990</h3>
                <p className="mb-0">Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos.</p>
              </div>
              <div className="col-md-6">
                <h3 className="text-uppercase mb-3">1000+ clients</h3>
                <p className="mb-0">Tempor erat elitr rebum at clita. Diam dolor diam ipsum sit. Aliqu diam amet diam et eos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;