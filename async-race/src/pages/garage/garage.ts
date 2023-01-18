import CarApi from "../../carApi"
import { CarType } from "../type/types"
import { createEl, getCarColor, getCarName } from '../helpers/functions'
import interpolate from '../helpers/interpolate'


export default class Garage {
  api
  root: HTMLElement
  carsGarageEl: HTMLElement
  updateName: HTMLInputElement | undefined
  updateColor: HTMLInputElement | undefined
  header: HTMLElement
  paginationEl: HTMLElement
  controlContainer:HTMLElement 
  count: string | undefined
  items: CarType[] | undefined
  MAX_CARS_PER_PAGE: number
  pageNumber: number = 1
  carItem: CarType | undefined
  carElem: Element | undefined
  onUpdate: () => void = () => null


  constructor(api: CarApi) {
    this.api = api
    this.root = document.querySelector('#root') as HTMLElement
    this.header = document.createElement('header') as HTMLElement
    this.carsGarageEl = createEl('section', 'cars-garage')
    this.paginationEl = createEl('div', 'pagination-btns')
    this.controlContainer = createEl('section', 'cars-control')
    this.root.append(this.header, this.controlContainer, this.carsGarageEl, this.paginationEl)
    this.carItem = undefined;
    this.carElem = undefined
    this.MAX_CARS_PER_PAGE = 7
    if (window.location.hash.slice(0, 5) === '#page') {
      this.pageNumber = Number(window.location.hash.slice(5))
    } 
    this.pageNumber = this.count && Number(this.count) > this.MAX_CARS_PER_PAGE ? this.pageNumber : 1
    this.updateName = undefined
    this.updateColor = undefined
  }

  async run() {
    await this.render()
    this.renderPagination()
    this.attach()
  }

  async render() {
    this.renderRacePanel()
    this.renderControlPanel()
    await this.renderGarageCars()
  }

  renderRacePanel() {
    this.header.classList.add('header__btns')
    const toGarageBtn = createEl('button', 'btn-garage', 'TO GARAGE')
    const toWinnerBtn = createEl('button', 'btn-winners', 'TO WINNERS')
    this.header.append(toGarageBtn, toWinnerBtn)
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
      <button class="race__btn cars-control__race">RACE</button>
      <button class="race__btn cars-control__reset">RESET</button>
      <button class="generate__btn">GENERATE CARS</button>
    </div>
      `
  }

  async renderGarageCars() {
    this.carsGarageEl.innerHTML = ''
    const { items, count } = await this.api.getCars(this.pageNumber)
    this.items = items
    this.count = count  
    const template = document.querySelector('#car') as HTMLTemplateElement
    const cars: string[] = items.map((item) => {
      return interpolate(template.innerHTML, { item })
    })
    this.carsGarageEl.innerHTML = `<h2 class="cars-garage__title">GARAGE
      <span class="cars-garage__amount">(${this.count})</span>
    </h2>
    <h3 class="cars-garage__subtitle">Page
      <span class="cars-garage__page">#${this.pageNumber}</span>
    </h3>
    ${cars.join('')}`
    this.updateName = document.querySelector('.update__name') as HTMLInputElement
    this.updateColor = document.querySelector('.update__color') as HTMLInputElement
    this.carsGarageEl.querySelectorAll('.cars-garage__car').forEach((item, index) => {
      const car = items[index]
      const btnSelect = item.querySelector('.btn-select') as HTMLButtonElement
      btnSelect.addEventListener('click', async () => {
        this.carItem = car;
        this.carElem = item
        if (this.updateName && this.updateColor) {
          this.updateName.value = car.name as string
          this.updateColor.value = this.carItem.color
        }
      })
      const btnDelete = item.querySelector('.btn-remove') as HTMLButtonElement
      btnDelete.addEventListener('click', async () => {
        await this.api.deleteCar(car.id as number)
        await this.renderGarageCars()
      })
    })
  }

  renderPagination() {
    this.paginationEl.innerHTML = `<button class="pagination-btn pagination-btn__prev">PREV</button>
      <button class="pagination-btn pagination-btn__next">NEXT</button`
  }

  async renderRandomCars() {
    let count = 100
    console.log(getCarColor())
    while( 0 < count) {
      await this.api.createCar({ name: getCarName(), color: getCarColor()})
      count--
    }
  }

  attach() {
    const createBtn = document.querySelector('.btn__create') as HTMLButtonElement
    createBtn.addEventListener('click', () => {
      this.createEl()
      this.renderGarageCars()
    })
    const updateBtn = document.querySelector('.btn__update') as HTMLButtonElement
    updateBtn.addEventListener('click', () => {
      this.updateEl()
      this.renderGarageCars()
    })
    const prevBtnPagination = document.querySelector('.pagination-btn__prev') as HTMLButtonElement
    prevBtnPagination.addEventListener('click', () => {
      if (this.pageNumber > 1) this.pageNumber--
      window.location.hash = `page${this.pageNumber}` 
      this.renderGarageCars()
    })
    const nextBtnPagination = document.querySelector('.pagination-btn__next') as HTMLButtonElement
    nextBtnPagination.addEventListener('click', () => {
      if (this.pageNumber < Math.ceil(Number(this.count) / 7)) this.pageNumber++
      window.location.hash = `page${this.pageNumber}`
      this.renderGarageCars()
    })
    const genereteBtn = document.querySelector('.generate__btn') as HTMLButtonElement
    genereteBtn.addEventListener('click', async() => {
      await this.renderRandomCars()
      await this.renderGarageCars()
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

} 