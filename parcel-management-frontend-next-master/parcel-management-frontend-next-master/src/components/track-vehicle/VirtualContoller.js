import { useTrackVehicleContext } from '@/context/TrackVehicleContext';
import React, { useState, useEffect, useCallback } from 'react';
import LocationUpdateControl from './LocationUpdateControl';

const VirtualCarController = () => {
  // const { location, setLocation, locationRef } = useTrackVehicleContext();
  const { location, setLocation } = useTrackVehicleContext();
  const [speed, setSpeed] = useState(10);
  const [isMoving, setIsMoving] = useState({ up: false, down: false, left: false, right: false });
  const [activeKeys, setActiveKeys] = useState(new Set());


  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [setLocation]);


  // Handle keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (e.repeat) return; // Ignore key repeat events

    const key = e.key;
    setActiveKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.add(key);
      return newKeys;
    });

    switch (key) {
      case 'ArrowUp':
        setIsMoving(prev => ({ ...prev, up: true }));
        break;
      case 'ArrowDown':
        setIsMoving(prev => ({ ...prev, down: true }));
        break;
      case 'ArrowLeft':
        setIsMoving(prev => ({ ...prev, left: true }));
        break;
      case 'ArrowRight':
        setIsMoving(prev => ({ ...prev, right: true }));
        break;
      default:
        break;
    }
  }, []);


  const handleKeyUp = useCallback((e) => {
    const key = e.key;
    setActiveKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(key);
      return newKeys;
    });

    switch (key) {
      case 'ArrowUp':
        setIsMoving(prev => ({ ...prev, up: false }));
        break;
      case 'ArrowDown':
        setIsMoving(prev => ({ ...prev, down: false }));
        break;
      case 'ArrowLeft':
        setIsMoving(prev => ({ ...prev, left: false }));
        break;
      case 'ArrowRight':
        setIsMoving(prev => ({ ...prev, right: false }));
        break;
      default:
        break;
    }
  }, []);


  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);


  // Update location based on movement using requestAnimationFrame
  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = 0;

    const updatePosition = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Base movement amount on deltaTime for consistent speed
      const factor = (speed / 100000) * (deltaTime / 16.67); // normalized to ~60fps

      // Update location only if there's actual movement
      if (isMoving.up || isMoving.down || isMoving.left || isMoving.right) {
        setLocation(prev => ({
          lat: prev.lat + (isMoving.up ? factor : 0) - (isMoving.down ? factor : 0),
          lng: prev.lng + (isMoving.right ? factor : 0) - (isMoving.left ? factor : 0)
        }));
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    if (Object.values(isMoving).some(Boolean)) {
      animationFrameId = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMoving, speed, setLocation]);


  // Arrow button component
  const ArrowButton = ({ direction, isActive }) => {
    const getArrowSymbol = () => {
      switch (direction) {
        case 'up': return '↑';
        case 'down': return '↓';
        case 'left': return '←';
        case 'right': return '→';
        default: return '';
      }
    };

    return (
      <button
        className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} p-3`}
        onMouseDown={() => setIsMoving(prev => ({ ...prev, [direction]: true }))}
        onMouseUp={() => setIsMoving(prev => ({ ...prev, [direction]: false }))}
        onMouseLeave={() => setIsMoving(prev => ({ ...prev, [direction]: false }))}
      >
        {getArrowSymbol()}
      </button>
    );
  };

  return (
    <div className="">
      <div className="card" style={{ minWidth: '400px', margin: 'auto' }}>
        <div className="card-header">
          <h5 className="card-title mb-0">Location Controller</h5>
        </div>

        <div className="card-body">
          {/* Location Display */}
          <div className="mb-4">
            <h6 className="card-subtitle mb-2 text-muted">Current Location:</h6>
            <p className="mb-1">Latitude: {location.lat.toFixed(6)}</p>
            <p>Longitude: {location.lng.toFixed(6)}</p>
          </div>

          {/* Speed Slider */}
          <div className="mb-4">
            <h6 className="card-subtitle mb-2 text-muted">Speed Control:</h6>
            <input
              type="range"
              className="form-range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <p className="text-center mt-2">Speed: {speed}</p>
          </div>

          {/* Control Pad */}
          <div className="d-flex flex-column align-items-center">
            <div className="mb-2">
              <ArrowButton direction="up" isActive={isMoving.up} />
            </div>
            <div className="d-flex gap-2 mb-2">
              <ArrowButton direction="left" isActive={isMoving.left} />
              <div style={{ width: '48px' }}></div>
              <ArrowButton direction="right" isActive={isMoving.right} />
            </div>
            <div>
              <ArrowButton direction="down" isActive={isMoving.down} />
            </div>
          </div>

          {/* Location Update Control */}
          <LocationUpdateControl />
        </div>
      </div>
    </div>
  );

};

export default VirtualCarController;