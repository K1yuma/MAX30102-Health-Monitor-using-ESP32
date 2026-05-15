import React, { useState, useEffect } from 'react';
import './FallingHearts.css';
import redHeart from '../../assets/hearts/red.png';
import blueHeart from '../../assets/hearts/blue.png';
import greenHeart from '../../assets/hearts/green.png';
import orangeHeart from '../../assets/hearts/orange.png';
import purpleHeart from '../../assets/hearts/purple.png';
import yellowHeart from '../../assets/hearts/yellow.png';
import cyanHeart from '../../assets/hearts/cyan.png';

const hearts = [redHeart, blueHeart, greenHeart, orangeHeart, purpleHeart, yellowHeart, cyanHeart];

const FallingHearts = () => {
  const [heartAnims, setHeartAnims] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now() + Math.random(),
        style: {
          left: `${Math.random() * 100}vw`,
          animation: `fall ${5 + Math.random() * 5}s linear`,
          animationFillMode: 'forwards',
        },
        src: hearts[Math.floor(Math.random() * hearts.length)],
      };

      setHeartAnims(prev => [...prev, newHeart]);

      // Cleanup old hearts
      setTimeout(() => {
        setHeartAnims(prev => prev.filter(h => h.id !== newHeart.id));
      }, 10000); // Corresponds to the longest animation time

    }, 1000); // New heart every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="heart-container">
      {heartAnims.map(heart => (
        <img
          key={heart.id}
          src={heart.src}
          alt="Falling Heart"
          className="heart"
          style={heart.style}
        />
      ))}
    </div>
  );
};

export default FallingHearts;