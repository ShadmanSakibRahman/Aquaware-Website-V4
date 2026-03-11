import { useEffect, useRef, useState, useCallback } from 'react'
import {
  BrowserRouter, Link, NavLink, Outlet, Route, Routes, useLocation, useParams,
} from 'react-router-dom'
import {
  about, contactPage, home, knowledge, knowledgeArticles, privacy, site, terms,
} from './content'

/* ─────────────────────────────────────────────────────
   Water Canvas — realistic surface with sine waves + refraction
───────────────────────────────────────────────────── */
function WaterCanvas() {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const t         = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ripple pool for mouse interaction
    const ripples = []
    function addRipple(x, y) {
      ripples.push({ x, y, r: 0, maxR: 160, opacity: 0.55, speed: 1.8 })
      if (ripples.length > 14) ripples.shift()
    }
    window.addEventListener('mousemove', (e) => {
      if (Math.random() < 0.04) addRipple(e.clientX, e.clientY)
    })

    function draw() {
      t.current += 0.008
      const { width, height } = canvas

      ctx.clearRect(0, 0, width, height)

      // ── Light background gradient ──
      const bg = ctx.createLinearGradient(0, 0, 0, height)
      bg.addColorStop(0,   '#eaf5fc')
      bg.addColorStop(0.5, '#dceef8')
      bg.addColorStop(1,   '#f0f7fc')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, width, height)

      // ── Soft radial glow ──
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.28, 0, width * 0.5, height * 0.28, width * 0.65)
      glow.addColorStop(0,   'rgba(160,220,240,0.2)')
      glow.addColorStop(0.5, 'rgba(180,230,245,0.1)')
      glow.addColorStop(1,   'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, width, height)

      // ── Layered water surface waves ──
      const layers = [
        { amp: 55, freq: 0.0055, speed: 1.0, y: height * 0.35, alpha: 0.06, color: '#6cc4e0' },
        { amp: 38, freq: 0.008,  speed: 1.4, y: height * 0.42, alpha: 0.07, color: '#4db8d4' },
        { amp: 28, freq: 0.012,  speed: 0.9, y: height * 0.50, alpha: 0.08, color: '#3aafc8' },
        { amp: 18, freq: 0.018,  speed: 1.7, y: height * 0.56, alpha: 0.07, color: '#28a5be' },
        { amp: 12, freq: 0.025,  speed: 2.1, y: height * 0.62, alpha: 0.05, color: '#1e9bb5' },
      ]

      layers.forEach((layer) => {
        ctx.beginPath()
        ctx.moveTo(0, height)
        for (let x = 0; x <= width; x += 3) {
          const wave1 = Math.sin(x * layer.freq + t.current * layer.speed) * layer.amp
          const wave2 = Math.sin(x * layer.freq * 1.7 + t.current * layer.speed * 0.6) * (layer.amp * 0.4)
          const wave3 = Math.sin(x * layer.freq * 0.4 + t.current * layer.speed * 1.3) * (layer.amp * 0.25)
          ctx.lineTo(x, layer.y + wave1 + wave2 + wave3)
        }
        ctx.lineTo(width, height)
        ctx.closePath()

        const fill = ctx.createLinearGradient(0, layer.y - layer.amp, 0, layer.y + layer.amp * 2)
        fill.addColorStop(0, layer.color + '28')
        fill.addColorStop(1, 'transparent')
        ctx.fillStyle = fill
        ctx.fill()

        // wave crest shimmer line
        ctx.beginPath()
        ctx.moveTo(0, 0)
        for (let x = 0; x <= width; x += 3) {
          const wave1 = Math.sin(x * layer.freq + t.current * layer.speed) * layer.amp
          const wave2 = Math.sin(x * layer.freq * 1.7 + t.current * layer.speed * 0.6) * (layer.amp * 0.4)
          const wave3 = Math.sin(x * layer.freq * 0.4 + t.current * layer.speed * 1.3) * (layer.amp * 0.25)
          ctx.lineTo(x, layer.y + wave1 + wave2 + wave3)
        }
        ctx.strokeStyle = layer.color + Math.round(layer.alpha * 255).toString(16).padStart(2, '0')
        ctx.lineWidth = 1.5
        ctx.stroke()
      })

      // ── Caustic light patterns ──
      for (let i = 0; i < 9; i++) {
        const cx = (Math.sin(t.current * 0.3 + i * 1.1) * 0.5 + 0.5) * width
        const cy = (Math.sin(t.current * 0.2 + i * 0.7) * 0.5 + 0.5) * height * 0.7
        const cr = 60 + Math.sin(t.current * 0.5 + i) * 30
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr)
        cg.addColorStop(0,   `rgba(100,200,230,${0.04 + Math.sin(t.current + i) * 0.015})`)
        cg.addColorStop(1,   'transparent')
        ctx.fillStyle = cg
        ctx.beginPath()
        ctx.ellipse(cx, cy, cr, cr * 0.5, Math.sin(t.current * 0.4 + i) * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Floating light particles ──
      for (let i = 0; i < 24; i++) {
        const px = ((Math.sin(t.current * 0.15 + i * 2.3) * 0.5 + 0.5) * width)
        const py = ((Math.sin(t.current * 0.12 + i * 1.7) * 0.5 + 0.5) * height * 0.85)
        const pr = 1.2 + Math.sin(t.current + i * 0.9) * 0.6
        const alpha = (0.18 + Math.sin(t.current * 0.7 + i) * 0.12) * (i % 4 === 0 ? 1.3 : 1)
        ctx.beginPath()
        ctx.arc(px, py, pr, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(60, 180, 210, ${Math.max(0, alpha)})`
        ctx.fill()
      }

      // ── Mouse ripples ──
      ripples.forEach((ripple, idx) => {
        ripple.r += ripple.speed
        ripple.opacity -= 0.012
        if (ripple.opacity <= 0 || ripple.r >= ripple.maxR) {
          ripples.splice(idx, 1)
          return
        }
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(60, 180, 210, ${ripple.opacity * 0.35})`
        ctx.lineWidth = 1
        ctx.stroke()
        // inner
        if (ripple.r > 20) {
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.r * 0.55, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(80, 195, 225, ${ripple.opacity * 0.18})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })

      // ── Subtle grid / depth lines ──
      ctx.strokeStyle = 'rgba(100,190,220,0.04)'
      ctx.lineWidth = 0.5
      for (let gx = 0; gx < width; gx += 90) {
        ctx.beginPath()
        ctx.moveTo(gx, 0)
        ctx.lineTo(gx, height)
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} id='water-canvas' aria-hidden='true' />
}

/* ─────────────────────────────────────────────────────
   Scroll reveal hook
───────────────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  })
}

/* ─────────────────────────────────────────────────────
   App root
───────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter basename='/Aquaware-Website-V4'>
      <Routes>
        <Route element={<SiteShell />}>
          <Route path='/'                       element={<HomePage />} />
          <Route path='/about'                  element={<AboutPage />} />
          <Route path='/knowledge'              element={<KnowledgePage />} />
          <Route path='/knowledge/:id'          element={<KnowledgeArticlePage />} />
          <Route path='/contact'                element={<ContactPage />} />
          <Route path='/privacy-policies'       element={<LegalPage data={privacy} />} />
          <Route path='/terms-and-conditions'   element={<LegalPage data={terms} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

/* ─────────────────────────────────────────────────────
   Shell
───────────────────────────────────────────────────── */
function SiteShell() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  // mouse parallax
  useEffect(() => {
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      document.documentElement.style.setProperty('--mouse-x', x)
      document.documentElement.style.setProperty('--mouse-y', y)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div className='site-root'>
      <WaterCanvas />

      <header className={`top-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to='/' className='brand'>
          <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
            <circle cx='14' cy='14' r='13' stroke='#00a5b5' strokeWidth='1.5' />
            <path d='M7 18c2-4 5-8 7-8s5 4 7 8' stroke='#00a5b5' strokeWidth='1.5' strokeLinecap='round' />
            <path d='M9 16c1.5-2.5 3-4 5-4s3.5 1.5 5 4' stroke='#0b7dda' strokeWidth='1' strokeLinecap='round' opacity='0.7' />
          </svg>
          <span className='brand-wordmark'>Aqua<span>Ware</span></span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {site.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='nav-actions'>
          <span className='lang-btn'>NL / EN</span>
          <Link to='/contact' className='nav-cta'>Get in touch</Link>
          <button
            className='menu-btn'
            onClick={() => setMenuOpen((s) => !s)}
            aria-label='Toggle menu'
          >
            <span style={menuOpen ? { transform: 'rotate(45deg) translate(4px, 5px)' } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: 'rotate(-45deg) translate(4px, -5px)' } : {}} />
          </button>
        </div>
      </header>

      <main key={location.pathname} className='page-enter'>
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Home Page
───────────────────────────────────────────────────── */
function HomePage() {
  useReveal()
  const [activeFunc, setActiveFunc] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const WAVE_HEIGHTS = [55, 70, 42, 60, 48, 65, 38, 72, 44, 58, 50, 66, 40, 75, 45]

  return (
    <>
      {/* ── Hero ── */}
      <section className='hero page-wrap'>
        <div className='hero-grid'>
          <div>
            <div className='eyebrow'>
              <span className='eyebrow-dot' />
              {home.hero.badge}
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: home.hero.titleHtml || home.hero.title }} />
            <p className='hero-sub'>{home.hero.subtitle}</p>
            <div className='audience-chips'>
              {home.hero.audiences.map((a) => <span key={a}>{a}</span>)}
            </div>
            <div className='btn-row'>
              <a href='#contact-form' className='btn-primary'>
                {home.hero.cta}
                <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M2 7h10M8 3l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
              </a>
              <Link to='/knowledge' className='btn-ghost'>Explore knowledge</Link>
            </div>
          </div>

          <div className='hero-visual'>
            <div className='hero-badge'>ISO 14001 certified</div>
            <div className='hero-card-wrap'>
              <div className='hero-glass-card'>
                <div className='hero-stat-row'>
                  <div className='hero-stat'><strong>98%</strong><span>Uptime</span></div>
                  <div className='hero-stat'><strong>60+</strong><span>Clients</span></div>
                  <div className='hero-stat'><strong>24/7</strong><span>Monitoring</span></div>
                </div>
                <div className='hero-wave-vis'>
                  <div className='wave-bars'>
                    {WAVE_HEIGHTS.map((h, i) => (
                      <div
                        key={i}
                        className='wave-bar'
                        style={{
                          height: `${h}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${1.6 + i * 0.08}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--dim)' }}>Real-time monitoring dashboard — all your water data in one place</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Water Divider ── */}
      <div className='page-wrap'><div className='water-divider' /></div>

      {/* ── Pressure / Problem ── */}
      <section className='section page-wrap'>
        <div className='pressure-split'>
          <div className='reveal'>
            <span className='section-label'>The Challenge</span>
            <div className='section-intro'>
              <h2>{home.pressure.titleA}<br />{home.pressure.titleB}</h2>
              <p>{home.pressure.description}</p>
            </div>
            <Link to='/knowledge' className='btn-ghost' style={{ marginTop: '0.5rem' }}>
              {home.pressure.cta}
            </Link>
          </div>
          <div className='pressure-right reveal'>
            <div className='bullet-list'>
              {home.pressure.bullets.map((b) => (
                <div key={b} className='bullet-item'>
                  <span className='bullet-icon'>
                    <svg width='10' height='10' viewBox='0 0 10 10' fill='none'><path d='M2 5l2 2 4-4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round'/></svg>
                  </span>
                  <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Functionalities ── */}
      <section className='section page-wrap' id='expert'>
        <div className='section-intro center reveal'>
          <span className='section-label'>Platform</span>
          <h2>{home.functionalities.title}</h2>
          <p>{home.functionalities.subtitle}</p>
        </div>
        <div className='func-grid'>
          <div className='func-tabs'>
            {home.functionalities.items.map((item, i) => (
              <button
                key={item.title}
                className={`func-tab${i === activeFunc ? ' active' : ''}`}
                onClick={() => setActiveFunc(i)}
              >
                <h3>{item.title}</h3>
              </button>
            ))}
          </div>
          <div className='func-detail reveal'>
            <h3>{home.functionalities.items[activeFunc].title}</h3>
            <p>{home.functionalities.items[activeFunc].description}</p>
            <div className='func-tags'>
              {home.functionalities.items[activeFunc].tags.map((tag) => (
                <span key={tag} className='func-tag'>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Support cards ── */}
      <section className='section page-wrap'>
        <div className='section-intro center reveal'>
          <span className='section-label'>Our Support</span>
          <h2>{home.support.title}</h2>
          <p>{home.support.subtitle}</p>
        </div>
        <div className='cards-grid-4'>
          {home.support.cards.map((card, i) => (
            <div key={card.title} className='info-card reveal' style={{ transitionDelay: `${i * 0.07}s` }}>
              <div className='card-num'>0{i + 1}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
        <div className='highlight-panel reveal'>
          <div className='highlight-icon'>💧</div>
          <p>"{home.support.quote}"</p>
        </div>
      </section>

      {/* ── Funnel ── */}
      <section className='section page-wrap'>
        <div className='funnel-split'>
          <div className='reveal'>
            <span className='section-label'>How it works</span>
            <div className='section-intro'>
              <h2>{home.funnel.title}</h2>
              <p>{home.funnel.description}</p>
            </div>
            <a href='#contact-form' className='btn-primary' style={{ marginTop: '0.5rem' }}>
              {home.funnel.cta}
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M2 7h10M8 3l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
            </a>
          </div>
          <div className='funnel-panel reveal'>
            <div className='step-tabs'>
              {home.funnel.steps.map((step, i) => (
                <button
                  key={step}
                  className={`step-tab${i === activeStep ? ' active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  {step}
                </button>
              ))}
            </div>
            <div className='band-list'>
              {home.funnel.bands.map((band, i) => (
                <div
                  key={band.title}
                  className={`band-row${i === activeStep ? ' active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div>
                    <strong>{band.title}</strong>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--dim)', marginTop: '2px' }}>{band.subtitle}</span>
                  </div>
                  <span className='band-arrow'>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Value / Newsletter ── */}
      <section className='section page-wrap'>
        <div className='section-intro center reveal'>
          <span className='section-label'>Stay informed</span>
          <h2>{home.value.title}</h2>
          <p>{home.value.subtitle}</p>
        </div>
        <div className='newsletter-panel reveal'>
          <h3>{home.value.newsletterTitle}</h3>
          <p>{home.value.newsletterInfo}</p>
          <form className='newsletter-form' onSubmit={(e) => e.preventDefault()}>
            <input type='email' placeholder='your@email.com' aria-label='Email address' />
            <button type='submit'>{home.value.newsletterCta}</button>
          </form>
          <small>{home.value.newsletterPrivacy}</small>
        </div>
        <div className='cards-grid-3'>
          {home.value.cards.map((card, i) => (
            <div key={card.title} className='info-card reveal' style={{ transitionDelay: `${i * 0.08}s` }}>
              <div className='card-num'>0{i + 1}</div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <ContactSection />
    </>
  )
}

/* ─────────────────────────────────────────────────────
   About Page
───────────────────────────────────────────────────── */
function AboutPage() {
  useReveal()
  return (
    <>
      <div className='page-wrap'>
        <div className='about-hero reveal'>
          <span className='section-label'>Who we are</span>
          <h1>{about.title}</h1>
          <p style={{ maxWidth: '50rem', fontSize: '1.15rem' }}>{about.intro}</p>
        </div>

        <div className='water-divider' />

        <section className='section'>
          <div className='cards-grid-2' style={{ marginBottom: '1.5rem' }}>
            <div className='info-card reveal'>
              <h3>{about.whatTitle}</h3>
              <p>{about.whatBody}</p>
            </div>
            <div className='info-card reveal' style={{ transitionDelay: '0.1s' }}>
              <h3>{about.goalTitle}</h3>
              <p>{about.goalBody}</p>
            </div>
          </div>
        </section>

        <section className='section'>
          <div className='section-intro center reveal'>
            <span className='section-label'>Our Foundation</span>
            <h2>{about.powerTitle}</h2>
            <p>{about.powerBody}</p>
          </div>
          <div className='pillar-grid'>
            {about.pillars.map((pillar, i) => (
              <div key={pillar.title} className='pillar-card reveal' style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className='pillar-num'>0{i + 1}</div>
                <h3>{pillar.title}</h3>
                <p>{pillar.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='section'>
          <div className='cta-strip reveal'>
            <span className='section-label'>{about.ctaTitle}</span>
            <h2 style={{ marginBottom: '0.85rem' }}>{about.ctaTitle}</h2>
            <p>{about.ctaBody}</p>
            <a href='#contact-form' className='btn-primary' style={{ marginTop: '1rem' }}>
              {about.cta}
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M2 7h10M8 3l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
            </a>
          </div>
        </section>
      </div>
      <ContactSection />
    </>
  )
}

/* ─────────────────────────────────────────────────────
   Knowledge Page
───────────────────────────────────────────────────── */
const KNOWLEDGE_IMAGES = [
  '/assets/rwzi-zwolle-2.jpg',
  '/assets/Lozingen_afvalstoffen_bedreigen_waterkwaliteit_-_Drinkwaterplatform.jpeg',
  '/assets/shutterstock_1926382847-1.jpg',
  '/assets/Handhaving.jpg',
  '/assets/de-zuid-willemsvaart-vervuild-afvalwater-dreigt-via-de-rioolwaterzuivering-van-weert-in-dit-kanaal-te-belanden.webp',
]

function KnowledgePage() {
  useReveal()
  return (
    <div className='page-wrap'>
      <div className='about-hero reveal'>
        <span className='section-label'>Knowledge Hub</span>
        <h1>{knowledge.title}</h1>
        <p style={{ maxWidth: '42rem', fontSize: '1.05rem' }}>{knowledge.subtitle}</p>
      </div>
      <div className='knowledge-grid'>
        {knowledge.list.map((item, i) => (
          <Link to={`/knowledge/${item.id}`} key={item.id} className='knowledge-card reveal' style={{ transitionDelay: `${i * 0.08}s` }}>
            <img
              className='knowledge-card-img'
              src={`${import.meta.env.BASE_URL}${KNOWLEDGE_IMAGES[i].slice(1)}`}
              alt={item.title}
              loading='lazy'
            />
            <div className='knowledge-card-body'>
              <h3>{item.title}</h3>
              <p>{item.quote}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Knowledge Article Page
───────────────────────────────────────────────────── */
function KnowledgeArticlePage() {
  useReveal()
  const { id } = useParams()
  const article = knowledgeArticles[id]

  if (!article) {
    return (
      <div className='page-wrap'>
        <div className='about-hero'>
          <h1>Article not found</h1>
          <Link to='/knowledge' className='btn-ghost' style={{ marginTop: '1rem' }}>← Back to Knowledge</Link>
        </div>
      </div>
    )
  }

  return (
    <div className='page-wrap'>
      <div className='article-header reveal'>
        <span className='section-label'>Knowledge</span>
        <h1>{article.title}</h1>
        <div className='btn-row' style={{ marginTop: '1.25rem' }}>
          <Link to='/knowledge' className='btn-ghost'>← Back</Link>
          <button className='btn-ghost'>Share Article</button>
        </div>
      </div>

      <div className='article-content'>
        {article.sections.map((section, i) => (
          <div key={section.heading} className='article-section reveal' style={{ transitionDelay: `${i * 0.07}s` }}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
          </div>
        ))}
        <div className='article-section reveal'>
          <h2>Related Articles</h2>
          <div className='related-links'>
            {article.related.map((relId) => (
              <Link key={relId} to={`/knowledge/${relId}`} className='related-link'>
                {knowledgeArticles[relId]?.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Contact Section (shared)
───────────────────────────────────────────────────── */
function ContactSection() {
  useReveal()
  return (
    <section className='section page-wrap' id='contact-form'>
      <div className='section-intro reveal'>
        <span className='section-label'>Contact</span>
        <h2>{contactPage.title}</h2>
        <p>{contactPage.subtitle}</p>
      </div>
      <div className='contact-grid'>
        <div className='contact-info-card reveal'>
          <div className='contact-info-item'>
            <div className='label'>Email</div>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </div>
          <div className='contact-info-item'>
            <div className='label'>Phone</div>
            <a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a>
          </div>
          <div className='contact-info-item'>
            <div className='label'>Office</div>
            {site.contact.locations.map((loc) => (
              <p key={loc} style={{ margin: '0.15rem 0' }}>{loc}</p>
            ))}
          </div>
        </div>
        <div className='contact-form-card reveal'>
          <h3>{contactPage.formTitle}</h3>
          <p>{contactPage.formSubtitle}</p>
          <form className='form-grid' onSubmit={(e) => e.preventDefault()}>
            {contactPage.fields.map((field, i) => (
              <div key={field} className='form-field'>
                <label>{field}</label>
                {i === 2
                  ? <textarea placeholder={`Enter your ${field.toLowerCase()}`} rows='5' />
                  : <input type={i === 1 ? 'email' : 'text'} placeholder={`Enter your ${field.toLowerCase()}`} />}
              </div>
            ))}
            <a href='#' className='btn-primary' style={{ marginTop: '0.3rem', width: 'fit-content' }}
              onClick={(e) => e.preventDefault()}>
              {contactPage.cta}
              <svg width='14' height='14' viewBox='0 0 14 14' fill='none'><path d='M2 7h10M8 3l4 4-4 4' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/></svg>
            </a>
          </form>
        </div>
      </div>
    </section>
  )
}

function ContactPage() {
  return <ContactSection />
}

/* ─────────────────────────────────────────────────────
   Legal Page
───────────────────────────────────────────────────── */
function LegalPage({ data }) {
  useReveal()
  return (
    <div className='page-wrap'>
      <div className='legal-page'>
        <div className='about-hero reveal'>
          <span className='section-label'>Legal</span>
          <h1>{data.title}</h1>
          <p className='updated'>{data.updated}</p>
        </div>
        {data.sections.map((section, i) => (
          <div key={section.title} className='legal-section reveal' style={{ transitionDelay: `${i * 0.05}s` }}>
            <h2>{section.title}</h2>
            {section.text && section.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
            {section.list && (
              <ul>
                {section.list.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Footer
───────────────────────────────────────────────────── */
function SiteFooter() {
  return (
    <footer className='footer'>
      <div className='footer-inner'>
        <div className='footer-top'>
          <div className='footer-brand'>
            <Link to='/' style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width='24' height='24' viewBox='0 0 28 28' fill='none'>
                <circle cx='14' cy='14' r='13' stroke='#00a5b5' strokeWidth='1.5' />
                <path d='M7 18c2-4 5-8 7-8s5 4 7 8' stroke='#00a5b5' strokeWidth='1.5' strokeLinecap='round' />
              </svg>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                Aqua<span style={{ color: 'var(--aqua)' }}>Ware</span>
              </span>
            </Link>
            <p>{site.brand.tagline}</p>
          </div>
          <div className='footer-col'>
            <h5>Platform</h5>
            <ul>
              <li><a href='/#expert'>Central Database</a></li>
              <li><a href='/#expert'>Dashboards</a></li>
              <li><a href='/#expert'>Priority Lists</a></li>
              <li><a href='/#expert'>Company Reports</a></li>
              <li><a href='/#expert'>Heatmaps</a></li>
            </ul>
          </div>
          <div className='footer-col'>
            <h5>Company</h5>
            <ul>
              <li><Link to='/about'>About</Link></li>
              <li><Link to='/knowledge'>Knowledge</Link></li>
              <li><Link to='/contact'>Contact</Link></li>
            </ul>
          </div>
          <div className='footer-col'>
            <h5>Contact</h5>
            <ul>
              <li><a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
              <li><a href={`tel:${site.contact.phone}`}>{site.contact.phoneDisplay}</a></li>
              {site.contact.locations.map((loc) => <li key={loc}><span>{loc}</span></li>)}
            </ul>
          </div>
        </div>
        <div className='footer-bottom'>
          <p>© {new Date().getFullYear()} AquaWare B.V. All rights reserved.</p>
          <div className='footer-links'>
            <Link to='/privacy-policies'>Privacy Policy</Link>
            <Link to='/terms-and-conditions'>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
