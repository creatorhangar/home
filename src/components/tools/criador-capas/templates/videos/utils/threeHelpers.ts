import * as THREE from 'three';

export const loadTextures = async (urls: string[]): Promise<THREE.Texture[]> => {
    console.log("Starting texture load for:", urls.length, "images");
    const loader = new THREE.TextureLoader();

    // Load each texture independently
    const promises = urls.map(url => {
        return new Promise<THREE.Texture | null>((resolve) => {
            loader.load(
                url,
                (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    texture.generateMipmaps = false;
                    resolve(texture);
                },
                undefined,
                (err) => {
                    console.error("Error loading texture:", url, err);
                    resolve(null); // Resolve with null instead of rejecting
                }
            );
        });
    });

    const results = await Promise.all(promises);
    // Filter out nulls
    const textures = results.filter((t): t is THREE.Texture => t !== null);

    if (textures.length === 0) {
        console.warn("No textures loaded successfully");
    } else {
        console.log(`Loaded ${textures.length}/${urls.length} textures`);
    }

    return textures;
};

export const createFullScreenQuad = (material: THREE.ShaderMaterial) => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
};
