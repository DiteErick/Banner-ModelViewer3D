# Banner-ModelViewer3D

Banner 3D standalone del **Rack Selectivo** (DITE INC).

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Generar modelos (STL / OBJ / GLB / SVG)

```bash
pnpm rack -- --bahias 2 --niveles 4
```

## Estructura

- `src/components/RackBanner.tsx` — banner completo
- `src/components/RackViewer.tsx` — viewer R3F
- `src/rack/` — geometría paramétrica + export
- `src/config/rackModels.ts` — params del banner
