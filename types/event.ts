export interface Event {
    id: number
    title: string
    category:{
      name: string,
     
    },
    date: string,
     role: 'admin' | 'organizer' | 'user'
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
    createdAt: string
    updatedAt: string
    status: string
  }
export type { Event }