import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useStore } from '../../store';

export const EffectPipeline = () => {
  const { bloomThreshold, bloomStrength, bloomRadius } = useStore();

  // Keep these hardcoded or add to store later if needed
  const chromaticOffset = 0.004;
  const noiseOpacity = 0.05;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={bloomThreshold}
        mipmapBlur
        intensity={bloomStrength}
        radius={bloomRadius}
      />
      <ChromaticAberration
        offset={[chromaticOffset, chromaticOffset]}
      />
      <Noise
        opacity={noiseOpacity}
        blendFunction={BlendFunction.OVERLAY}
      />
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={1.1}
      />
    </EffectComposer>
  );
};
