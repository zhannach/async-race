import './assets/styles/normalize.css';
import './assets/styles/global.scss';
import './assets/styles/garage.scss';
import './assets/styles/winners.scss';
import CarApi from './carApi';
import Garage from './pages/garage/garage';
import Winners from './pages/winners/winners';
import { createEl, createLocationHandler } from './pages/helpers/functions';


async function app() {
  const api = new CarApi()
  const root = document.querySelector('#root') as HTMLDivElement
  const toGarageBtn = createEl('button', 'btn-garage', 'TO GARAGE') as HTMLButtonElement
  const toWinnerBtn = createEl('button', 'btn-winners', 'TO WINNERS') as HTMLButtonElement
  const header = createEl('header', 'header__btns', '') as HTMLButtonElement

  header.append(toGarageBtn, toWinnerBtn)
  root.append(header)

  const garage = new Garage(api)
  garage.run()
  const winners = new Winners(api, garage)
 
  const handleLocation = createLocationHandler({ winners, garage })
  handleLocation()

  toWinnerBtn.addEventListener('click', async () => {
    history.pushState({}, '', 'winners')
    handleLocation()
  })
  toGarageBtn.addEventListener('click', async () => {
    history.pushState({}, '', '/')
    handleLocation()
  })
}

app()

