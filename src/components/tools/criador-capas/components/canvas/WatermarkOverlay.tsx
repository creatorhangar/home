import { useStore } from '../../store';
import { Text } from '@react-three/drei';

export const WatermarkOverlay = () => {
    const watermarkText = useStore((state) => state.watermarkText);
    const showWatermark = useStore((state) => state.showWatermark);

    if (!showWatermark || !watermarkText) return null;

    return (
        <Text
            position={[0, -1.8, 1]} // Bottom center
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="bottom"
            fillOpacity={0.5}
        >
            {watermarkText.toUpperCase()}
        </Text>
    );
};
