import React from "react";
import "../styles/background.css";

const AnimatedBackground = () => {
  return (
    <div className="bubbles">
      {[...Array(18)].map((_,i)=>(
        <span key={i}
          style={{
            left:`${Math.random()*100}%`,
            animationDelay:`${Math.random()*6}s`,
            animationDuration:`${10+Math.random()*10}s`
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
