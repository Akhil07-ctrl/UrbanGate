import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Benefits } from '../components/Benefits';

export const BenefitsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Benefits />
      <Footer />
    </div>
  );
};
