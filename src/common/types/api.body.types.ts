import { Decimal } from "@prisma/client/runtime/library"

export const HouseApiBody = {
  description: 'Yangilanishi mumkin bo‘lgan maydonlar va rasm fayllari',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      address: { type: 'string' },
      floor: { type: 'number' },
      allFloor: { type: 'number' },
      area: { type: 'decimal' },
      price: { type: 'number' },
      rooms: { type: 'number' },
      categoryId: { type: 'number' },
      durationDays: { type: 'number' },
      images: { type: 'array', items: { type: 'string', format: 'binary' } },
    },
  },
}



export const RequiredHouseApiBody = {
  description: 'Uy ma`lumotlari va rasm fayllari (kamida 3 ta)',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      address: { type: 'string' },
      floor: { type: 'number' },
      allFloor: { type: 'number' },
      area: { type: 'decimal' },
      price: { type: 'number' },
      rooms: { type: 'number' },
      categoryId: { type: 'number' },
      images: { type: 'array', items: { type: 'string', format: 'binary' } },
    },
    required: ['title', 'address', 'price', 'rooms', 'images'],
  },
}