import { createEl } from "./functions"

export class Pagination {
  private paginationEl: HTMLElement
  private pageNumber: number
  private count: number

  constructor(parentEl: HTMLElement, pageNumber: number, count: number, callback: (pageNumber: number) => void) {
    this.paginationEl = createEl('div', 'pagination-btns')
    parentEl.append(this.paginationEl)
    this.renderPagination()
    this.attach(callback)
    this.pageNumber = pageNumber
    this.count = count
  }

  setCount(count: number) {
    this.count = count
  }
 
  renderPagination() {
    this.paginationEl.innerHTML = `<button class="pagination-btn pagination-btn__prev">PREV</button>
      <button class="pagination-btn pagination-btn__next">NEXT</button>`
  }

  attach(callback: (pageNumber: number) => void) {
    const prevBtnPagination = this.paginationEl.querySelector('.pagination-btn__prev') as HTMLButtonElement
    prevBtnPagination.addEventListener('click', async () => {
      if (this.pageNumber > 1) this.pageNumber--
      window.location.hash = `page${this.pageNumber}`
      callback(this.pageNumber)
    })
    const nextBtnPagination = this.paginationEl.querySelector('.pagination-btn__next') as HTMLButtonElement
    nextBtnPagination.addEventListener('click', async () => {
      if (this.pageNumber < Math.ceil(Number(this.count) / 10)) this.pageNumber++
      window.location.hash = `page${this.pageNumber}`
      callback(this.pageNumber)
    })
  }
}