import React from 'react';
import open from "../img/open.jpg"

const workingHours = [
    { day: 'Monday', hours: '09 AM - 09 PM' },
    { day: 'Tuesday', hours: '09 AM - 09 PM' },
    { day: 'Wednesday', hours: '09 AM - 09 PM' },
    { day: 'Thursday', hours: '09 AM - 09 PM' },
    { day: 'Friday', hours: '09 AM - 09 PM' },
    { day: 'Sat / Sun', hours: 'Closed', isClosed: true }
];

const WorkingHours = () => {
    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="row g-0">
                    <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                        <div className="h-100">
                            <img className="img-fluid h-100" src={open} alt="Barbershop" />
                        </div>
                    </div>
                    <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                        <div className="bg-secondary h-100 d-flex flex-column justify-content-center p-5">
                            <p className="d-inline-flex bg-dark text-primary py-1 px-4 me-auto">Working Hours</p>
                            <h1 className="text-uppercase mb-4">Professional Barbers Are Waiting For You</h1>
                            <div>
                                {workingHours.map((item, index) => (
                                    <div key={index} className={`d-flex justify-content-between border-bottom py-2 ${item.isClosed ? '' : ''}`}>
                                        <h6 className="text-uppercase mb-0">{item.day}</h6>
                                        <span className={`text-uppercase ${item.isClosed ? 'text-primary' : ''}`}>{item.hours}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkingHours;