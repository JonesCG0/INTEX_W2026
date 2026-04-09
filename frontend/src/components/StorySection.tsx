import { motion } from 'framer-motion';
import CulturalDivider from './CulturalDivider';

const stories = [
  {
    title: "Rooted in Hopi Community",
    text: "Project Haven starts by supporting Hopi-serving safehouse care in Arizona. The model centers cultural identity, family connection, and trauma-informed support so healing feels local, dignified, and lasting.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
  },
  {
    title: "Built to Expand with Care",
    text: "As Project Haven grows beyond Arizona, each future partnership is meant to honor the culture of the community it serves while keeping a consistent promise: safe shelter, accountable stewardship, and belonging-centered care.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80",
  },
];

export default function StorySection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">Our Story</h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto leading-8">
              Building a Hopi-first foundation for youth safety, healing, and responsible expansion
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
              className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-16 items-center`}
            >
              <div className="flex-1">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-64 md:h-80 object-cover rounded-[1.5rem] border border-border/60"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-2xl md:text-3xl text-foreground mb-4">{story.title}</h3>
                <p className="font-body text-base text-muted-foreground leading-8">{story.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}