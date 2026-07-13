import RackViewer from './RackViewer';
import { RACK_COLORS, RACK_MODELS } from '../config/rackModels';

const HERO_BACKGROUND_IMAGE =
  'https://img.frigoespacios.com/images/1200/22947749/Slider-Frigo-01-pj0CnOKO0L5X4mSnbBUi0g.JPG';

export default function RackBanner() {
  const model = RACK_MODELS[0];
  const p = model.params;

  return (
    <section className="hero hero--rack" aria-label="Banner Rack Selectivo 3D">
      <div
        className="hero__bg"
        style={{ backgroundImage: `url(${HERO_BACKGROUND_IMAGE})` }}
        aria-hidden
      />
      <div className="hero__grade" aria-hidden />
      <div className="hero__bloom" aria-hidden />
      <div className="hero__grain" aria-hidden />
      <div className="hero__frame" aria-hidden />

      <p className="hero__watermark" aria-hidden>
        RACK
      </p>

      <header className="hero__top">
        <p className="hero__brand">
          DITE <span>INC</span>
        </p>
        <p className="hero__top-meta">Almacenaje · Selectivo</p>
      </header>

      <div className="hero__stage">
        <div className="hero__stage-glow" aria-hidden />
        <div className="hero__viewer">
          <RackViewer
            key={model.id}
            params={p}
            width="100%"
            height="100%"
            defaultZoom={model.defaultZoom}
            defaultRotationX={model.defaultRotationX}
            defaultRotationY={model.defaultRotationY}
            autoOscillate
            oscillateDegrees={8}
            oscillateSpeed={0.35}
          />
        </div>
        <div className="hero__plinth" aria-hidden />
        <p className="hero__hint">Arrastra · Acerca · Explora</p>
      </div>

      <footer className="hero__bottom">
        <div className="hero__copy">
          <div className="hero__kicker-row">
            <span className="hero__rule" aria-hidden />
            <p className="hero__kicker">Sistema selectivo</p>
          </div>
          <h1 className="hero__title">
            {model.title}
            <em> 3D</em>
          </h1>
          <p className="hero__lead">{model.description}</p>
          <ul className="hero__specs" aria-label="Parámetros">
            <li>
              {p.bahias} bahías
            </li>
            <li>{p.niveles} niveles</li>
            <li>
              {p.anchoBahia} × {p.profundidad}
            </li>
            <li>H {p.altura}</li>
          </ul>
          <div className="hero__swatches" aria-label="Colores">
            <span className="hero__swatch" style={{ background: RACK_COLORS.montantes }} title="Montantes" />
            <span className="hero__swatch-label">Montantes</span>
            <span className="hero__swatch" style={{ background: RACK_COLORS.vigas }} title="Vigas" />
            <span className="hero__swatch-label">Vigas</span>
          </div>
        </div>

        <div className="hero__actions">
          <button type="button" className="hero__cta hero__cta--primary">
            <span>Ver catálogo racks</span>
            <svg viewBox="0 0 24 24" aria-hidden className="hero__cta-icon">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </button>
          <button type="button" className="hero__cta hero__cta--ghost">
            Hablar con un asesor
          </button>
        </div>
      </footer>
    </section>
  );
}
