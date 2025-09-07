import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="mx-auto max-w-5xl py-10">
      <div className="mb-8 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center text-white">
        <h1 className="brand-font mb-3 text-5xl md:text-6xl leading-tight">Welcome to Event Karo</h1>
        <p className="text-primary-100">Create, discover, and manage events with ease.</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/events" className="btn bg-white text-primary-700 hover:bg-gray-100">Explore Events</Link>
          <Link to="/register" className="btn border border-white text-white hover:bg-white/10">Get Started</Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <h3 className="mb-2 text-xl font-semibold">Create Events</h3>
          <p className="text-gray-600">Organizers can create and manage events effortlessly.</p>
        </div>
        <div className="card">
          <h3 className="mb-2 text-xl font-semibold">Join Events</h3>
          <p className="text-gray-600">RSVP to events and secure your seat instantly.</p>
        </div>
        <div className="card">
          <h3 className="mb-2 text-xl font-semibold">Manage RSVPs</h3>
          <p className="text-gray-600">Track attendees and payments seamlessly.</p>
        </div>
      </div>
    </section>
  );
}
