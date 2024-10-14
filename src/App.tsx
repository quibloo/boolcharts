import { parse, stringify } from 'superjson'
import React from 'react'
import './App.css'
import boolChartsLogo from "./assets/boolcharts.png"

type Card = {
  id: string;
  name: string;
  data: boolean[];
  createdAt: Date;
}

function monthToStr(month: number) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return months[month]
}

function generateRandomId() {
  return Math.random().toString(16).slice(2)
}

function generateFakeMonth() {
  return Array.from(Array(getDaysInMonth(new Date().getMonth(), new Date().getFullYear()))).map(() => Boolean(Math.round(Math.random())));
}

function generateMonth() {
  return Array.from(Array(getDaysInMonth(new Date().getMonth(), new Date().getFullYear()))).map(() => false)
}


function getDaysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

const initialCards = [
  {
    id: generateRandomId(),
    name: "Apply for a job",
    data: generateFakeMonth(),
    createdAt: new Date()
  },
  {
    id: generateRandomId(),
    name: "5 Leetcode Problems",
    data: generateFakeMonth(),
    createdAt: new Date()
  },
  {
    id: generateRandomId(),
    name: "Read 15 Pages",
    data: generateFakeMonth(),
    createdAt: new Date(2024, 8, 20)
  },
  {
    id: generateRandomId(),
    name: "Follow Diet",
    data: generateFakeMonth(),
    createdAt: new Date()
  },
  {
    id: generateRandomId(),
    name: "Meditate",
    data: generateFakeMonth(),
    createdAt: new Date()
  },
]

function saveToLocalStorage(cards: Card[]) {
  // cards have changed
  if (cards) {
    localStorage.setItem("cards", stringify(cards))
  }
}

function getFromLocalStorage() {
  let item = localStorage.getItem("cards");
  if (!item) localStorage.setItem("cards", stringify(initialCards));
  item = localStorage.getItem("cards") as string;
  const parsed = parse<Card[]>(item);
  return parsed;
}

function App() {
  const [cards, setCards] = React.useState<Card[]>(getFromLocalStorage());

  React.useEffect(() => {
    setCards(getFromLocalStorage())
  }, [])

  React.useEffect(() => {
    saveToLocalStorage(cards)
  }, [cards])

  const addCard = () => {
    let mda = "";
    while (mda === "" || !mda) {
      mda = prompt("What daily action would you like to cultivate?") as string;
    }
    setCards(cards => [...cards, { id: generateRandomId(), name: mda, data: generateMonth(), createdAt: new Date() }])
  }

  const removeCard = (id: string) => {
    setCards(cards => cards.filter(card => card.id !== id))
  }

  const toggleEntry = (id: string, index: number) => {
    setCards(cards => cards.map(card => card.id === id ? {
      ...card,
      data: card.data.map((entry, i) => i === index ? !entry : entry)
    } : card))
  }

  const changeText = (id: string) => {
    let name = "";
    while (name === "" || !name) {
      name = prompt("What would you like to change the name to?") as string
    }
    setCards(cards => cards.map(card => card.id === id ? { ...card, name } : card))
  }

  return (
    <main>
      <nav className="mb-4"><img src={boolChartsLogo} width={200} /></nav>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {cards.length > 0 ? cards.map(card =>
          <BoolCard key={card.id} card={card} onDeleteClick={() => removeCard(card.id)} toggleEntry={(index) => toggleEntry(card.id, index)} changeText={() => changeText(card.id)} />
        ) : <div className="w-full p-4">no bool charts :(</div>}
      </div>
      <button className="border border-gray-500 px-4 py-2 hover:bg-gray-200 my-4" onClick={addCard}>Add Bool Chart</button>
      <a href="https://x.com/itsquibloo" target="_blank" className="fixed bg-white bottom-0 left-0 w-full flex hover:underline items-center text-xs font-bold justify-center h-10"><span>made by quib</span></a>
    </main>
  )
}

function chunk(arr: boolean[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    chunks.push(chunk)
  }
  return chunks
}

const createXIntent = (card: Card) => {
  const prefix = "https://x.com/intent/tweet?text="
  const initial = `My ${monthToStr(card.createdAt.getMonth())} BoolChart for "${card.name}":`;
  const chunks = chunk(card.data, 7)
  const data = chunks.map((week, i) => week.map((day, j) => getEntryIndex(i, j) < card.createdAt.getDate() ? "⏭️" : day ? "✅" : "❌").join("")).join("\n")
  const text = encodeURIComponent(initial + "\n \n" + data)
  return prefix + text
}

const BoolCard = (props: { card: Card; onDeleteClick: () => void; toggleEntry: (index: number) => void; changeText: () => void; }) => {
  const { card, onDeleteClick, toggleEntry, changeText } = props;
  const xIntentLink = createXIntent(card)
  return (
    <div className="pt-2 shadow-md rounded-md overflow-hidden text-ellipsis whitespace-nowrap w-56 relative">
      <div className="px-2 mb-1">
        <button onClick={onDeleteClick} className="absolute top-0 right-0 m-2 p-1 flex items-center justify-center w-4 h-4 hover:bg-gray-200 text-gray-600"><span>x</span></button>
        <p className="font-bold text-left px-2 text-sm text-gray-600 mb-2 w-full overflow-hidden text-ellipsis" onClick={changeText}>{card.name}</p>
        <BoolChart data={card.data} startDate={card.createdAt} toggleEntry={toggleEntry} />
      </div>
      <a href={xIntentLink} target="_blank">
        <button className="text-[10px] py-1 font-bold text-gray-500 w-full hover:bg-gray-200 flex items-center space-x-2 justify-center">Share on <XLogo />
        </button>
      </a>
    </div>
  )
}

const getEntryIndex = (i: number, j: number) => i * 7 + j + 1
function isCurrDay(week: number, day: number) {
  const currDay = new Date().getDate()
  return currDay === getEntryIndex(week, day)
}
export const BoolChart = (props: { data: boolean[]; startDate: Date; toggleEntry: (index: number) => void }) => {
  const { data, startDate, toggleEntry } = props;

  const chunks = React.useMemo(() => chunk(data, 7), [data]);


  return (
    <table className={`table border-collapse w-full ${startDate.getMonth() !== new Date().getMonth() ? "pointer-events-none" : ""}`}>
      <div className={`flex items-center justify-center w-full h-full absolute top-0 left-0 right-0 bottom-0 bg-gray-50 opacity-70 font-bold text-3xl text-red-400 ${startDate.getMonth() !== new Date().getMonth() ? "block visible" : "invisible"}`}>Archived</div>
      <tbody>
        {chunks.map((week, i) => (
          <tr className="table-row">
            <td className="text-gray-600 text-[10px] font-bold w-2 h-2">w{i}</td>
            {week.map((day, j) => (
              <td onClick={() => toggleEntry(getEntryIndex(i, j) - 1)} className={`cursor-pointer table-cell w-4 h-4 border border-gray-500 ${getEntryIndex(i, j) < startDate.getDate() ? "bg-gray-800" : day ? "bg-green-500" : "bg-gray-200"} ${isCurrDay(i, j) ? "border-2 border-blue-500" : ""} `}></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export const XLogo = () => {
  return (
    <svg className="ml-1" width="10" height="10" viewBox="0 0 1200 1227" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="#4B5563" />
    </svg>
  )
}

export default App
