export interface Event {
    id: number
    title: string
    category: string,
    date: string,
    location: string,
    price:  number | 'Free',
    duration: string,
    description: string,
    image: string,
    organizer: {
      name: string,
      contact: string
    },
    views: number
  }
export type { Event }