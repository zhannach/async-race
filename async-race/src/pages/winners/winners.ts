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
  winnersTableHeaders: HTMLTableElement
  carsEl: CarType[] | undefined


  constructor(api: CarApi, garage: Garage) {
    this.api = api
    this.garage = garage
    this.root = garage.root
    this.winnersEl = createEl('section', 'winners')
    this.carsWinnerEl = createEl('section', 'cars-winners')
    this.winnersTableHeaders = createEl('tr', 'winners-table__titles') as HTMLTableElement
    this.winnersEl.append(this.carsWinnerEl)
    this.carsEl = garage.items
    if (window.location.pathname == '/winners' && window.location.hash.slice(0, 5) === '#page') {
      this.pageNumber = Number(window.location.hash.slice(5))
    }
  }

  async run() {
    await this.renderWinners(this.pageNumber, 'time', 'ASC')
    this.renderTableHeaders()
    if (!this.pagination) this.pagination = new Pagination(
      this.winnersEl,
      this.pageNumber,
      this.count,
      (pageNumber: number) => this.renderWinners(pageNumber, 'time', 'ASC')
    )
    this.root.append(this.winnersEl)
    this.sortWinners()
  }

  async renderWinners(pageNumber: number, sort: string, order: string) {
    const template = document.querySelector('#winner') as HTMLTemplateElement
    const { winners, count } = await this.api.getWinners(pageNumber, 10, sort, order)
    this.winners = winners
    this.count = Number(count)
    this.carsWinnerEl.innerHTML = `<h2 class="cars-winners__title">WINNERS
    <span class="cars-winners__amount">(${count})</span>
  </h2>
  <h3 class="cars-winners__subtitle">Page
    <span class="cars-winners__page">#${pageNumber}</span>
  </h3>
  <section class="cars-winners">
  <table class="cars-winners__table">
  <tbody class="cars-winners__body"></tbody>`

    const winnersTable = this.carsWinnerEl.querySelector('.cars-winners__table') as HTMLTableElement
    const winnersTablebody = this.carsWinnerEl.querySelector('.cars-winners__body') as HTMLTableElement
    const winnersCarElements = this.winners.map((winner, index) => {
      if (!winner.car) return
      return interpolate(template.innerHTML, { winner, index })
    })
    winnersTablebody.innerHTML = `${winnersCarElements.join('')} `
    winnersTable.append(this.winnersTableHeaders, winnersTablebody)
    this.carsWinnerEl.append(winnersTable)
  }

  renderTableHeaders() {
    this.winnersTableHeaders.innerHTML = `<tr class="winners-table__titles">
    <th>Number</th>
    <th>Car</th>
    <th>Name</th>
    <th>Wins
    <button class="btn-wins rotate"></button>
    </th>
    <th>Best time(seconds)
    <button class="btn-time"></button>
    </th>
  </tr>`
  }

  sortWinners() {
    const timeBtn = this.carsWinnerEl.querySelector('.btn-time')
    timeBtn?.addEventListener('click', async () => {
      timeBtn.classList.toggle('down')
      if (timeBtn.classList.contains('down')) {
        await this.renderWinners(this.pageNumber, 'time', 'DESC')
      } else {
        await this.renderWinners(this.pageNumber, 'time', 'ASC')
      }

    })
    const winsBtn = this.carsWinnerEl.querySelector('.btn-wins')
    winsBtn?.addEventListener('click', async () => {
      winsBtn.classList.add('visible')
      winsBtn.classList.toggle('down')
      if (winsBtn.classList.contains('down')) {
        await this.renderWinners(this.pageNumber, 'wins', 'DESC')
      } else {
        await this.renderWinners(this.pageNumber, 'wins', 'ASC')
      }
    })
  }
}
