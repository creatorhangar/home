import { useState, useEffect } from 'react';

export const Loader = ({ onFinished }: { onFinished: () => void }) => {
    const [progress, setProgress] = useState(0);
    const [text, setText] = useState('');
    const fullText = 'SYSTEM INITIALIZING...';

    useEffect(() => {
        // Typing effect
        let currentIndex = 0;
        const typeInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typeInterval);
            }
        }, 50);

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    setTimeout(onFinished, 500); // Wait a bit before finishing
                    return 100;
                }
                return prev + 2; // Speed of loading
            });
        }, 30);

        return () => {
            clearInterval(typeInterval);
            clearInterval(progressInterval);
        };
    }, [onFinished]);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            fontFamily: 'Orbitron, sans-serif',
            color: '#00F5FF'
        }}>
            <h1 style={{
                fontSize: '2rem',
                marginBottom: '20px',
                textShadow: '0 0 10px #00F5FF'
            }}>
                {text}<span className="blink">_</span>
            </h1>

            <div style={{
                width: '300px',
                height: '4px',
                backgroundColor: '#1a1a1a',
                borderRadius: '2px',
                overflow: 'hidden',
                boxShadow: '0 0 10px rgba(0, 245, 255, 0.3)'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#FF006E',
                    boxShadow: '0 0 15px #FF006E',
                    transition: 'width 0.1s linear'
                }} />
            </div>

            <div style={{
                marginTop: '10px',
                fontSize: '0.8rem',
                color: '#8B00FF',
                letterSpacing: '2px'
            }}>
                LOADING ASSETS [{progress}%]
            </div>

            <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .blink {
          animation: blink 1s infinite;
        }
      `}</style>
        </div>
    );
};
