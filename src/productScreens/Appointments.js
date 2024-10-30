import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, IndianRupee } from 'lucide-react';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import Sidebar from '../components/Sidebar';
import Header from "../components/Header";
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const OutlookCalendar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [staff, setStaff] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [services, setServices] = useState([]);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState('week');
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStaff();
        fetchAppointments();
        fetchServices();
    }, [selectedDate]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/staff');
            if (!response.ok) throw new Error('Failed to fetch staff');
            const data = await response.json();
            setStaff(data);
        } catch (error) {
            console.error('Error fetching staff:', error);
            setError('Failed to load staff members');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/services');
            if (!response.ok) throw new Error('Failed to fetch services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/appointments');
            if (!response.ok) throw new Error('Failed to fetch appointments');
            const data = await response.json();
            const transformedEvents = data.map(apt => ({
                id: apt._id,
                title: `${apt.customer?.firstName} ${apt.customer?.lastName}`,
                start: new Date(apt.dateTime),
                end: new Date(new Date(apt.dateTime).getTime() + (apt.service?.duration || 30) * 60000),
                service: apt.service,
                staff: apt.staff,
                customer: apt.customer,
                status: apt.status,
                notes: apt.notes
            }));
            setAppointments(transformedEvents);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleAppointmentSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const [firstName, ...lastNameParts] = customerName.trim().split(' ');
            const lastName = lastNameParts.join(' ');

            const appointmentData = {
                firstName,
                lastName,
                phoneNumber: customerPhone,
                email: customerEmail,
                service: selectedService._id,
                staff: selectedStaff._id,
                dateTime: selectedTime,
                notes: notes,
                status: 'confirmed'
            };

            const response = await fetch('http://localhost:5001/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create appointment');
            }

            await fetchAppointments();
            setShowBookingModal(false);
            resetBookingForm();
            alert('Appointment booked successfully!');
        } catch (error) {
            console.error('Error creating appointment:', error);
            setError(error.message || 'Failed to create appointment');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {


        // Validate phone number (basic validation)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(customerPhone.replace(/[-\s]/g, ''))) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }

        // Validate email if provided
        if (customerEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerEmail)) {
                setError('Please enter a valid email address');
                return false;
            }
        }

        return true;
    };

    const resetBookingForm = () => {
        setSelectedStaff(null);
        setSelectedService(null);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
        setSelectedTime(null);
        setError(null);
    };

    const EventComponent = ({ event }) => (
        <div
            className="p-1"
            style={{
                backgroundColor: event.status === 'confirmed' ? '#0d6efd' : '#6610f2',
                color: 'white',
                borderRadius: '4px',
                height: '100%'
            }}
        >
            <div className="fw-semibold small">{event.title}</div>
            <div className="small">
                <Clock size={12} className="me-1" />
                {format(event.start, 'HH:mm')}
            </div>
            {event.service && (
                <div className="small">{event.service.serviceName}</div>
            )}
            {event.staff && (
                <div className="small">
                    <User size={12} className="me-1" />
                    {`${event.staff.firstName} ${event.staff.lastName}`}
                </div>
            )}
        </div>
    );

    const BookingModal = () => (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
              <div className="modal-content">
                  <div className="modal-header">
                      <h5 className="modal-title">Book Appointment</h5>
                      <button
                          type="button"
                          className="btn-close"
                          onClick={() => {
                              setShowBookingModal(false);
                              resetBookingForm();
                          }}
                      ></button>
                  </div>
                  <div className="modal-body bg-secondary">
                      {error && (
                          <div className="alert alert-danger mb-4" role="alert">
                              {error}
                          </div>
                      )}
  
                      <form onSubmit={(e) => {
                          e.preventDefault();
                          handleAppointmentSubmit();
                      }}>
                          <div className="row g-3">
                              {/* Date and Time Section */}
                              <div className="col-12">
                                  <div className="form-floating">
                                      <input
                                          type="text"
                                          className="form-control bg-transparent"
                                          id="appointmentDateTime"
                                          value={format(selectedTime || selectedDate, 'PPpp')}
                                          disabled
                                      />
                                      <label htmlFor="appointmentDateTime">Appointment Date & Time</label>
                                  </div>
                              </div>
  
                              {/* Service Selection */}
                              <div className="col-md-6">
                                  <div className="form-floating">
                                      <select
                                          className="form-select bg-transparent"
                                          id="service"
                                          value={selectedService?._id || ''}
                                          onChange={(e) => {
                                              const service = services.find(s => s._id === e.target.value);
                                              setSelectedService(service);
                                          }}
                                      >
                                          <option value="">Select a service</option>
                                          {services.map(service => (
                                              <option key={service._id} value={service._id}>
                                                  {service.serviceName} - {service.duration}min - ₹{service.price}
                                              </option>
                                          ))}
                                      </select>
                                      <label htmlFor="service">Service *</label>
                                  </div>
                              </div>
  
                              {/* Staff Selection */}
                              <div className="col-md-6">
                                  <div className="form-floating">
                                      <select
                                          className="form-select bg-transparent"
                                          id="staff"
                                          value={selectedStaff?._id || ''}
                                          onChange={(e) => {
                                              const staffMember = staff.find(s => s._id === e.target.value);
                                              setSelectedStaff(staffMember);
                                          }}
                                      >
                                          <option value="">Select a staff member</option>
                                          {staff.map(staffMember => (
                                              <option key={staffMember._id} value={staffMember._id}>
                                                  {staffMember.firstName} {staffMember.lastName}
                                                  {staffMember.specialization ? ` - ${staffMember.specialization}` : ''}
                                              </option>
                                          ))}
                                      </select>
                                      <label htmlFor="staff">Staff Member *</label>
                                  </div>
                              </div>
  
                              {/* Customer First Name */}
                              <div className="col-md-6">
                                  <div className="form-floating">
                                      <input
                                          type="text"
                                          className="form-control bg-transparent"
                                          id="firstName"
                                          value={customerName.split(' ')[0] || ''}
                                          onChange={(e) => {
                                              const lastName = customerName.split(' ').slice(1).join(' ');
                                              setCustomerName(`${e.target.value} ${lastName}`);
                                          }}
                                          placeholder="Enter first name"
                                      />
                                      <label htmlFor="firstName">First Name *</label>
                                  </div>
                              </div>
  
                              {/* Customer Last Name */}
                              <div className="col-md-6">
                                  <div className="form-floating">
                                      <input
                                          type="text"
                                          className="form-control bg-transparent"
                                          id="lastName"
                                          value={customerName.split(' ').slice(1).join(' ')}
                                          onChange={(e) => {
                                              const firstName = customerName.split(' ')[0] || '';
                                              setCustomerName(`${firstName} ${e.target.value}`);
                                          }}
                                          placeholder="Enter last name"
                                      />
                                      <label htmlFor="lastName">Last Name *</label>
                                  </div>
                              </div>
  
                              {/* Phone Number */}
                              <div className="col-md-6">
                                  <div className="form-floating">
                                      <input
                                          type="tel"
                                          className="form-control bg-transparent"
                                          id="phoneNumber"
                                          value={customerPhone}
                                          onChange={(e) => setCustomerPhone(e.target.value)}
                                          placeholder="Enter phone number"
                                      />
                                      <label htmlFor="phoneNumber">Phone Number *</label>
                                  </div>
                              </div>
  
                              {/* Email */}
                              <div className="col-md-6">
                                  <div className="form-floating">
                                      <input
                                          type="email"
                                          className="form-control bg-transparent"
                                          id="email"
                                          value={customerEmail}
                                          onChange={(e) => setCustomerEmail(e.target.value)}
                                          placeholder="Enter email"
                                      />
                                      <label htmlFor="email">Email (Optional)</label>
                                  </div>
                              </div>
  
                              {/* Notes */}
                              <div className="col-12">
                                  <div className="form-floating">
                                      <textarea
                                          className="form-control bg-transparent"
                                          id="notes"
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          placeholder="Add notes"
                                          style={{ height: '100px' }}
                                      ></textarea>
                                      <label htmlFor="notes">Additional Notes (Optional)</label>
                                  </div>
                              </div>
  
                              {/* Submit Button */}
                              <div className="col-12">
                                  <button
                                      type="submit"
                                      className="btn btn-primary w-100 py-3"
                                      disabled={loading}
                                  >
                                      {loading ? (
                                          <>
                                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                              Booking...
                                          </>
                                      ) : 'Book Appointment'}
                                  </button>
                              </div>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      </div>
  );

  const additionalStyles = `
  .form-floating > .form-control,
  .form-floating > .form-select {
    background-color: transparent;
    border-color: #dee2e6;
    color: #fff;
  }

  .form-floating > .form-control::placeholder {
    color: transparent;
  }

  .form-floating > label {
    color: #adb5bd;
  }

  .form-floating > .form-control:focus,
  .form-floating > .form-select:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }

  .form-floating > .form-control:focus ~ label,
  .form-floating > .form-control:not(:placeholder-shown) ~ label,
  .form-floating > .form-select ~ label {
    color: #fff;
    opacity: 0.65;
  }

  .form-floating > .form-select option {
    background-color: #6c757d;
    color: #fff;
  }

  .modal-content {
    background-color: #343a40;
    color: #fff;
  }

  .modal-header {
    border-bottom-color: #495057;
  }

  .modal-footer {
    border-top-color: #495057;
  }

  .bg-secondary {
    background-color: #6c757d !important;
  }
`;

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="d-flex" id="wrapper">
            <Sidebar isOpen={isSidebarOpen} isSidebar="Appointments" />
            <div id="page-content-wrapper">
                <Header toggleSidebar={toggleSidebar} />
                <div className="container-fluid">
                    <div className="card h-100">
                        <div className="card-body p-0">
                            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                                <div className="d-flex align-items-center gap-2">
                                    <h2 className="h4 mb-0">
                                        <Calendar size={24} className="me-2" />
                                        {format(selectedDate, 'MMMM yyyy')}
                                    </h2>
                                    <div className="btn-group ms-3">
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                const newDate = new Date(selectedDate);
                                                newDate.setMonth(newDate.getMonth() - 1);
                                                setSelectedDate(newDate);
                                            }}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                const newDate = new Date(selectedDate);
                                                newDate.setMonth(newDate.getMonth() + 1);
                                                setSelectedDate(newDate);
                                            }}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    <button
                                        className="btn btn-outline-primary ms-2"
                                        onClick={() => setSelectedDate(new Date())}
                                    >
                                        Today
                                    </button>
                                </div>
                                <div className="btn-group">
                                    <button
                                        className={`btn btn-outline-secondary ${view === 'month' ? 'active' : ''}`}
                                        onClick={() => setView('month')}
                                    >
                                        Month
                                    </button>
                                    <button
                                        className={`btn btn-outline-secondary ${view === 'week' ? 'active' : ''}`}
                                        onClick={() => setView('week')}

                                    >
                                        Week
                                    </button>
                                    <button
                                        className={`btn btn-outline-secondary ${view === 'day' ? 'active' : ''}`}
                                        onClick={() => setView('day')}
                                    >
                                        Day
                                    </button>
                                </div>
                            </div>

                            {loading && (
                                <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75" style={{ zIndex: 1000 }}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            <div style={{ height: 'calc(100vh - 200px)' }}>
                                <BigCalendar
                                    localizer={localizer}
                                    events={appointments}
                                    startAccessor="start"
                                    endAccessor="end"
                                    view={view}
                                    views={['month', 'week', 'day']}
                                    onView={setView}
                                    date={selectedDate}
                                    onNavigate={(newDate) => setSelectedDate(newDate)}
                                    min={new Date(0, 0, 0, 9, 0, 0)}
                                    max={new Date(0, 0, 0, 17, 0, 0)}
                                    step={30}
                                    timeslots={2}
                                    components={{
                                        event: EventComponent
                                    }}
                                    onSelectEvent={(event) => {
                                        setSelectedEvent(event);
                                        setSelectedTime(event.start);
                                        // Pre-fill form when editing existing appointment
                                        if (event.customer) {
                                            setCustomerName(`${event.customer.firstName} ${event.customer.lastName}`);
                                            setCustomerPhone(event.customer.phoneNumber || '');
                                            setCustomerEmail(event.customer.email || '');
                                        }
                                        if (event.service) {
                                            setSelectedService(event.service);
                                        }
                                        if (event.staff) {
                                            setSelectedStaff(event.staff);
                                        }
                                        if (event.notes) {
                                            setNotes(event.notes);
                                        }
                                        setShowBookingModal(true);
                                    }}
                                    onSelectSlot={(slotInfo) => {
                                        setSelectedTime(slotInfo.start);
                                        setSelectedEvent(null);
                                        resetBookingForm();
                                        setShowBookingModal(true);
                                    }}
                                    selectable
                                    tooltipAccessor={(event) => `
                    ${event.title}
                    ${event.service ? `\nService: ${event.service.serviceName}` : ''}
                    ${event.staff ? `\nStaff: ${event.staff.firstName} ${event.staff.lastName}` : ''}
                    ${event.notes ? `\nNotes: ${event.notes}` : ''}
                  `}
                                />
                            </div>

                            {showBookingModal && <BookingModal />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Complete styles
const styles = `
  .rbc-calendar {
    width: 100%;
    height: 100%;
    background-color: white;
    border-radius: 0.25rem;
  }
  
  .rbc-event {
    padding: 0 !important;
    background-color: transparent !important;
  }
  
  .rbc-event.rbc-selected {
    background-color: transparent !important;
  }
  
  .rbc-today {
    background-color: rgba(13, 110, 253, 0.1) !important;
  }
  
  .rbc-header {
    padding: 8px !important;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
  }

  .rbc-time-view {
    background-color: white;
  }
  
  .rbc-time-header {
    background-color: #f8f9fa;
  }
  
  .rbc-time-content {
    border-top: 1px solid #dee2e6;
  }
  
  .rbc-time-slot {
    border-top: none;
  }
  
  .rbc-day-slot .rbc-time-slot {
    border-top: 1px solid #f0f0f0;
  }
  
  .rbc-current-time-indicator {
    background-color: #dc3545;
  }

  .hover-bg-primary-soft:hover {
    background-color: rgba(13, 110, 253, 0.1);
  }

  #wrapper {
    min-height: 100vh;
    background-color: #f8f9fa;
  }

  #page-content-wrapper {
    width: 100%;
    min-height: 100vh;
  }

  .card {
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    margin-bottom: 1rem;
  }

  .form-select {
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    padding: 0.375rem 2.25rem 0.375rem 0.75rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .form-select:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }

  .modal-content {
    border-radius: 0.5rem;
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  .modal-footer {
    border-top: 1px solid #dee2e6;
    background-color: #f8f9fa;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  @media (max-width: 768px) {
    .rbc-toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }

    .rbc-toolbar-label {
      margin: 0.5rem 0;
    }

    .modal-dialog {
      margin: 0.5rem;
    }

    .row.g-3 > .col-md-6 {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }

  /* Tooltip Styles */
  .rbc-tooltip {
    background-color: #333;
    color: white;
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    max-width: 300px;
    white-space: pre-wrap;
  }

  /* Loading Overlay */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Utility functions for date and time handling
const getAvailableTimeSlots = (date, staffMember, appointments) => {
    const timeSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeSlot = new Date(date);
            timeSlot.setHours(hour, minute, 0, 0);

            const isBooked = appointments.some(apt => {
                const aptStart = new Date(apt.start);
                const aptEnd = new Date(apt.end);
                return timeSlot >= aptStart && timeSlot < aptEnd;
            });

            if (!isBooked) {
                timeSlots.push(timeSlot);
            }
        }
    }

    return timeSlots;
};

const formatTimeSlot = (date) => {
    return format(date, 'h:mm a');
};

const isSlotAvailable = (date, appointments) => {
    return !appointments.some(apt => {
        const aptStart = new Date(apt.start);
        const aptEnd = new Date(apt.end);
        return date >= aptStart && date < aptEnd;
    });
};

export default OutlookCalendar;