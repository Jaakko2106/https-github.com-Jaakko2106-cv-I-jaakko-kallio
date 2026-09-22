import React from 'react';

const AnimatedBackground: React.FC = () => {
    return (
        <div className="animated-bg-container" aria-hidden="false">
            <div className="blob blob1"></div>
            <div className="blob blob2"></div>
            <div className="blob blob3"></div>
        </div>
    ); 
};

export default AnimatedBackground;