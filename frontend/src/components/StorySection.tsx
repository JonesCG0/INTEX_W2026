import { motion } from 'framer-motion';
import CulturalDivider from './CulturalDivider';

const stories = [
  {
    title: "Rooted in Community",
    text: "Beginning with the Hopi tribe in Arizona, Project Haven builds programs grounded in cultural identity, healing traditions, and collective care. Our safehouses are more than shelter — they are spaces where youth reconnect with heritage and hope.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    title: "Expanding Across Nations",
    text: "From the mesas of Arizona to tribal communities across the country, we are building a network of safehouses that honor each nation's unique culture while providing consistent, trauma-informed care.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  },
];

export default function StorySection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Our Story</h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Building bridges between tradition and tomorrow
          </p>
        </motion.div>

        <CulturalDivider variant="step" className="mb-16" />

        <div className="space-y-20">
          {stories.map((story, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}
            >
              <div className="flex-1">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-64 md:h-80 object-cover rounded-xl"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">{story.title}</h3>
                <p className="font-body text-base text-muted-foreground leading-relaxed">{story.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}