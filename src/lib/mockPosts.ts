export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  permalink: string;
  publishDate: string;
  status: string;
  author?: string;
}

export const MOCK_POSTS: BlogPost[] = [
  {
    id: "mock-post-1",
    title: "The Power of Mindset: Relying on the Strength Within",
    excerpt: "Reflecting on leading students with confidence and courage. True empowerment begins when we depend on our inner strength and the grace that has been given to us.",
    content: `
      <p>My work and my life are driven by a deep conviction: women are powerful and strong when they depend on themselves. As the Vice-Principal of Christopher Arts & Science College in Tirunelveli, Tamil Nadu, my mission every day is to guide and inspire students to face the world with full confidence and courage.</p>
      <p>True self-reliance is not about isolating oneself from others, but rather discovering the immense reservoirs of resilience and grace that reside within us. In scripture, we are reminded of our absolute security and the source of our strength. Romans 8:39 states that nothing in all creation will be able to separate us from the love of God that is in Christ Jesus our Lord.</p>
      <h2>Guiding the Next Generation</h2>
      <p>When working with students, I often see the hesitation and fear of failure that holds them back. My message to them is always the same: do not be afraid to step forward. You have a unique path and a story to tell. Face the challenges of academia and life with your head held high.</p>
      <blockquote>"Face the world with full confidence and courage."</blockquote>
      <p>Let us choose to walk with courage, leaning on faith, and knowing that we are fully capable of achieving the heights we set out to reach.</p>
    `,
    permalink: "power-of-mindset",
    publishDate: "2026-05-20T10:00",
    status: "published",
    author: "rinawrites84@gmail.com"
  },
  {
    id: "mock-post-2",
    title: "Stepping Into Grace: Finding Faith and Courage Daily",
    excerpt: "How to build daily habits of spiritual and mental resilience. Exploring the lessons of Chris Tomlin's worship and the deep strength found in daily scriptures.",
    content: `
      <p>We love because He first loved us. This simple, profound truth from 1 John 4:19 forms the bedrock of a life lived in grace and courage. Daily life can be demanding, but when we start our day centered in faith, we align ourselves with a peace that surpasses understanding.</p>
      <p>One of my favorite ways to find focus and peace is through music. The uplifting melodies and deep theological truths in Chris Tomlin's songs have a wonderful way of reminding us of the greatness of God. Listening to worship music allows us to quiet the noise of the world and connect with our higher purpose.</p>
      <h2>Daily Practices for Resilience</h2>
      <ul>
        <li><strong>Morning Devotion:</strong> Spend a few quiet moments in prayer and reading the scriptures.</li>
        <li><strong>Gratitude Journaling:</strong> Write down three things you are thankful for each day.</li>
        <li><strong>Inspiring Music:</strong> Let music that speaks of strength and joy fill your home or workspace.</li>
      </ul>
      <p>By centering our minds on things that are pure, lovely, and of good report, we build an unshakeable foundation that carries us through any storm.</p>
    `,
    permalink: "stepping-into-grace",
    publishDate: "2026-05-25T14:30",
    status: "published",
    author: "rinawrites84@gmail.com"
  },
  {
    id: "mock-post-3",
    title: "My Literary Sanctuary: Lessons from the Pages I Love",
    excerpt: "A journey through the books that shape my perspective. Exploring key insights from 'Atomic Habits', 'The Alchemist', and 'Emotional Intelligence' for a purposeful life.",
    content: `
      <p>Reading is a conversation with the finest minds of the past and present. My personal library is a sanctuary of wisdom, containing books that have profoundly shaped my perspective on leadership, growth, and faith.</p>
      <p>In <em>Atomic Habits</em> by James Clear, we learn that small, 1% improvements daily compound into massive life transformations. It is not about grand gestures, but the consistent, quiet habits we build every morning.</p>
      <p>Similarly, <em>The Alchemist</em> by Paulo Coelho reminds us that when you want something, all the universe conspires in helping you to achieve it. It is a beautiful allegory of finding one's Personal Legend and pursuing it with courage.</p>
      <h2>Bridging Faith and Knowledge</h2>
      <p>Alongside these classic self-help works, my reading is anchored by The Bible. It provides the eternal wisdom that gives context and meaning to emotional and intellectual growth. When we pair the practical advice of modern research with the timeless truth of scripture, we are fully equipped for a life of purpose.</p>
      <p>I encourage everyone to dedicate even fifteen minutes a day to reading. You will find that those fifteen minutes quickly become a source of daily inspiration and clarity.</p>
    `,
    permalink: "my-literary-sanctuary",
    publishDate: "2026-05-28T09:15",
    status: "published",
    author: "rinawrites84@gmail.com"
  }
];
