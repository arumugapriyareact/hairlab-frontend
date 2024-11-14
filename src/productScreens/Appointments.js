import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, IndianRupee } from 'lucide-react';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import setHours from 'date-fns/setHours';
import setMinutes from 'date-fns/setMinutes';
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

const BookingModal = ({
    showBookingModal,
    setShowBookingModal,
    selectedTime,
    setSelectedTime,  // Added this prop
    selectedDate,
    services,
    staff,
    selectedService,
    setSelectedService,
    selectedStaff,
    setSelectedStaff,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    customerEmail,
    setCustomerEmail,
    notes,
    setNotes,
    handleAppointmentSubmit,
    resetBookingForm,
    loading,
    error,
    selectedEvent
}) => {
    if (!showBookingModal) return null;

    // Get hours array for the time dropdown
    const getTimeOptions = () => {
        const times = [];
        for (let hour = 9; hour <= 17; hour++) {
            for (let minute of [0, 30]) {
                const time = new Date();
                time.setHours(hour, minute, 0);
                times.push(time);
            }
        }
        return times;
    };

    const timeOptions = getTimeOptions();

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content bg-dark text-light">
                    <div className="modal-header border-secondary">
                        <h5 className="modal-title">
                            <Calendar className="me-2" size={20} />
                            {selectedEvent ? 'Edit Appointment' : 'Book Appointment'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
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
                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="date"
                                            className="form-control bg-transparent text-light"
                                            id="appointmentDate"
                                            value={format(selectedTime || selectedDate, 'yyyy-MM-dd')}
                                            onChange={(e) => {
                                                const newDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
                                                const currentTime = selectedTime || selectedDate;
                                                newDate.setHours(currentTime.getHours(), currentTime.getMinutes());
                                                setSelectedTime(newDate);
                                            }}
                                        />
                                        <label className="text-light">
                                            <Calendar className="me-2" size={16} />
                                            Appointment Date
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <select
                                            className="form-select bg-transparent text-light"
                                            id="appointmentTime"
                                            value={format(selectedTime || selectedDate, 'HH:mm')}
                                            onChange={(e) => {
                                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                                const newDate = new Date(selectedTime || selectedDate);
                                                newDate.setHours(hours, minutes);
                                                setSelectedTime(newDate);
                                            }}
                                        >
                                            {timeOptions.map((time, index) => (
                                                <option
                                                    key={index}
                                                    value={format(time, 'HH:mm')}
                                                    className="bg-dark"
                                                >
                                                    {format(time, 'h:mm a')}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="text-light">
                                            <Clock className="me-2" size={16} />
                                            Appointment Time
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <select
                                            className="form-select bg-transparent text-light"
                                            id="service"
                                            value={selectedService?._id || ''}
                                            onChange={(e) => {
                                                const service = services.find(s => s._id === e.target.value);
                                                setSelectedService(service);
                                            }}
                                        >
                                            <option value="">Select a service</option>
                                            {services.map(service => (
                                                <option key={service._id} value={service._id} className="bg-dark">
                                                    {service.serviceName} - {service.duration}min - ₹{service.price}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="text-light">Service *</label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <select
                                            className="form-select bg-transparent text-light"
                                            id="staff"
                                            value={selectedStaff?._id || ''}
                                            onChange={(e) => {
                                                const staffMember = staff.find(s => s._id === e.target.value);
                                                setSelectedStaff(staffMember);
                                            }}
                                        >
                                            <option value="">Select a staff member</option>
                                            {staff.map(staffMember => (
                                                <option key={staffMember._id} value={staffMember._id} className="bg-dark">
                                                    {staffMember.firstName} {staffMember.lastName}
                                                    {staffMember.specialization ? ` - ${staffMember.specialization}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="text-light">
                                            <User className="me-2" size={16} />
                                            Staff Member *
                                        </label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="text"
                                            className="form-control bg-transparent text-light"
                                            placeholder="First Name"
                                            value={customerName.split(' ')[0] || ''}
                                            onChange={(e) => {
                                                const lastName = customerName.split(' ').slice(1).join(' ');
                                                setCustomerName(`${e.target.value} ${lastName}`);
                                            }}
                                        />
                                        <label className="text-light">First Name *</label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="text"
                                            className="form-control bg-transparent text-light"
                                            placeholder="Last Name"
                                            value={customerName.split(' ').slice(1).join(' ')}
                                            onChange={(e) => {
                                                const firstName = customerName.split(' ')[0] || '';
                                                setCustomerName(`${firstName} ${e.target.value}`);
                                            }}
                                        />
                                        <label className="text-light">Last Name *</label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="tel"
                                            className="form-control bg-transparent text-light"
                                            placeholder="Phone Number"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                        />
                                        <label className="text-light">Phone Number *</label>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-floating">
                                        <input
                                            type="email"
                                            className="form-control bg-transparent text-light"
                                            placeholder="Email"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                        />
                                        <label className="text-light">Email (Optional)</label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-floating">
                                        <textarea
                                            className="form-control bg-transparent text-light"
                                            placeholder="Additional Notes"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            style={{ height: '100px' }}
                                        ></textarea>
                                        <label className="text-light">Additional Notes (Optional)</label>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-3"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                {selectedEvent ? 'Updating...' : 'Booking...'}
                                            </>
                                        ) : (selectedEvent ? 'Update Appointment' : 'Book Appointment')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

    const validateForm = () => {
        let newErrors = {};
        const [firstName, lastName] = customerName.split(' ');

        if (!firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!selectedService) newErrors.service = 'Service is required';
        if (!selectedStaff) newErrors.staff = 'Staff member is required';

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(customerPhone.replace(/[-\s]/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (customerEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(customerEmail)) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setError(Object.values(newErrors).join(', '));
            return false;
        }

        return true;
    };

    const handleAppointmentSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const [firstName, ...lastNameParts] = customerName.trim().split(' ');
            const lastName = lastNameParts.join(' ');

            const appointmentDateTime = selectedTime || setMinutes(setHours(selectedDate, 9), 0);

            const appointmentData = {
                customer: {
                    firstName,
                    lastName,
                    phoneNumber: customerPhone,
                    email: customerEmail
                },
                service: selectedService._id,
                staff: selectedStaff._id,
                dateTime: appointmentDateTime,
                notes: notes,
                status: 'confirmed'
            };

            const url = selectedEvent
                ? `http://localhost:5001/api/appointments/${selectedEvent.id}`
                : 'http://localhost:5001/api/appointments';

            const response = await fetch(url, {
                method: selectedEvent ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save appointment');
            }

            await fetchAppointments();
            setShowBookingModal(false);
            resetBookingForm();
            alert(`Appointment ${selectedEvent ? 'updated' : 'booked'} successfully!`);
        } catch (error) {
            console.error('Error saving appointment:', error);
            setError(error.message || `Failed to ${selectedEvent ? 'update' : 'create'} appointment`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5001/api/appointments/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete appointment');
            }

            await fetchAppointments();
            alert('Appointment deleted successfully');
        } catch (error) {
            console.error('Error deleting appointment:', error);
            setError('Failed to delete appointment');
        } finally {
            setLoading(false);
        }
    };

    const resetBookingForm = () => {
        setSelectedEvent(null);
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
            className="p-1 position-relative"
            style={{
                backgroundColor: event.status === 'confirmed' ? '#0d6efd' : '#6610f2',
                color: 'white',
                borderRadius: '4px',
                height: '100%'
            }}
        >
            <div className="d-flex justify-content-between align-items-start">
                <div className="fw-semibold">{event.title}</div>
                <div className="btn-group btn-group-sm">
                    <button
                        className="btn btn-sm btn-light opacity-75"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setSelectedTime(event.start);
                            if (event.customer) {
                                setCustomerName(`${event.customer.firstName} ${event.customer.lastName}`);
                                setCustomerPhone(event.customer.phoneNumber || '');
                                setCustomerEmail(event.customer.email || '');
                            }
                            if (event.service) setSelectedService(event.service);
                            if (event.staff) setSelectedStaff(event.staff);
                            if (event.notes) setNotes(event.notes);
                            setShowBookingModal(true);
                        }}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAppointment(event.id);
                        }}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div className="small">
                <Clock size={12} className="me-1" />
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </div>
            {event.service && (
                <div className="small">
                    <IndianRupee size={12} className="me-1" />
                    {event.service.serviceName} ({event.service.duration}min)
                </div>
            )}
            {event.staff && (
                <div className="small">
                    <User size={12} className="me-1" />
                    {`${event.staff.firstName} ${event.staff.lastName}`}
                </div>
            )}
        </div>
    );

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="d-flex" id="wrapper">
            <Sidebar isOpen={isSidebarOpen} isSidebar="Appointments" />
            <div id="page-content-wrapper">
                <Header toggleSidebar={toggleSidebar} />
                <div className="container-fluid p-4">
                    <div className="card shadow">
                        <div className="card-body p-0">
                            <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
                                <div className="d-flex align-items-center gap-3">
                                    <h2 className="h4 mb-0 d-flex align-items-center">
                                        <Calendar size={24} className="me-2" />
                                        {format(selectedDate, 'MMMM yyyy')}
                                    </h2>
                                    <div className="btn-group">
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
                                        className="btn btn-outline-primary"
                                        onClick={() => setSelectedDate(new Date())}
                                    >
                                        Today
                                    </button>
                                    <div className="col-md-6">
                                    <div className="form-floating">
                                        <select
                                            className="form-select bg-transparent text-light"
                                            id="staff"
                                            value={selectedStaff?._id || ''}
                                            onChange={(e) => {
                                                const staffMember = staff.find(s => s._id === e.target.value);
                                                setSelectedStaff(staffMember);
                                            }}
                                        >
                                            <option value="">Select a staff member</option>
                                            {staff.map(staffMember => (
                                                <option key={staffMember._id} value={staffMember._id} className="bg-dark">
                                                    {staffMember.firstName} {staffMember.lastName}
                                                    {staffMember.specialization ? ` - ${staffMember.specialization}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <label className="text-light">
                                            <User className="me-2" size={16} />
                                            Staff Member *
                                        </label>
                                    </div>
                                </div>
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

                            <div style={{ height: 'calc(100vh - 240px)' }}>
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
                                        if (event.customer) {
                                            setCustomerName(`${event.customer.firstName} ${event.customer.lastName}`);
                                            setCustomerPhone(event.customer.phoneNumber || '');
                                            setCustomerEmail(event.customer.email || '');
                                        }
                                        if (event.service) setSelectedService(event.service);
                                        if (event.staff) setSelectedStaff(event.staff);
                                        if (event.notes) setNotes(event.notes);
                                        setShowBookingModal(true);
                                    }}
                                    onSelectSlot={(slotInfo) => {
                                        let appointmentTime;
                                        if (view === 'month') {
                                            appointmentTime = setMinutes(setHours(slotInfo.start, 9), 0);
                                        } else {
                                            appointmentTime = slotInfo.start;
                                        }
                                        setSelectedTime(appointmentTime);
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

                            {loading && (
                                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-50" style={{ zIndex: 1050 }}>
                                    <div className="spinner-border text-light" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}

                            <BookingModal
                                showBookingModal={showBookingModal}
                                setShowBookingModal={setShowBookingModal}
                                selectedTime={selectedTime}
                                setSelectedTime={setSelectedTime}  // Add this line
                                selectedDate={selectedDate}
                                services={services}
                                staff={staff}
                                selectedService={selectedService}
                                setSelectedService={setSelectedService}
                                selectedStaff={selectedStaff}
                                setSelectedStaff={setSelectedStaff}
                                customerName={customerName}
                                setCustomerName={setCustomerName}
                                customerPhone={customerPhone}
                                setCustomerPhone={setCustomerPhone}
                                customerEmail={customerEmail}
                                setCustomerEmail={setCustomerEmail}
                                notes={notes}
                                setNotes={setNotes}
                                handleAppointmentSubmit={handleAppointmentSubmit}
                                resetBookingForm={resetBookingForm}
                                loading={loading}
                                error={error}
                                selectedEvent={selectedEvent}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles
const styles = `
    .rbc-calendar {
        background-color: white;
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .rbc-toolbar {
        padding: 0.5rem;
        margin-bottom: 1rem;
    }

    .rbc-toolbar button {
        color: #6c757d;
        background-color: transparent;
        border: 1px solid #dee2e6;
    }

    .rbc-toolbar button:hover {
        background-color: #f8f9fa;
    }

    .rbc-toolbar button.rbc-active {
        background-color: #0d6efd;
        color: white;
    }

    .rbc-header {
        padding: 0.5rem;
        font-weight: 500;
        background-color: #f8f9fa;
    }

    .rbc-event {
        padding: 0 !important;
        background-color: transparent !important;
        border: none !important;
    }

    .rbc-event.rbc-selected {
        background-color: transparent !important;
    }

    .rbc-day-slot .rbc-event {
        border: none !important;
    }

    .rbc-today {
        background-color: #e9ecef !important;
    }

    .form-floating > .form-control,
    .form-floating > .form-select {
        background-color: #343a40 !important;
        border-color: #495057;
        color: white !important;
    }

    .form-floating > .form-control::placeholder {
        color: transparent;
    }

    .form-floating > label {
        color: #adb5bd;
    }

    .form-floating > .form-control:focus,
    .form-floating > .form-select:focus {
        border-color: #0d6efd;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .form-floating > .form-select option {
        background-color: #343a40;
        color: white;
    }

    .modal-content {
        background-color: #212529;
        color: white;
    }

    .modal-header {
        border-bottom-color: #495057;
        background-color:#343a40 !important
    }

    // .bg-secondary {
    //     background-color: #343a40 !important;
    // }

    @media (max-width: 768px) {
        .rbc-toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
        }

        .rbc-toolbar-label {
            margin: 0.5rem 0;
        }

        .d-flex.justify-content-between {
            flex-direction: column;
            gap: 1rem;
        }

        .btn-group {
            width: 100%;
        }

        .btn-group .btn {
            flex: 1;
        }

        .btn-group .btn {
            flex: 1;
        }
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default OutlookCalendar;