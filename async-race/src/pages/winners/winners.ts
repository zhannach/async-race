import CarApi from "../../carApi"
import { CarType, Winner } from "../type/types"
import interpolate from '../helpers/interpolate'
import { createEl } from "../helpers/functions"
import Garage from "../garage/garage"
import { Pagination } from "../helpers/pagination"

export default class Winners {
  api
  garage
  root: HTMLElement
  winners: Winner[] = []
  count: number = 0
  pageNumber: number = 1
  pagination: Pagination | undefined
  winnersEl: HTMLElement
  carsWinnerEl: HTMLElement
  carsEl: CarType[] | undefined


  constructor(api: CarApi, garage: Garage) {
    this.api = api
    this.garage = garage
    this.root = garage.root
    this.winnersEl = createEl('section', 'winners')
    this.carsWinnerEl = createEl('section', 'cars-winners')
    this.winnersEl.append(this.carsWinnerEl)
    this.carsEl = garage.items
    if (window.location.pathname == '/winners' && window.location.hash.slice(0, 5) === '#page') {
      this.pageNumber = Number(window.location.hash.slice(5))
    }
  }

  async run() {
    await this.renderWinners(this.pageNumber)
    if(!this.pagination) this.pagination = new Pagination(
      this.winnersEl,
      this.pageNumber,
      this.count,
      (pageNumber: number) => this.renderWinners(pageNumber)
    )
    this.root.append(this.winnersEl)
  }

  async renderWinners(pageNumber: number) {
    const template = document.querySelector('#winner') as HTMLTemplateElement
    const { winners, count } = await this.api.getWinners(pageNumber, 10, 'time', 'ASC')
    this.winners = winners
    this.count = Number(count)
    this.carsWinnerEl.innerHTML = `<h2 class="cars-winners__title">WINNERS
    <span class="cars-winners__amount">(${count})</span>
  </h2>
  <h3 class="cars-winners__subtitle">Page
    <span class="cars-winners__page">#${pageNumber}</span>
  </h3>
  <section class="cars-winners">
  <table class="cars-winners__table">`

    const winnersTable = this.carsWinnerEl.querySelector('.cars-winners__table') as HTMLTableElement
    const winnersCarElements = this.winners.map((winner, index) => {
      if (!winner.car) return
      return interpolate(template.innerHTML, { winner, index })
    })
    winnersTable.innerHTML = `<tr class="winners-table__titles">
      <th>Number</th>
      <th>Car</th>
      <th>Name</th>
      <th>Wins</th>
      <th>Best time(seconds)</th>
    </tr>
      ${winnersCarElements.join('')} `
    this.carsWinnerEl.append(winnersTable)
  }
}
