'use client'

import Container from '~components/container'
import PageHero from '~components/page-hero'
import { useUser } from '~providers/user-provider'
import ChartGradientGreenIcon from '~icons/chart-gradient-green.svg'
import ChartGradientBlueIcon from '~icons/chart-gradient-blue.svg'
import ChartGradientRedIcon from '~icons/chart-gradient-red.svg'
import PercentageUpIcon from '~icons/percentage-up.svg'
import PercentageDownIcon from '~icons/percentage-down.svg'
import CupCircleIcon from '~icons/cup-circle.svg'
import { useMemo } from 'react'
import LineChart from '~components/charts/line'
import MessagesIcon from '~icons/messages.svg'

export default function PageContent() {
  const { user } = useUser()

  const infoSections = [
    {
      title: 'Total active users',
      value: 4560,
      icon: <ChartGradientGreenIcon width={52} height={35} />,
      percentage: 32,
    },
    {
      title: 'Total messages sent',
      value: 24678,
      icon: <ChartGradientBlueIcon width={52} height={35} />,
      percentage: -32.8,
    },
    {
      title: 'Total files attached',
      value: 1562,
      icon: <ChartGradientRedIcon width={52} height={35} />,
      percentage: 32,
    },
  ]

  const topPerformingRooms = [
    {
      name: 'Room 1',
      value: 2000,
    },
    {
      name: 'Room 2',
      value: 1500,
    },
    {
      name: 'Room 3',
      value: 1000,
    },
  ]

  const chartData = useMemo(() => {
    const labels = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
    ]
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Room 1',
          data: [1900, 2200, 1950, 2120, 1500, 1700, 2000],
          fill: false,
          borderColor: '#4ade80',
          tension: 0.1,
        },
        {
          label: 'Room 2',
          data: [1200, 1000, 1700, 1300, 1300, 1200, 1500],
          fill: false,
          borderColor: '#93c5fd',
          tension: 0.1,
        },
        {
          label: 'Room 3',
          data: [1100, 1300, 1000, 1200, 1000, 1100, 1000],
          fill: false,
          borderColor: '#d8b4fe',
          tension: 0.1,
        },
        {
          label: 'Room 4',
          data: [900, 1000, 1100, 1000, 1000, 900, 1000],
          fill: false,
          borderColor: '#fda4af',
          tension: 0.1,
        },
        {
          label: 'Room 5',
          data: [700, 800, 900, 800, 800, 700, 800],
          fill: false,
          borderColor: '#fdba74',
          tension: 0.1,
        },
      ],
    }

    return data
  }, [])

  return (
    <Container as="main" className="py-10">
      <PageHero
        title="Dashboard"
        description={`Welcome Back, ${user?.username} 👋`}
      />

      <section className="mt-6 grid grid-cols-3 gap-4">
        {infoSections.map((section) => (
          <InfoSection key={section.title} {...section} />
        ))}
      </section>

      <section className="mt-6 rounded-lg p-6 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
        <h2 className="text-lg font-bold">Most popular rooms</h2>
        <p className="font-medium text-gray-500">By monthly sent messages</p>
        <div >

        <LineChart data={chartData} className="w-full h-48 mt-4" />
        {/* <ol className="mt-4 list-none p-0 grid gap-4 content-start">
          {topPerformingRooms.map((room) => (
            <li
              key={room.name}
              className="group flex items-center justify-between gap-4"
            >
              <span className="grid">
                <span className="text-sm font-semibold">{room.name}</span>
                <span className='flex items-center gap-2'><MessagesIcon className="size-4 min-w-4 text-gray-500" /> <span className="text-sm text-gray-500"> {room.value}</span></span>
              </span>

              <CupCircleIcon className="size-10 min-w-10 text-gray-400 group-first-of-type:text-amber-300 group-last-of-type:text-amber-600" />
            </li>
          ))}
        </ol> */}
          </div>
      </section>
    </Container>
  )
}

type InfoSectionProps = {
  title: string
  value: number
  icon: React.ReactNode
  percentage: number
}

const InfoSection = ({ title, value, icon, percentage }: InfoSectionProps) => {
  const isPositive = percentage > 0
  return (
    <div className="flex items-center justify-between rounded-lg p-6 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)]">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="mt-4 flex items-center gap-2">
          {isPositive ? (
            <PercentageUpIcon width={20} height={20} />
          ) : (
            <PercentageDownIcon width={20} height={20} />
          )}
          <span className="text-sm font-semibold">
            {isPositive ? '+' : ''}
            {percentage}%
          </span>
        </div>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </div>
      <div className="flex items-center justify-center">{icon}</div>
    </div>
  )
}
