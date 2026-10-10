import { BRAND_STORY, PRODUCT } from '../data/content';
import { Logo } from './Logo';
import { SectionHead } from './SectionHead';

export function BrandStory() {
  const [lead, ...rest] = BRAND_STORY.paragraphs;
  return (
    <section className="section section--white" id="story" aria-labelledby="story-title">
      <div className="container">
        <SectionHead eyebrow="BRAND STORY" title={BRAND_STORY.title} lead={`${PRODUCT.nameFa} (${PRODUCT.nameEn}) — استعاره «شبکه آوندی»`} />
        <div className="story">
          <div className="story__mark" aria-hidden="true">
            <Logo />
          </div>
          <article className="card story__card">
            <p className="lead-line">{lead}</p>
            {rest.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </article>
        </div>
      </div>
    </section>
  );
}
