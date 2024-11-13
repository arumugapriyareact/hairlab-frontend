// import React, { useState, useEffect } from 'react';
// import carousel1 from "../img/carousel-1.jpg";
// import carousal2 from "../img/carousel-2.jpg";

// const Home = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [carouselItems, setCarouselItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const defaultItems = [
//     {
//       image: carousel1,
//       title: "We Will Keep You An Awesome Look",
//       address: "20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
//       phone: "+91 9353515799"
//     },
//     {
//       image: carousal2,
//       title: "Luxury Haircut at Affordable Price",
//       address: "20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
//       phone: "+91 9353515799"
//     }
//   ];

//   useEffect(() => {
//     fetchCarouselImages();
//   }, []);

//   const fetchCarouselImages = async () => {
//     try {
//       const response = await fetch('http://localhost:5001/api/carousel-images');
//       if (!response.ok) throw new Error('Failed to fetch images');
//       const data = await response.json();
//       // Only set uploaded images if they exist
//       if (data && data.length > 0) {
//         setCarouselItems(data.map(item => ({
//           image: item.url,
//           title: item.title,
//           address: "20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
//           phone: "+91 9353515799"
//         })));
//       } else {
//         setCarouselItems(defaultItems);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       // Fallback to default items if fetch fails
//       setCarouselItems(defaultItems);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveIndex((prevIndex) => 
//         prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
//       );
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [carouselItems.length]);

//   const handlePrev = () => {
//     setActiveIndex((prevIndex) => 
//       prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
//     );
//   };

//   const handleNext = () => {
//     setActiveIndex((prevIndex) => 
//       prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
//     );
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid p-0 mb-5 wow fadeIn" data-wow-delay="0.1s">
//       <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
//         <div className="carousel-inner">
//           {carouselItems.map((item, index) => (
//             <div key={index} className={`carousel-item ${index === activeIndex ? 'active' : ''}`}>
//               <img className="w-100" src={item.image} alt={`Carousel Image ${index + 1}`} />
//               <div className="carousel-caption d-flex align-items-center justify-content-center text-start">
//                 <div className="mx-sm-5 px-5" style={{maxWidth: "900px"}}>
//                   <h1 className="display-2 text-white text-uppercase mb-4 animated slideInDown">{item.title}</h1>
//                   <h4 className="text-white text-uppercase mb-4 animated slideInDown">
//                     <i className="fa fa-map-marker-alt text-primary me-3"></i>{item.address}
//                   </h4>
//                   <h4 className="text-white text-uppercase mb-4 animated slideInDown">
//                     <i className="fa fa-phone-alt text-primary me-3"></i>{item.phone}
//                   </h4>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <button className="carousel-control-prev" type="button" onClick={handlePrev}>
//           <span className="carousel-control-prev-icon" aria-hidden="true"></span>
//           <span className="visually-hidden">Previous</span>
//         </button>
//         <button className="carousel-control-next" type="button" onClick={handleNext}>
//           <span className="carousel-control-next-icon" aria-hidden="true"></span>
//           <span className="visually-hidden">Next</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Home;


import React, { useState, useEffect } from 'react';
import carousel1 from "../img/carousel-1.jpg";
import carousal2 from "../img/carousel-2.jpg";

const BASE_URL = 'http://localhost:5001'; // Add base URL

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultItems = [
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
    fetchCarouselImages();
  }, []);

  const fetchCarouselImages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/carousel-images`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();

      // Only set uploaded images if they exist
      if (data && data.length > 0) {
        setCarouselItems(data.map(item => ({
          image: `${BASE_URL}${item.url}`, // Add BASE_URL to image path
          title: item.title,
          address: item.address || "20,Krishna,Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078",
          phone: item.phone || "+91 9353515799"
        })));
      } else {
        setCarouselItems(defaultItems);
      }
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      // Fallback to default items if fetch fails
      setCarouselItems(defaultItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

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

  // Handle loading state
  if (loading) {
    return (
      <div className="container-fluid p-0 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle case when no images are available
  if (carouselItems.length === 0) {
    return (
      <div className="container-fluid p-0 mb-5 wow fadeIn" data-wow-delay="0.1s">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
          <div className="text-center">
            <h3>No images available</h3>
            <p>Please add some images through the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 mb-5 wow fadeIn" data-wow-delay="0.1s">
      <div id="header-carousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          {carouselItems.map((item, index) => (
            <div 
              key={index} 
              className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
              style={{ minHeight: '500px' }} // Add minimum height
            >
              <img 
                className="w-100" 
                src={item.image} 
                alt={`Carousel Image ${index + 1}`}
                style={{ 
                  objectFit: 'cover',
                  height: '100%',
                  minHeight: '500px'
                }}
                onError={(e) => {
                  // Fallback to default image if loading fails
                  e.target.src = index === 0 ? carousel1 : carousal2;
                }}
              />
              <div className="carousel-caption d-flex align-items-center justify-content-center text-start">
                <div className="mx-sm-5 px-5" style={{maxWidth: "900px"}}>
                  <h1 className="display-2 text-white text-uppercase mb-4 animated slideInDown">
                    {item.title}
                  </h1>
                  <h4 className="text-white text-uppercase mb-4 animated slideInDown">
                    <i className="fa fa-map-marker-alt text-primary me-3"></i>
                    {item.address}
                  </h4>
                  <h4 className="text-white text-uppercase mb-4 animated slideInDown">
                    <i className="fa fa-phone-alt text-primary me-3"></i>
                    {item.phone}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <button 
          className="carousel-control-prev" 
          type="button" 
          onClick={handlePrev}
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button 
          className="carousel-control-next" 
          type="button" 
          onClick={handleNext}
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>

        {/* Optional: Add indicators */}
        <div className="carousel-indicators">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              type="button"
              className={activeIndex === index ? 'active' : ''}
              onClick={() => setActiveIndex(index)}
              aria-current={activeIndex === index}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      <style jsx>{`
        .carousel-item {
          transition: transform 0.6s ease-in-out;
        }

        .carousel-caption {
          background: rgba(0, 0, 0, 0.5);
          left: 0;
          right: 0;
          bottom: 0;
          top: 0;
          padding: 40px;
        }

        .carousel-indicators {
          margin-bottom: 2rem;
        }

        .carousel-indicators button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 5px;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
        }

        .carousel-indicators button.active {
          background-color: #fff;
        }

        /* Improve responsive behavior */
        @media (max-width: 768px) {
          .carousel-caption {
            padding: 20px;
          }

          .display-2 {
            font-size: 2rem;
          }

          h4 {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;