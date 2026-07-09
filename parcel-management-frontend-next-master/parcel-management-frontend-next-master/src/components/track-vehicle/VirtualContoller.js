import { useTrackVehicleContext } from '@/context/TrackVehicleContext';
import React, { useState, useEffect, useCallback } from 'react';
import LocationUpdateControl from './LocationUpdateControl';

const VirtualCarController = ({ vehicleId }) => {
  const { location, setLocation, selectedRoute, setSelectedRoute } = useTrackVehicleContext();
  
  const [routes, setRoutes] = useState([]);
 
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  const [speed, setSpeed] = useState(10);
  const [isMoving, setIsMoving] = useState({ up: false, down: false, left: false, right: false });
  const [activeKeys, setActiveKeys] = useState(new Set());

  // 1. Fetch available routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const apiUrl = `http://${process.env.NEXT_PUBLIC_BACKEND_URL}/truck-routes/getallRoutes`;
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Expected JSON but got HTML. Check if ${apiUrl} exists on your backend!`);
        }

        const data = await response.json();
        
        if (data.data) {
          setRoutes(data.data);
        }
      } catch (error) {
        console.error('Error fetching routes:', error.message);
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    fetchRoutes();
  }, []);

  // 2. Geolocation fallback
  useEffect(() => {
    if (!selectedRoute && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error('Error getting location:', error)
      );
    }
  }, [selectedRoute, setLocation]);

  // 3. Handle Route Selection
  const handleRouteSelect = (e) => {
    const routeId = e.target.value;
    if (!routeId) {
      setSelectedRoute(null);
      return;
    }
    const route = routes.find(r => r._id === routeId);
    setSelectedRoute(route);

    if (route && route.startLocation) {
      setLocation({ lat: Number(route.startLocation.lat), lng: Number(route.startLocation.long) });
    }
  };

  // --- Keyboard & Movement Logic ---
  const handleKeyDown = useCallback((e) => {
    if (e.repeat || !selectedRoute) return; 
    const key = e.key;
    setActiveKeys(prev => new Set(prev).add(key));
    switch (key) {
      case 'ArrowUp': setIsMoving(prev => ({ ...prev, up: true })); break;
      case 'ArrowDown': setIsMoving(prev => ({ ...prev, down: true })); break;
      case 'ArrowLeft': setIsMoving(prev => ({ ...prev, left: true })); break;
      case 'ArrowRight': setIsMoving(prev => ({ ...prev, right: true })); break;
      default: break;
    }
  }, [selectedRoute]);

  const handleKeyUp = useCallback((e) => {
    if (!selectedRoute) return;
    const key = e.key;
    setActiveKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(key);
      return newKeys;
    });
    switch (key) {
      case 'ArrowUp': setIsMoving(prev => ({ ...prev, up: false })); break;
      case 'ArrowDown': setIsMoving(prev => ({ ...prev, down: false })); break;
      case 'ArrowLeft': setIsMoving(prev => ({ ...prev, left: false })); break;
      case 'ArrowRight': setIsMoving(prev => ({ ...prev, right: false })); break;
      default: break;
    }
  }, [selectedRoute]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = 0;

    const updatePosition = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      const factor = (speed / 100000) * (deltaTime / 16.67); 

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
    return () => { if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [isMoving, speed, setLocation]);

  // Arrow button component with self-contained styles
  const ArrowButton = ({ direction, isActive }) => {
    const getArrowSymbol = () => {
      switch (direction) {
        case 'up': return '↑'; case 'down': return '↓'; case 'left': return '←'; case 'right': return '→'; default: return '';
      }
    };
    return (
      <button
        style={{
          padding: '15px 25px', fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '8px', cursor: selectedRoute ? 'pointer' : 'not-allowed',
          backgroundColor: isActive ? '#007bff' : '#e9ecef', color: isActive ? 'white' : '#495057', border: '1px solid #ced4da', transition: '0.1s'
        }}
        onMouseDown={() => selectedRoute && setIsMoving(prev => ({ ...prev, [direction]: true }))}
        onMouseUp={() => selectedRoute && setIsMoving(prev => ({ ...prev, [direction]: false }))}
        onMouseLeave={() => selectedRoute && setIsMoving(prev => ({ ...prev, [direction]: false }))}
        disabled={!selectedRoute}
      >
        {getArrowSymbol()}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
        
        {/* Header */}
        <div style={{ backgroundColor: '#212529', color: 'white', padding: '15px 20px', borderBottom: '1px solid #333' }}>
          <h4 style={{ margin: 0 }}>Vehicle Tracker Control</h4>
        </div>

        <div style={{ padding: '25px' }}>
          
          {/* 1. Route Selection */}
          <div style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '20px', marginBottom: '25px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>1. Assign Route to Vehicle</label>
            {isLoadingRoutes ? (
              <p style={{ color: '#6c757d', margin: 0 }}>Loading available routes...</p>
            ) : (
              <select 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
                value={selectedRoute?._id || ""} 
                onChange={handleRouteSelect}
              >
                <option value="">-- Choose a Route --</option>
                {routes.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.routeName} ({r.distance} km)
                  </option>
                ))}
              </select>
            )}
            {!selectedRoute && !isLoadingRoutes && (
              <small style={{ color: '#dc3545', display: 'block', marginTop: '10px', fontWeight: '500' }}>⚠️ You must select a route before driving.</small>
            )}
          </div>

          {/* Location Display */}
          <div style={{ marginBottom: '25px' }}>
            <h5 style={{ color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Current Live Coordinates:</h5>
            <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#e9ecef', padding: '12px 20px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '1.1rem', color: '#333' }}>
              <span>Lat: {location.lat.toFixed(6)}</span>
              <span>Lng: {location.lng.toFixed(6)}</span>
            </div>
          </div>

          {/* Conditional Controls */}
          <div style={{ opacity: selectedRoute ? 1 : 0.4, pointerEvents: selectedRoute ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            
            {/* Speed Slider */}
            <div style={{ marginBottom: '30px' }}>
              <h5 style={{ color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>2. Adjust Speed:</h5>
              <input type="range" min="1" max="100" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
              <p style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: '#007bff', fontSize: '1.2rem', margin: '10px 0 0 0' }}>Speed: {speed}</p>
            </div>

            {/* Control Pad */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
              <h5 style={{ color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '15px', alignSelf: 'flex-start' }}>3. Drive Vehicle:</h5>
              <div style={{ marginBottom: '10px' }}>
                <ArrowButton direction="up" isActive={isMoving.up} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <ArrowButton direction="left" isActive={isMoving.left} />
                <div style={{ width: '70px' }}></div> {/* Spacer */}
                <ArrowButton direction="right" isActive={isMoving.right} />
              </div>
              <div>
                <ArrowButton direction="down" isActive={isMoving.down} />
              </div>
            </div>

            {/* Location Update Control */}
            {/* Location Update Control */}
              <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <LocationUpdateControl vehicleId={vehicleId} />
              </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCarController;