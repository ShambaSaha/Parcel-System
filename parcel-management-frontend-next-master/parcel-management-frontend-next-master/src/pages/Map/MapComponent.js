import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to prevent server-side rendering issues
const Map = dynamic(() => import('../../components/Map/MapInitializer'), { ssr: false });

const MapComponent = () => {
  return (
    <div>
      <Map />
    </div>
  );
};

export default MapComponent;
