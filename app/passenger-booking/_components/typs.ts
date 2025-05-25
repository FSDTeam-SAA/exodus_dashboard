export interface Ticket {
  _id: string
  schedule: string
  userId: string
  price: number
  busNumber: string
  seatNumber: string
  source: string
  destination: string
  date: string
  time: string
  qrCode: string
  avaiableSeat: string[]
  status: "pending" | "confirmed" | "cancelled"
  key: string
  createdAt: string
  updatedAt: string
  __v: number
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse {
  success: boolean
  message: string
  data: {
    ticket: Ticket[]
    pagination: Pagination
  }
}