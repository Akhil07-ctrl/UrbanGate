import { useNavigate } from 'react-router-dom';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Features } from '../components/Features';
import { Benefits } from '../components/Benefits';
import { About } from '../components/About';
import { Testimonials } from '../components/Testimonials';
import { TrustedBrands } from '../components/TrustedBrands';

export const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-white overflow-hidden" style={{ minHeight: '600px' }}>
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1
          }}
        ></div>

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10
          }}
          className="px-4"
        >
          <div className="text-center w-full max-w-7xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Smart Apartment Management
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Simplify your community living with UrbanGate
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold"
              >
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Component */}
      <Features />

      {/* Benefits Component */}
      <Benefits />

      {/* About Component */}
      <About />

      {/* Trusted Brands Section */}
      <TrustedBrands />

      {/* Testimonials Component with Carousel */}
      <Testimonials />

      {/* CTA Section */}
      <section
        className="py-20 px-4 text-white relative overflow-hidden"
        style={{
          backgroundImage: `url('https://plus.unsplash.com/premium_photo-1664267475555-d0f774fc534a?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Community?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of apartment communities already using UrbanGate
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
