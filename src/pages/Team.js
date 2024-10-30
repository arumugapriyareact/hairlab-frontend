import React from 'react';
import team1 from '../img/team-1.jpg';
import team2 from '../img/team-2.jpg';
import team3 from '../img/team-3.jpg';
import team4 from '../img/team-4.jpg';

const barbers = [
    {
        name: 'Barber Name 1',
        designation: 'Designation 1',
        image: team1,
        facebook: '#',
        twitter: '#',
        instagram: '#'
    },
    {
        name: 'Barber Name 2',
        designation: 'Designation 2',
        image: team2,
        facebook: '#',
        twitter: '#',
        instagram: '#'
    },
    {
        name: 'Barber Name 3',
        designation: 'Designation 3',
        image: team3,
        facebook: '#',
        twitter: '#',
        instagram: '#'
    },
    {
        name: 'Barber Name 4',
        designation: 'Designation 4',
        image: team4,
        facebook: '#',
        twitter: '#',
        instagram: '#'
    }
];

const Team = () => {
    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <p className="d-inline-block bg-secondary text-primary py-1 px-4">Our Barber</p>
                    <h1 className="text-uppercase">Meet Our Barber</h1>
                </div>
                <div className="row g-4">
                    {barbers.map((barber, index) => (
                        <div className={`col-lg-3 col-md-6 wow fadeInUp`} data-wow-delay={`${0.1 + index * 0.2}s`} key={index}>
                            <div className="team-item">
                                <div className="team-img position-relative overflow-hidden">
                                    <img className="img-fluid" src={barber.image} alt={barber.name} />
                                    <div className="team-social">
                                        <a className="btn btn-square" href={barber.facebook}><i className="fab fa-facebook-f"></i></a>
                                        <a className="btn btn-square" href={barber.twitter}><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-square" href={barber.instagram}><i className="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                                <div className="bg-secondary text-center p-4">
                                    <h5 className="text-uppercase">{barber.name}</h5>
                                    <span className="text-primary">{barber.designation}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Team;