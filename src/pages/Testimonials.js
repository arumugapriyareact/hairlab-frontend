// import React, { useEffect } from 'react';
// import testimonial1 from "../img/testimonial-1.jpg";
// import testimonial2 from "../img/testimonial-2.jpg";
// import testimonial3 from "../img/testimonial-3.jpg";
// import '../owlcarousel/assets/owl.carousel.css'; // Ensure you have this CSS
// import '../owlcarousel/owl.carousel'; // Ensure you have this JS
// import $ from 'jquery'; // jQuery is required for Owl Carousel

// const testimonials = [
//     {
//         name: 'Client Name 1',
//         profession: 'Profession 1',
//         feedback: 'Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed. Magna ut diam sit et amet stet eos sed clita erat magna elitr erat sit sit erat at rebum justo sea clita.',
//         image: testimonial1
//     },
//     {
//         name: 'Client Name 2',
//         profession: 'Profession 2',
//         feedback: 'Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed. Magna ut diam sit et amet stet eos sed clita erat magna elitr erat sit sit erat at rebum justo sea clita.',
//         image: testimonial2
//     },
//     {
//         name: 'Client Name 3',
//         profession: 'Profession 3',
//         feedback: 'Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed. Magna ut diam sit et amet stet eos sed clita erat magna elitr erat sit sit erat at rebum justo sea clita.',
//         image: testimonial3
//     }
// ];

// const Testimonials = () => {
//     useEffect(() => {
//         // Initialize Owl Carousel
//         $('.testimonial-carousel').owlCarousel({
//             loop: true,
//             margin: 10,
//             nav: true,
//             items: 1,
//             dots: true,
//             autoplay: true,
//             autoplayTimeout: 3000,
//             autoplayHoverPause: true
//         });
//     }, []);

//     return (
//         <div className="container-xxl py-5">
//             <div className="container">
//                 <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
//                     <p className="d-inline-block bg-secondary text-primary py-1 px-4">Testimonial</p>
//                     <h1 className="text-uppercase">What Our Clients Say!</h1>
//                 </div>
//                 <div className="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s">
//                     {testimonials.map((testimonial, index) => (
//                         <div className="testimonial-item text-center" key={index} data-dot={`<img class='img-fluid' src='${testimonial.image}' alt=''>`}>
//                             <h4 className="text-uppercase">{testimonial.name}</h4>
//                             <p className="text-primary">{testimonial.profession}</p>
//                             <span className="fs-5">{testimonial.feedback}</span>
//                         </div>
//                     ))}
//                 </div>      
//             </div>
//         </div>
//     );
// };

// export default Testimonials;

import React from 'react';
import Slider from "react-slick";
import testimonial1 from "../img/testimonial-1.jpg";
import testimonial2 from "../img/testimonial-2.jpg";
import testimonial3 from "../img/testimonial-3.jpg";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
    {
        name: 'Client Name 1',
        profession: 'Profession 1',
        feedback: 'Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed.',
        image: testimonial1
    },
    {
        name: 'Client Name 2',
        profession: 'Profession 2',
        feedback: 'Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed.',
        image: testimonial2
    },
    {
        name: 'Client Name 3',
        profession: 'Profession 3',
        feedback: 'Clita clita tempor justo dolor ipsum amet kasd amet duo justo duo duo labore sed sed.',
        image: testimonial3
    }
];

const Testimonials = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <p className="d-inline-block bg-secondary text-primary py-1 px-4">Testimonial</p>
                    <h1 className="text-uppercase">What Our Clients Say!</h1>
                </div>
                <Slider {...settings}>
                    {testimonials.map((testimonial, index) => (
                        <div className="testimonial-item text-center" key={index}>
                            <h4 className="text-uppercase">{testimonial.name}</h4>
                            <p className="text-primary">{testimonial.profession}</p>
                            <span className="fs-5">{testimonial.feedback}</span>
                        </div>
                    ))}
                </Slider>      
            </div>
        </div>
    );
};

export default Testimonials;