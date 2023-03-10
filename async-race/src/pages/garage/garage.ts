import CarApi from "../../carApi"
import { CarType, RaceResult, Winner } from "../type/types"
import { createEl, getCarColor, getCarName, animate, getDistance } from '../helpers/functions'
import interpolate from '../helpers/interpolate'
import { Pagination } from "../helpers/pagination"


export default class Garage {
  api
  root: HTMLElement
  garageEl: HTMLElement
  carsGarageEl: HTMLElement
  updateName: HTMLInputElement | undefined
  updateColor: HTMLInputElement | undefined
  controlContainer: HTMLElement
  congratText: HTMLElement
  raceBtn: HTMLButtonElement | undefined
  pagination: Pagination | undefined
  count: number = 0
  items: CarType[] | undefined
  winner: Winner | undefined
  MAX_CARS_PER_PAGE: number
  pageNumber: number = 1
  carItem: CarType | undefined
  carElem: Element | undefined
  animationFrames: Record<number, number> = {}
  onUpdate: () => void = () => null


  constructor(api: CarApi) {
    this.api = api
    this.root = document.querySelector('#root') as HTMLElement
    this.garageEl = createEl('section', 'garage')
    this.carsGarageEl = createEl('section', 'cars-garage')
    this.controlContainer = createEl('section', 'cars-control')
    this.congratText = createEl('div', 'raceWinner')
    this.carItem = undefined;
    this.carElem = undefined
    this.MAX_CARS_PER_PAGE = 7
    if (window.location.pathname == '/' && window.location.hash.slice(0, 5) === '#page') {
      this.pageNumber = Number(window.location.hash.slice(5))
    }
    this.updateName = undefined
    this.updateColor = undefined
    this.animationFrames
  }

  async run() {
    await this.render()
    this.attach()
  }

  async render() {
    this.renderControlPanel()
    this.garageEl.append(this.controlContainer, this.carsGarageEl)
    await this.renderGarageCars()
    this.pagination = new Pagination(
      this.garageEl, 
      this.pageNumber, 
      this.count, 
      (pageNumber: number) => this.renderGarageCars(pageNumber)
    )
    this.root.append(this.garageEl)
  }


  renderControlPanel() {
    this.controlContainer.innerHTML = `
      <div class="cars-control__create">
      <input type="text" class="create__name input-name">
      <input type="color" class="create__color input-color" value="#e66465">
      <button class="control__btn btn__create">CREATE</button>
    </div>
    <div class="cars-control__update"
      <input type="text" class="update__name input-name">
      <input type="text" class="update__name input-name">
      <input type="color" class="update__color input-color" value="#fff">
      <button class="control__btn btn__update">UPDATE</button>
    </div>
    <div class="cars-control__race">
      <button class="race__btn cars-control__start">RACE</button>
      <button class="race__btn cars-control__reset">RESET</button>
      <button class="generate__btn">GENERATE CARS</button>
    </div>
      `
  }

  async renderGarageCars(pageNumber: number = 0) {
    this.animationFrames = {}
    if(pageNumber) this.pageNumber = pageNumber
    if(this.raceBtn) this.raceBtn.disabled = false
    this.raceBtn?.classList.remove('in-active')
    const { items, count } = await this.api.getCars(this.pageNumber)
    this.count = Number(count)
    this.items = items
    this.pagination?.setCount(this.count)
    const template = document.querySelector('#car') as HTMLTemplateElement
    const cars: string[] = items.map((item) => {
      return interpolate(template.innerHTML, { item })
    })
    this.carsGarageEl.innerHTML = ''
    this.carsGarageEl.innerHTML = `<h2 class="cars-garage__title">GARAGE
      <span class="cars-garage__amount">(${this.count})</span>
    </h2>
    <h3 class="cars-garage__subtitle">Page
      <span class="cars-garage__page">#${this.pageNumber}</span>
    </h3>
    ${cars.join('')}`

    this.updateName = this.garageEl.querySelector('.update__name') as HTMLInputElement
    this.updateColor = this.garageEl.querySelector('.update__color') as HTMLInputElement
    this.carsGarageEl.querySelectorAll('.cars-garage__car').forEach((item, index) => {
      const car = items[index]
      const carSvg = item.querySelector('.car-svg') as HTMLElement
      const btnSelect = item.querySelector('.btn-select') as HTMLButtonElement
      btnSelect.addEventListener('click', () => {
        this.carItem = car;
        this.carElem = item
        console.log(this.updateName, this.updateColor)
        if (this.updateName && this.updateColor) {
          this.updateName.value = this.carItem.name 
          this.updateColor.value = this.carItem.color 
        }
      })
      const btnDelete = item.querySelector('.btn-remove') as HTMLButtonElement
      btnDelete.addEventListener('click', async () => {
        await this.api.deleteCar(car.id as number)
        await this.api.deleteWinner(car.id as number)
        await this.renderGarageCars()
      })
      const startCarBtn = item.querySelector('.btn-start') as HTMLButtonElement
      startCarBtn.addEventListener('click', async () => {
        startCarBtn.classList.add('in-active')
        startCarBtn.disabled = true
        returnCarBtn.classList.toggle('in-active')
        returnCarBtn.disabled = false
        await this.startCar(car.id as number, carSvg)
      })
      const returnCarBtn = item.querySelector('.btn-return') as HTMLButtonElement
      returnCarBtn.addEventListener('click', () => {
        returnCarBtn.classList.toggle('in-active')
        startCarBtn.classList.remove('in-active')
        startCarBtn.disabled = false
        this.resetCar(car.id as number, carSvg)
      })
    })
  }

  async createRandomCars() {
    let count = 100
    while (0 < count) {
      await this.api.createCar({ name: getCarName(), color: getCarColor() })
      count--
    }
  }

