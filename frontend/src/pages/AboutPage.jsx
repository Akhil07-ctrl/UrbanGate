import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { About } from '../components/About';

export const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <About />
      <Footer />
    </div>
  );
};
