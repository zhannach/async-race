export type CarType = {
  name: string
  color: string
  id?: number
}

export type Winner = {
  id: number,
  wins: number,
  time: number,
  car?: CarType
}

export type getCars = {
  cars: CarType[] | Winner[],
  count: string
}

export type Engine = {
  velocity: number,
  distance: number,
}

export type RaceResult = {
  success: boolean,
  id: number,
  time: number
}