  attach() {
    const createBtn = document.querySelector('.btn__create') as HTMLButtonElement
    createBtn.addEventListener('click', async() => {
      await this.createEl()
      await this.renderGarageCars(1)
    })
    const updateBtn = document.querySelector('.btn__update') as HTMLButtonElement
    updateBtn.addEventListener('click', async () => {
      await this.updateEl()
      await this.renderGarageCars()
    })
    const genereteBtn = document.querySelector('.generate__btn') as HTMLButtonElement
    genereteBtn.addEventListener('click', async () => {
      await this.createRandomCars()
      await this.renderGarageCars(this.pageNumber)
    })
    const startBtns = document.querySelectorAll('.btn-start') as NodeList
    this.raceBtn = document.querySelector('.cars-control__start') as HTMLButtonElement
    this.raceBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      startBtns.forEach((btnStart) => {
        (btnStart as HTMLButtonElement).classList.add('in-active');
        (btnStart as HTMLButtonElement).disabled = true
      })
      returnBtns.forEach((btnReturn) => {
        (btnReturn as HTMLButtonElement).classList.remove('in-active');
        (btnReturn as HTMLButtonElement).disabled = false
      })
      if (!this.raceBtn) return
      this.raceBtn.classList.add('in-active')
      this.raceBtn.disabled = true
      resetBtn.classList.remove('in-active')
      resetBtn.disabled = false
      this.startRace()
    })
    const returnBtns = document.querySelectorAll('.btn-return') as NodeList
    const resetBtn = document.querySelector('.cars-control__reset') as HTMLButtonElement
    resetBtn?.addEventListener('click', async (e) => {
      e.stopPropagation()
      returnBtns.forEach((btn) => {
        (btn as HTMLButtonElement).classList.add('in-active');
        (btn as HTMLButtonElement).disabled = true
      })
      startBtns.forEach((btn) => {
        (btn as HTMLButtonElement).classList.remove('in-active');
        (btn as HTMLButtonElement).disabled = false
      })
      this.congratText.style.display = 'none'
      resetBtn.classList.add('in-active')
      resetBtn.disabled = true
      if (!this.raceBtn) return
      this.raceBtn.classList.remove('in-active')
      this.raceBtn.disabled = false
      await this.resetRace()
    })
  }
  

  async createEl() {
    const inputName = document.querySelector('.create__name') as HTMLInputElement
    const inputColor = document.querySelector('.create__color') as HTMLInputElement
    console.log(inputName)
    let name = inputName.value as string
    name = `${name[0].toUpperCase()}${name.slice(1)}`
    const color = inputColor.value as string
    if (name) {
      inputName.classList.remove('empty')
      return await this.api.createCar({ name, color })
    } else {
      inputName.classList.add('empty')
    }
  }

  async updateEl() {
    const name = this.updateName?.value as string
    const color = this.updateColor?.value as string
    await this.api.updateCar(this.carItem?.id as number, { name, color })
  }

  async startCar(id: number, item: Element) {
    const { velocity, distance } = await this.api.toggleEngine(id, 'started')
    let time = Math.round(distance / velocity)
    const flag = document.querySelector(`.flag${id}`) as HTMLElement
    const distanceBetweenEl = getDistance(item as HTMLElement, flag)
    this.animateCar(time, distanceBetweenEl, id, item as HTMLElement)
    const { success } = await this.api.driveCar(id)
    if (!success) {
      window.cancelAnimationFrame(this.animationFrames[id])
    }
    time = Number((time / 1000).toFixed(2))
    return { success, id, time }
  }

  animateCar(animationTime: number, distance: number, carId: number, carEl: HTMLElement) {
    let animationStart: number
    const step = (timestamp: number) => {
      if (!animationStart) {
        animationStart = timestamp
      }
      const time = timestamp - animationStart
      const passed = Math.round(time * (distance / animationTime))
      carEl.style.transform = `translateX(${Math.min(passed, distance)}px)`
      if (passed < distance) {
        this.animationFrames[carId] = requestAnimationFrame(step)
      }
    }
    this.animationFrames[carId] = requestAnimationFrame(step)
  }

  async resetCar(carId: number, carEl: HTMLElement) {
    await this.api.toggleEngine(carId, 'stopped')
    window.cancelAnimationFrame(this.animationFrames[carId])
    carEl.style.transform = `translateX(0px)`
  }

  async startRace() {
    this.winner = undefined
    this.carsGarageEl.querySelectorAll('.car-svg').forEach(async (carEl, index) => {
      if (!this.items) return
      const car = this.items[index]
      const { success, id, time } = await this.startCar(car.id as number, carEl)
      if (success && !this.winner) {
        this.winner = {id, wins: 0, time}
        this.showWinner(car.name, time)
        this.winner = await this.saveWinner(id, time)
      }
    })
  }

  async saveWinner(id: number, time: number) {
    const oldWinner = await this.api.getWinner(id)
    if (!oldWinner.id) {
      await this.api.createWinner({ id, wins: 1, time })
      return { id, wins: 1, time }
    } else {
      oldWinner.time = time
      oldWinner.wins++
      await this.api.updateWinner(oldWinner.id, oldWinner)
      return oldWinner
    }
  }

  async resetRace() {
    const allPromises: Promise<void>[] = []
    this.carsGarageEl.querySelectorAll('.car-svg').forEach((carEl, index) => {
      if (!this.items) return
      const car = this.items[index]
      allPromises.push(this.resetCar(car.id as number, carEl as HTMLElement))
    })
    await Promise.all(allPromises)
  }

  showWinner(name: string, time: number) {
    this.congratText.style.display = 'block'
    this.congratText.innerHTML = `${name} has won the race in ${time}s`
    this.carsGarageEl.append(this.congratText)
  }
}