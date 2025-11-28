import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Features } from '../components/Features';

export const FeaturesPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <Features />
      <Footer />
    </div>
  );
};
