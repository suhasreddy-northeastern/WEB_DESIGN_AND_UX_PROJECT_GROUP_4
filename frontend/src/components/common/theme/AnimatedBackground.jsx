import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// AnimatedBackground Component with GSAP animations
const AnimatedBackground = () => {
  // Create refs for each animated bubble
  const bubble1Ref = useRef(null);
  const bubble2Ref = useRef(null);
  const bubble3Ref = useRef(null);
  const bubble4Ref = useRef(null);
  const bubble5Ref = useRef(null);

  useEffect(() => {
    // Initialize GSAP animations
    const bubble1 = bubble1Ref.current;
    const bubble2 = bubble2Ref.current;
    const bubble3 = bubble3Ref.current;
    const bubble4 = bubble4Ref.current;
    const bubble5 = bubble5Ref.current;

    // Clear any existing animations
    gsap.killTweensOf([bubble1, bubble2, bubble3, bubble4, bubble5]);

    // Bubble 1 animation
    gsap.to(bubble1, {
      x: 30,
      y: -20,
      scale: 1.05,
      duration: 10,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    // Bubble 2 animation
    gsap.to(bubble2, {
      x: -20,
      y: 25,
      scale: 1.08,
      duration: 7.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    // Bubble 3 animation
    gsap.to(bubble3, {
      x: 15,
      y: 15,
      scale: 1.1,
      duration: 6,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    // Bubble 4 animation
    gsap.to(bubble4, {
      x: -25,
      y: -15,
      scale: 1.05,
      duration: 9,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    // Bubble 5 animation
    gsap.to(bubble5, {
      x: -15,
      y: 30,
      scale: 1.03,
      duration: 12.5,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });

    // Cleanup function
    return () => {
      gsap.killTweensOf([bubble1, bubble2, bubble3, bubble4, bubble5]);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        overflow: 'hidden'
      }}
    >
      <div 
        ref={bubble1Ref}
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(20, 184, 166, 0.2)', // teal-400 with opacity
        }}
      />
      <div 
        ref={bubble2Ref}
        style={{
          position: 'absolute',
          top: '75%',
          right: '25%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          backgroundColor: 'rgba(134, 239, 172, 0.2)', // green-300 with opacity
        }}
      />
      <div 
        ref={bubble3Ref}
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '33%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', // emerald-500 with opacity
        }}
      />
      <div 
        ref={bubble4Ref}
        style={{
          position: 'absolute',
          top: '33%',
          right: '33%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: 'rgba(20, 184, 166, 0.15)', // teal-500 with opacity
        }}
      />
      <div 
        ref={bubble5Ref}
        style={{
          position: 'absolute',
          bottom: '33%',
          right: '16%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          backgroundColor: 'rgba(74, 222, 128, 0.2)', // green-400 with opacity
        }}
      />
    </div>
  );
};

export default AnimatedBackground;