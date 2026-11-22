export interface ReviewData {
  id: string;
  filename: string;
  client: string;
  country?: string;
  company?: string;
  projectType: string;
  year: string;
  quote: string;
  rating: number;
}

export const reviewsData: ReviewData[] = [
  {
    id: 'review-1',
    filename: 'photo_2026-07-25_17-55-58.jpg',
    client: 'Замовниця Telegram-бота',
    country: '🇺🇦 Україна',
    projectType: 'Telegram-бот для бізнесу',
    year: '2026',
    quote: 'Загалом хотіла б написати дякую в цілому за вашу роботу! Дуже якісно та оперативно все зробили. Всі моменти пояснювали, також дуже сподобалась ваша ініціатива) Загалом протягом усього процесу розробки великим плюсом було те, що ви допомагали, розповідали про кожен крок та різні варіанти. У разі чого будемо звертатись саме до вас)',
    rating: 5,
  },
  {
    id: 'review-2',
    filename: 'photo_2026-07-25_17-59-35.jpg',
    client: 'Замовник з Upwork',
    country: '🇨🇭 Switzerland',
    projectType: 'Веб-розробка / Full-stack',
    year: '2025',
    quote: "Working with Ihor has been a great experience. He's highly intelligent, and incredibly eager to learn. He responds fast, works with full energy, and always pushes to find the best solution. You can absolutely trust him to get things done. Give him a try.. you won't be disappointed.",
    rating: 5,
  },
  {
    id: 'review-3',
    filename: 'photo_2026-10-02_15-09-24.jpg',
    client: 'Замовниця веб-сервісу',
    country: '🇺🇦 Україна',
    projectType: 'Розробка веб-сайту',
    year: '2026',
    quote: 'Хочу залишити відгук про співпрацю, я безмежно вдячна за вашу роботу, все було наскільки швидко виконано, й продумано просто до дрібниць, комунікація на найвищому рівні, підказка, допомога в подальшому також супер. Ви дуже талановитий🤝',
    rating: 5,
  },
];
