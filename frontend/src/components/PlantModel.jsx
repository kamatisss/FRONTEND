import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';

function PlantModel({ url, scale = 1 }) {
  const { scene } = useGLTF(url);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      scale={[scale, scale, scale]}
      rotation={[0, 0, 0]} // keep upright
    />
  );
}

export default PlantModel;