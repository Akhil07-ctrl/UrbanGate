import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Contact } from '../components/Contact';

export const ContactPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Contact />
      <Footer />
    </div>
  );
};
