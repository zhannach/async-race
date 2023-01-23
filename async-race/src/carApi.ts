import { CarType, Winner, Engine } from "./pages/type/types";

export default class CarApi {
  base: string;
  garage: string;
  engine: string;
  winners: string;

  constructor() {
    this.base = 'http://127.0.0.1:3000';
    this.garage = `${this.base}/garage`
    this.engine = `${this.base}/engine`
    this.winners = `${this.base}/winners`
  }

  async getCars(page: number, limit: number = 7) {
    if (page < 1) page = 1
    const response = await fetch(`${this.garage}?_page=${page}&_limit=${limit}`)
    return {
      items: await response.json() as CarType[],
      count: response.headers.get('X-Total-Count') as string,
    }
  }

  async getCar(id: number): Promise<CarType> {
    const response = await fetch(`${this.garage}/${id}`)
    return response.json()
  }

  async createCar(body: { name: string, color: string }): Promise<CarType> {
    const response = await fetch(this.garage, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": 'application/json'
      },
    })
    return response.json()
  }

  async deleteCar(id: number): Promise<CarType> {
    const response = await fetch(`${this.garage}/${id}`, { method: 'DELETE' as string })
    return response.json()
  }

  async updateCar(id: number, body: { name: string, color: string }): Promise<CarType> {
    const response = await fetch(`${this.garage}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": 'application/json'
      },
    })
    return response.json()
  }


  async toggleEngine(id: number, status: string): Promise<Engine> {
    const response = await fetch(`${this.engine}?id=${id}&status=${status}`, { method: 'PATCH' as string });
    console.log( response)
    return response.json()
  }

  async driveCar(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${this.engine}?id=${id}&status=drive`, { method: 'PATCH' as string });
    if (response.status !== 200) {
      return { success: false }
    } else {
      return response.json()
    }
  }

  getSortOrder(sort: string, order: string): string {
    if (sort && order) {
      return `&_sort=${sort}&_order=${order}`
    } else {
      return ''
    }
  }

  async getWinners(page: number, limit: number = 10, sort: string, order: string) {
    if (page < 1) page = 1
    const response = await fetch(`${this.winners}?_page=${page}&_limit=${limit}${this.getSortOrder(sort, order)}`);
    const items = await response.json()
    const winners = items.map(async(item: Winner) => {
      return { ...item, car: await this.getCar(item.id as number) }
    })
    console.log(await Promise.all(winners))
    return {
      winners: await Promise.all(winners) as Winner[],
      count: response.headers.get('X-Total-Count') as string
    }
  }

  async getWinner(id: number): Promise<Winner> {
    const response = await fetch(`${this.winners}/${id}`)
    return response.json()
  }

  async deleteWinner(id: number): Promise<CarType> {
    const response = await fetch(`${this.winners}/${id}`, { method: 'DELETE' as string })
    return response.json()
  }

  async createWinner(body: { id: number, wins: number, time: number }): Promise<Winner> {
    const request = await fetch(this.winners, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": 'application/json'
      },
    })
    return request.json()
  }

  async updateWinner(id: number, body: { id: number, wins: number, time: number }): Promise<Winner> {
    const request = await fetch(`${this.winners}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        "Content-Type": 'application/json'
      },
    })
    return request.json()
  }

}