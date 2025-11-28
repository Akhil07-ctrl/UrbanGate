import { useState, useEffect } from 'react';

export const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            role: 'Apartment Resident',
            text: 'UrbanGate has made life so much easier. Everything I need is just a tap away!',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
            rating: 5,
        },
        {
            name: 'Priya Singh',
            role: 'Building Administrator',
            text: 'Managing complaints and announcements is now super efficient. Highly recommended!',
            image: 'https://res.cloudinary.com/dmfbb9qqj/image/upload/v1759854421/samples/upscale-face-1.jpg',
            rating: 5,
        },
        {
            name: 'Sonakshi Mehta',
            role: 'Society Manager',
            text: 'The automated payment system and facility booking have saved us so much time.',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=688',
            rating: 5,
        },
        {
            name: 'Neha Desai',
            role: 'Resident Coordinator',
            text: 'The real-time notifications keep everyone updated. Best investment for our community!',
            image: 'https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
            rating: 5,
        },
        {
            name: 'Vikram Sharma',
            role: 'Head - Maintenance',
            text: 'Complaint management has become seamless. Response times have improved significantly.',
            image: 'https://images.unsplash.com/photo-1639747280929-e84ef392c69a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
            rating: 5,
        },
    ];

    // Auto-play effect
    useEffect(() => {
        if (!isAutoPlay || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlay, isHovered, testimonials.length]);

    const nextTestimonial = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsAutoPlay(false);
        setTimeout(() => setIsAutoPlay(true), 5000);
    };

    const prevTestimonial = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
        );
        setIsAutoPlay(false);
        setTimeout(() => setIsAutoPlay(true), 5000);
    };

    const goToTestimonial = (index) => {
        setCurrentIndex(index);
        setIsAutoPlay(false);
        setTimeout(() => setIsAutoPlay(true), 5000);
    };

    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-textLight max-w-2xl mx-auto">
                        Real experiences from residents who have transformed their community living with UrbanGate.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Carousel Container */}
                    <div
                        className="overflow-hidden rounded-2xl"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((review, index) => (
                                <div key={index} className="w-full flex-shrink-0 px-4">
                                    <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg">
                                        {/* Author Info with Image */}
                                        <div className="flex items-center justify-center mb-6">
                                            <img
                                                src={review.image}
                                                alt={`${review.name} profile`}
                                                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
                                            />
                                            <div className="text-left">
                                                <h4 className="text-xl font-semibold text-text">{review.name}</h4>
                                                <p className="text-textLight">{review.role}</p>
                                            </div>
                                        </div>

                                        {/* Rating Stars */}
                                        <div className="flex justify-center mb-6">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            ))}
                                        </div>

                                        {/* Testimonial Text */}
                                        <blockquote className="text-lg text-textLight italic leading-relaxed text-center">
                                            "{review.text}"
                                        </blockquote>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-center mt-8 space-x-4 items-center">
                        {/* Left Arrow Button */}
                        <button
                            onClick={prevTestimonial}
                            className="bg-white hover:bg-gray-50 text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                            aria-label="Previous review"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex space-x-2 items-center">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-all duration-200 ${index === currentIndex
                                            ? 'bg-blue-600 w-8'
                                            : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    aria-label={`Go to review ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Right Arrow Button */}
                        <button
                            onClick={nextTestimonial}
                            className="bg-white hover:bg-gray-50 text-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                            aria-label="Next review"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        </section>
    );
};
