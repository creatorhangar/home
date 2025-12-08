declare module 'upscaler' {
    export interface UpscalerOptions {
        model?: string;
        scale?: number;
    }

    export interface ExecuteOptions {
        output?: 'base64' | 'tensor';
        patchSize?: number;
        padding?: number;
        progress?: (amount: number) => void;
    }

    export default class Upscaler {
        constructor(options?: UpscalerOptions);
        execute(image: ImageBitmap | HTMLImageElement, options?: ExecuteOptions): Promise<string>; // Returns base64 string by default or tensor
        dispose(): Promise<void>;
    }
}
