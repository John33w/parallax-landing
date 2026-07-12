import Navigation from '../components/Navigation';
import TextReveal from '../components/TextReveal';
import ScrollIndicator from '../components/ScrollIndicator';
import { InteractiveGrid } from '../components/InteractiveGrid';

export default function AboutPage() {
  return (
    <div className="bg-[#1c1c1c] min-h-screen text-white font-cabinetGrotesk relative overflow-x-hidden">
      <InteractiveGrid />
      <Navigation theme="dark" absolute />
      <ScrollIndicator />
      <div className="max-w-5xl px-8 md:px-16 lg:px-32 pt-24 pb-24 relative z-10">
        <TextReveal playEveryTime text="About Me" className="text-4xl md:text-6xl font-bold mb-8 block" />
        <div className="space-y-5 text-white/70 text-base md:text-lg leading-relaxed">
          <TextReveal delay={0.3} playEveryTime text="My name is Clarina, and I serve as the Vice-Principal of Christopher Arts & Science College in Tirunelveli, Tamil Nadu. Throughout my journey as a chemist and educator, my work and life have been driven by a single, powerful conviction: women possess extraordinary strength and capability when they cultivate self-reliance." />
          <TextReveal delay={0.6} playEveryTime text="As a chemistry professor, this belief shapes my daily purpose. My mission is to mentor, guide, and inspire my students, empowering them to step out into the world with unwavering confidence and a courageous spirit." />
          
          <TextReveal playEveryTime text="My Passions and Interests" className="text-3xl text-white font-cabinetGrotesk mt-12 mb-4 block" />
          <TextReveal playEveryTime text="Beyond my academic and administrative responsibilities, I am deeply committed to lifelong learning, creativity, and personal growth. I am a dedicated book lover who finds immense joy in reading and reviewing thought-provoking literature. My personal library focuses on faith, mindset, and personal development, featuring impactful titles such as The Bible, Emotional Intelligence, You Can Win, Stop OverThinking, Alchemist, Ikigai, The Power of Your Subconscious Mind, Who Will Cry When You Die?, The Power of Making Miracles, Atomic Habits, and The 5 A.M. Club." />
          <TextReveal playEveryTime text="To balance the analytical nature of my work in science, I turn to painting and drawing as wonderful outlets for creative expression and mindfulness. My perspective on life is also greatly enriched by media, music, and stories that nurture inner fortitude, spiritual strength, and happiness." />
          
          <TextReveal playEveryTime text="Entertainment and Favorites" className="text-3xl text-white font-cabinetGrotesk mt-12 mb-4 block" />
          <TextReveal playEveryTime text="When I want to relax and wind down, I love listening to music and watching uplifting shows. On the screen, I appreciate engaging and thoughtful storytelling, frequently tuning into War Room, The Chosen, and Young Sheldon. Music is another constant source of inspiration for me. I closely follow Christian Gospel music and the work of Chris Tomlin, while also enjoying timeless, classic hits from Celine Dion, the Backstreet Boys, and ABBA." />
          
          <TextReveal playEveryTime text="Get in Touch" className="text-3xl text-white font-cabinetGrotesk mt-12 mb-4 block" />
          <p>
            I am always open to academic collaborations, meaningful discussions about education, or simply sharing thoughts on a great book. Please feel free to reach out directly via email at <a href="mailto:drclarinaapchemistrycasc@gmail.com" className="text-white hover:text-[#d4f534] underline decoration-white/30 hover:decoration-[#d4f534] transition-colors">drclarinaapchemistrycasc@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
