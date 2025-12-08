import { useStore } from '../../store';
import { ShaderCanvas } from './ShaderCanvas';
import { NeoTunnelShader } from '../../shaders/NeoTunnelShader';
import { SacredMandalaShader } from '../../shaders/SacredMandalaShader';
import { PsyKaleidoscopeShader } from '../../shaders/PsyKaleidoscopeShader';
import { LiquidOceanShader } from '../../shaders/LiquidOceanShader';
import { CosmicFireShader } from '../../shaders/CosmicFireShader';
import { InterstellarSingularityShader } from '../../shaders/InterstellarSingularityShader';
import { EtherealCloudsShader } from '../../shaders/EtherealCloudsShader';
import { DigitalRainShader } from '../../shaders/DigitalRainShader';
import { AuroraBorealisShader } from '../../shaders/AuroraBorealisShader';

export const FractalManager = () => {
    const currentFractal = useStore((state) => state.currentFractal);

    // New Shader System
    if (currentFractal === 'Tunnel') {
        return <ShaderCanvas key="Tunnel" shader={NeoTunnelShader} />;
    }
    if (currentFractal === 'Mandala') {
        return <ShaderCanvas key="Mandala" shader={SacredMandalaShader} />;
    }
    if (currentFractal === 'Kaleidoscope') {
        return <ShaderCanvas key="Kaleidoscope" shader={PsyKaleidoscopeShader} />;
    }
    if (currentFractal === 'Ocean') {
        return <ShaderCanvas key="Ocean" shader={LiquidOceanShader} />;
    }
    if (currentFractal === 'Fire') {
        return <ShaderCanvas key="Fire" shader={CosmicFireShader} />;
    }
    if (currentFractal === 'Singularity') {
        return <ShaderCanvas key="Singularity" shader={InterstellarSingularityShader} />;
    }
    if (currentFractal === 'Clouds') {
        return <ShaderCanvas key="Clouds" shader={EtherealCloudsShader} />;
    }
    if (currentFractal === 'Rain') {
        return <ShaderCanvas key="Rain" shader={DigitalRainShader} />;
    }
    if (currentFractal === 'Aurora') {
        return <ShaderCanvas key="Aurora" shader={AuroraBorealisShader} />;
    }

    return null;
};
