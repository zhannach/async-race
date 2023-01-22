import CarApi from "../../carApi"
import { CarType, Winner } from "../type/types"
import interpolate from '../helpers/interpolate'
import { createEl } from "../helpers/functions"
import Garage from "../garage/garage"

export default class Winners {
  api
  root: HTMLElement
  winners: Winner[] = []
  pageNumber: number = 1
  carsWinnerEl: HTMLElement
  carWinnerPagination: HTMLElement
  carsEl: CarType[] | undefined


  constructor(api: CarApi, garage: Garage) {
    this.api = api
    this.root = garage.root
    this.carsWinnerEl = createEl('section', 'cars-winners')
    this.carsEl = garage.items
    this.carWinnerPagination = garage.paginationEl
    this.root.append(this.carsWinnerEl, this.carWinnerPagination)
  }

  async run() {
    await this.renderWinners()
  }

  async renderWinners() {
    const template = document.querySelector('#winner') as HTMLTemplateElement
    const { winners, count } = await this.api.getWinners(this.pageNumber, 10, 'time', 'ASC')
    this.winners = winners
    console.log( this.winners)
    this.carsWinnerEl.innerHTML = `<h2 class="cars-winners__title">WINNERS
    <span class="cars-winners__amount">(${count})</span>
  </h2>
  <h3 class="cars-winners__subtitle">Page
    <span class="cars-winners__page">#${this.pageNumber}</span>
  </h3>
  <section class="cars-winners">
  <table class="cars-winners__table">`
  
    const winnersTable = this.carsWinnerEl.querySelector('.cars-winners__table') as HTMLTableElement
      const winnersCarElements = this.winners.map((winner, index) => {
        if (!winner.car) return
        return interpolate(template.innerHTML, { winner, index})
      })
      winnersTable.innerHTML = `<tr class="winners-table__titles">
      <th>Number</th>
      <th>Car</th>
      <th>Name</th>
      <th>Wins</th>
      <th>Best time(seconds)</th>
    </tr>
      ${winnersCarElements.join('') } `
    //   carWinnerPagination.innerHTML = ` < div class="pagination-btns" >
        //   <button class="pagination-btn pagination-btn__prev">PREV</button>
        //   <button class="pagination-btn pagination-btn__next">NEXT</button>
        // </>`
      this.carsWinnerEl.append(winnersTable)
    }
}
