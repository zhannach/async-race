import Garage from "../garage/garage"
import Winners from "../winners/winners"

export function createEl(tag: string, style: string, content?: string): HTMLElement {
  const element = document.createElement(tag) as HTMLElement
  element.classList.add(style)
  element.innerHTML = content as string
  return element
}

const carsBrands = ['Ferrari', 'Nissan', 'Audi', 'BMW', 'Dodge', 'Infiniti', 'Jaguar', 'Lexus', 'Maserati', 'Mercedes']
const carsModels = ['California', 'Altima', 'Q7', ' X5', 'Charger', 'QX60', 'I-Pace', 'UX', 'Ghibli', 'EQS']

export function getCarName() {
  const carBrand = carsBrands[Math.floor(Math.random() * carsBrands.length)]
  const carModel = carsModels[Math.floor(Math.random() * carsModels.length)]
  return `${carBrand} ${carModel}`
}

export function getCarColor() {
  const hex = '0123456789ABCDEF'
  let carColor = '#'
  for (let i = 0; i < 6; i++) {
    carColor += hex[Math.floor(Math.random() * 16)]
  }
  return carColor
}

export function getPosition(el: HTMLElement) {
  const { left, top, width, height } = el.getBoundingClientRect()
  const x: number = left + width / 2
  const y: number = top + height / 2
  return { x, y }
}

export function getDistance(el1: HTMLElement, el2: HTMLElement) {
  const fromEL = getPosition(el1)
  const toEl = getPosition(el2)
  return Math.hypot(fromEL.x - toEl.x, fromEL.y - toEl.y)
}

export function animate(animationTime: number, distance: number, car: HTMLElement): number {
  let animationStart: number
  let requestId
  function step(timestamp: number) {
    if (!animationStart) {
      animationStart = timestamp
    }
    const time = timestamp - animationStart
    const passed = Math.round(time * (distance / animationTime))
    car.style.transform = `translateX(${Math.min(passed, distance)}px)`
    if (passed < distance) {
      requestId = requestAnimationFrame(step)
    }
  }
  requestId = requestAnimationFrame(step)
  return requestId
}


export function switchPage(visibleEls: HTMLElement[], hideEls: HTMLElement[]) {
  visibleEls.map((el) => el.style.display = 'block')
  hideEls.map((el) => el.style.display = 'none')
}

export type Pages = {
  winners: Winners
  garage: Garage
}

export function createLocationHandler({ garage, winners }: Pages) {
  return () => {
    const path = window.location.pathname;
    if (path === '/winners') {
      switchPage([winners.winnersEl], [garage.garageEl])
      winners.run()
    } else {
      switchPage([garage.garageEl], [winners.winnersEl])
    }
  }
}

  



