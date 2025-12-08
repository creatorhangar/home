# Video Template System

This directory contains the video generation system for the Etsy Showcase feature.

## Structure

- `types.ts`: Defines the `VideoTemplate` interface and types.
- `registry.ts`: The central registry of all available templates. Add new templates here.
- `components/`: Shared components like `ThreeCanvas`.
- `utils/`: Helper functions (e.g., texture loading).
- `css/`: CSS/Framer Motion based templates (Lightweight).
- `three/`: Three.js based templates (Advanced/Medium weight).

## How to add a new template

1. **Create the Component**:
   - For CSS/Framer: Create a new file in `css/` (e.g., `MyNewTemplate.tsx`).
   - For Three.js: Create a new file in `three/` (e.g., `MyThreeTemplate.tsx`). Use `ThreeCanvas` for boilerplate.

2. **Implement the Interface**:
   Your component must accept `VideoTemplateProps`:
   ```typescript
   interface VideoTemplateProps {
     images: string[];
     isPlaying: boolean;
     width?: number;
     height?: number;
     // ...
   }
   ```

3. **Register the Template**:
   Import your component in `registry.ts` and add it to the `videoTemplates` array:
   ```typescript
   {
     id: 'my-new-template',
     name: 'My New Template',
     description: 'Description...',
     category: 'static-motion',
     duration: 10,
     idealImageCount: [5, 10],
     tags: ['new', 'cool'],
     component: MyNewTemplate
   }
   ```

## Dependencies

- `framer-motion`: For CSS animations.
- `three`: For 3D templates.
- `animejs`: (Optional) For complex timelines.
