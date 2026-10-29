import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, RefreshCw, ShieldCheck, Headphones, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SectionHeading, ProductsGrid } from '../components/Products';
import Reveal from '../components/Reveal';

const categories = [
  { name: 'Women', subtitle: 'Effortless expression', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Men', subtitle: 'Everyday essentials', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Kids', subtitle: 'Little things, big style', image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1000&q=85' }
];

export default function Home() {
  const { products, loading } = useStore();
  const latest = products.slice(0, 10);
  const best = products.filter(p => p.bestseller).slice(0, 5);

  return <div className="container home">
    <section className="hero" aria-label="New season collection">
      <div className="hero-copy">
        <span className="hero-eyebrow"><span className="hero-eyebrow-line"/> THE NEW SEASON / 2026</span>
        <h1>Wear what<br/><em>moves you.</em></h1>
        <p>Considered essentials. Beautiful details. A wardrobe that feels entirely your own.</p>
        <Link to="/collection" className="hero-main-action">EXPLORE THE COLLECTION <span><ArrowUpRight size={20}/></span></Link>
        <div className="hero-bottom"><span>01 / THE FOREVER EDIT</span><span>SCROLL TO DISCOVER ↓</span></div>
        <div className="hero-ambient hero-ambient-one" aria-hidden="true"/><div className="hero-ambient hero-ambient-two" aria-hidden="true"/>
      </div>
      <div className="hero-image">
        <img src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1300&q=90" alt="Editorial photo of contemporary fashion" fetchPriority="high" />
        <span className="hero-image-pill"><Sparkles size={14}/> STYLE BEYOND SEASONS</span>
        <div className="hero-image-text">THE MODERN EDIT / 26</div>
      </div>
    </section>

    <div className="brand-marquee" aria-label="Timeless pieces, modern perspective"><div className="marquee-track" aria-hidden="true">{Array.from({length:4}, (_, i) => <span key={i}>TIMELESS PIECES <b>✳</b> MODERN PERSPECTIVE <b>✳</b> YOUR EVERYDAY EDIT <b>✳</b></span>)}</div></div>

    <Reveal as="section" className="categories-section">
      <div className="category-intro"><div><span className="section-kicker">FIND YOUR FAVORITES</span><h2>Style, on <em>your terms.</em></h2></div><p>Explore everyday looks and feel-good favorites, selected for every chapter of life.</p></div>
      <div className="category-grid">
        {categories.map(({ name, subtitle, image }, i) => <Link to={`/collection?category=${encodeURIComponent(name)}`} className="category-card" key={name} style={{'--card-i':i}}>
          <img src={image} alt={`${name}'s fashion collection`} loading="lazy" decoding="async" />
          <div className="category-card-overlay"><span>0{i+1} / EXPLORE</span><div><h3>{name}</h3><span className="category-arrow"><ArrowUpRight size={21}/></span></div><p>{subtitle}</p></div>
        </Link>)}
      </div>
    </Reveal>

    <section className="home-section">
      <Reveal><SectionHeading kicker="HANDPICKED FOR YOU" accent="LATEST" title="COLLECTIONS" subtitle="Fresh finds, thoughtfully curated. Discover what’s new in the world of FOREVER."/></Reveal>
      {loading ? <div className="loading-products" role="status">Discovering the latest pieces…</div> : <ProductsGrid products={latest}/>} 
      <Reveal className="center section-action"><Link className="button outline" to="/collection">EXPLORE ALL PIECES <ArrowRight size={17}/></Link></Reveal>
    </section>

    <Reveal as="section" className="editorial">
      <div className="editorial-img"><img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1250&q=85" alt="Curated contemporary fashion"/><span>THE ART OF GETTING DRESSED</span></div>
      <div className="editorial-copy"><span className="overline">THE FOREVER POINT OF VIEW</span><h2>Less ordinary.<br/><i>More you.</i></h2><p>Great style isn't about keeping up. It's about finding pieces that feel right, every single day.</p><Link className="button dark" to="/collection">DISCOVER THE EDIT <ArrowRight size={17}/></Link><div className="editorial-note">MADE FOR YOUR EVERYDAY MOMENTS — FOREVER.</div></div>
    </Reveal>

    <section className="home-section best-sellers-section">
      <Reveal><SectionHeading kicker="THE ONES YOU LOVE" accent="BEST" title="SELLERS" subtitle="The favorites you keep coming back to, season after season." /></Reveal>
      {loading ? <div className="loading-products" role="status">Loading favorites…</div> : <ProductsGrid products={best.length ? best : latest.slice(0,5)} />}
    </section>

    <Reveal as="section" className="quote-banner">
      <span className="overline">A LITTLE REMINDER</span>
      <h2>Be yourself. <em>Beautifully.</em></h2>
      <p>Style starts with the confidence to make it your own.</p>
      <Link to="/collection" className="quote-link">FIND YOUR STYLE <ArrowUpRight size={18}/></Link>
    </Reveal>

    <Reveal as="section" className="perks">
      <div><span className="perk-icon"><RefreshCw size={29} strokeWidth={1.35}/></span><h4>Easy exchanges</h4><p>Thoughtful service, every step of the way</p></div>
      <div><span className="perk-icon"><ShieldCheck size={29} strokeWidth={1.35}/></span><h4>Secure checkout</h4><p>Protected payments with Stripe when enabled</p></div>
      <div><span className="perk-icon"><Headphones size={29} strokeWidth={1.35}/></span><h4>Customer support</h4><p>We're here when you need a hand</p></div>
    </Reveal>
    <Reveal as="section" className="newsletter"><span className="overline">THE GOOD STUFF, DELIVERED</span><h2>Stay in the <em>loop.</em></h2><p>New collections, fresh inspiration, and more. Subscription is a demo placeholder.</p><form onSubmit={e=>{e.preventDefault();window.alert('Newsletter signup is not configured in this demo.')}}><input type="email" placeholder="Your email address" aria-label="Email for newsletter" required/><button type="submit">JOIN THE LIST <ArrowRight size={16}/></button></form></Reveal>
  </div>;
}
