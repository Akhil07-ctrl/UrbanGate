import { useState, useEffect, useRef } from 'react';
import { Card } from './UI';

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
          const startTime = Date.now();

          const animateCount = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            if (end === '99.9%') {
              // For percentage, animate to 99.9
              const currentValue = Math.floor(progress * 999) / 10;
              setCount(currentValue.toFixed(1));
            } else {
              // For numbers, remove the + suffix and parse
              const endNumber = parseInt(end.replace(/\D/g, ''));
              const currentValue = Math.floor(progress * endNumber);
              setCount(currentValue);
            }

            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              setCount(end);
            }
          };

          animateCount();
        }
      },
      {
        threshold: 0.5,
      }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [end, duration]);

  return (
    <div ref={countRef} className="text-4xl font-bold text-blue-600 mb-2">
      {typeof count === 'string' && count.includes('%') ? count : count}
      {typeof count === 'number' && end.includes('+') && count !== end ? '+' : ''}
      {typeof count === 'number' && count === end && end.includes('+') ? '+' : ''}
    </div>
  );
};

export const About = () => {
    return (
        <section id="about" className="py-20 px-4 bg-secondary">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-4">About UrbanGate</h2>
                <p className="text-center text-textLight mb-12 text-lg">
                    Transforming apartment community management
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <Card className="hover:shadow-lg transition-shadow">
                        <div>
                            <h3 className="text-2xl font-bold text-text mb-4">Our Mission</h3>
                            <p className="text-textLight leading-relaxed">
                                To revolutionize apartment community management by providing a unified platform
                                that streamlines communication, automates processes, and enhances the living
                                experience for residents and administrators alike.
                            </p>
                        </div>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <div>
                            <h3 className="text-2xl font-bold text-text mb-4">Our Vision</h3>
                            <p className="text-textLight leading-relaxed">
                                To create connected, transparent, and efficiently managed communities where
                                residents feel valued, administrators work smarter, and communities thrive
                                through technology and collaboration.
                            </p>
                        </div>
                    </Card>
                </div>

                <Card className="hover:shadow-lg transition-shadow mb-12">
                    <div>
                        <h3 className="text-2xl font-bold text-text mb-4">Why We Built UrbanGate</h3>
                        <p className="text-textLight leading-relaxed mb-6">
                            Managing an apartment community involves juggling multiple tasks - handling complaints,
                            managing payments, organizing announcements, and coordinating facilities. Without a
                            proper system, this becomes chaotic and time-consuming.
                        </p>
                        <p className="text-textLight leading-relaxed">
                            We recognized this pain point and built UrbanGate to be the all-in-one solution
                            that apartment communities need. With our platform, administrators can focus on
                            community development while residents enjoy a seamless living experience.
                        </p>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <AnimatedCounter end="500+" duration={2000} />
                        <p className="text-textLight">Communities Managed</p>
                    </div>
                    <div className="text-center">
                        <AnimatedCounter end="50000+" duration={2000} />
                        <p className="text-textLight">Active Users</p>
                    </div>
                    <div className="text-center">
                        <AnimatedCounter end="99.9%" duration={2000} />
                        <p className="text-textLight">Uptime</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
