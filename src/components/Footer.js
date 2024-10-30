import React from 'react';

const Footer = () => {
    return (
        <div className="container-fluid bg-secondary text-light footer mt-5 pt-5 wow fadeIn" data-wow-delay="0.1s">
            <div className="container py-5">
                <div className="row g-5">
                    <div className="col-lg-4 col-md-6">
                        <h4 className="text-uppercase mb-4">Get In Touch</h4>
                        <div className="d-flex align-items-center mb-2">
                            <div className="btn-square bg-dark flex-shrink-0 me-3">
                                <span className="fa fa-map-marker-alt text-primary"></span>
                            </div>
                            <span>20, Krishna, Aditya Nagar, Chunchgatta Main Rd, Kothnoor Dinne, 8th Phase, J. P. Nagar, Bengaluru, Karnataka 560078</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <div className="btn-square bg-dark flex-shrink-0 me-3">
                                <span className="fa fa-phone-alt text-primary"></span>
                            </div>
                            <span>+91 9353515799</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <div className="btn-square bg-dark flex-shrink-0 me-3">
                                <span className="fa fa-envelope-open text-primary"></span>
                            </div>
                            <span>info@example.com</span>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <h4 className="text-uppercase mb-4">Quick Links</h4>
                        <a className="btn btn-link" href="">About Us</a>
                        <a className="btn btn-link" href="">Contact Us</a>
                        <a className="btn btn-link" href="">Our Services</a>
                        <a className="btn btn-link" href="">Terms & Condition</a>
                        <a className="btn btn-link" href="">Support</a>
                    </div>
                    <div className="col-lg-4 col-md-6">
                        <h4 className="text-uppercase mb-4">Newsletter</h4>
                        <div className="position-relative mb-4">
                            <input 
                                className="form-control border-0 w-100 py-3 ps-4 pe-5" 
                                type="text" 
                                placeholder="Your email"
                            />
                            <button type="button" className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2">SignUp</button>
                        </div>
                        <div className="d-flex pt-1 m-n1">
                            <a className="btn btn-lg-square btn-dark text-primary m-1" href=""><i className="fab fa-twitter"></i></a>
                            <a className="btn btn-lg-square btn-dark text-primary m-1" href=""><i className="fab fa-facebook-f"></i></a>
                            <a className="btn btn-lg-square btn-dark text-primary m-1" href=""><i className="fab fa-youtube"></i></a>
                            <a className="btn btn-lg-square btn-dark text-primary m-1" href=""><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="copyright">
                    <div className="row">
                        <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                            &copy; <a className="border-bottom" href="#">@Hairlab</a>, All Right Reserved.
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            Designed By <a className="border-bottom" href="https://htmlcodex.com">Hairlab</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;