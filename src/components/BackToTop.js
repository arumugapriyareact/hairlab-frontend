import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when user scrolls down 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className={`back-to-top ${isVisible ? 'visible' : ''}`}
          aria-label="Back to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      <style jsx>{`
        .back-to-top {
          position: fixed;
          right: 30px;
          bottom: 30px;
          width: 48px;
          height: 48px;
          background-color: #EB1616;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          z-index: 1000;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .back-to-top.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .back-to-top:hover {
          background-color: #0b5ed7;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .back-to-top:active {
          transform: translateY(-1px);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .back-to-top {
            right: 20px;
            bottom: 20px;
            width: 40px;
            height: 40px;
          }
        }

        /* Animation for initial appearance */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default BackToTop;