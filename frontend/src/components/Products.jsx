import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { money } from '../api';
import Reveal from './Reveal';

export function SectionHeading({ accent, title, subtitle, kicker }) {
  return <div className="section-heading">
    {kicker && <span className="section-kicker">{kicker}</span>}
    <h2><span>{accent}</span> {title}</h2>
    <div className="heading-rule"/>
    {subtitle && <p>{subtitle}</p>}
  </div>;
}

export function ProductCard({ product }) {
  return <Link className="product-card" to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
    <div className="product-picture">
      <img src={product.images?.[0] || ''} alt={product.name} loading="lazy" decoding="async" />
      {product.bestseller && <span className="product-tag">BESTSELLER</span>}
      <span className="product-quick"><span>EXPLORE PIECE</span><ArrowUpRight size={17}/></span>
    </div>
    <div className="product-meta">
      <p>{product.name}</p>
      <strong>{money(product.price)}</strong>
    </div>
  </Link>;
}
export function ProductsGrid({products}) {
  return <Reveal className="grid-reveal"><div className="products-grid">{products.map(p => <ProductCard key={p._id} product={p}/>)}</div></Reveal>;
}
export function Empty({ title, detail, action }) {
  return <div className="empty"><div className="empty-ring">✧</div><h3>{title}</h3><p>{detail}</p>{action && <Link className="button dark" to="/collection">Explore collections →</Link>}</div>;
}
