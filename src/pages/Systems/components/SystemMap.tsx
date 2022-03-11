import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Scatter } from 'react-chartjs-2'
import moment from 'moment'
import { getProgress, getShipName } from '../../../utils/helpers'
import { getIconForLocationType, LocationType } from '../../../types/Location'
import { Ship } from '../../../types/Ship'
import { FlightPlanExternal } from '../../../types/FlightPlan'
import { useQuery } from 'react-query'
import { getSystemLocations } from '../../../api/routes/systems'

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend)

interface SystemMapProps {
  systemSymbol: string
  dockedShips: Ship[]
  myActiveFlightPlans: FlightPlanExternal[]
}

export default function SystemMap(props: SystemMapProps) {
  const { systemSymbol, dockedShips, myActiveFlightPlans } = props

  const [activeFlightPlanDataPoints, setActiveFlightPlanDataPoints] =
    useState<{ x: number; y: number }[]>()

  const systemLocations = useQuery(
    ['systemLocations', systemSymbol],
    () => getSystemLocations(systemSymbol ?? ''),
    {
      enabled: !!systemSymbol,
      staleTime: Infinity,
    }
  )

  useEffect(() => {
    let interval: NodeJS.Timer
    if (myActiveFlightPlans.length > 0) {
      interval = setInterval(() => {
        setActiveFlightPlanDataPoints(
          myActiveFlightPlans
            .map((fp) => {
              const from = systemLocations.data?.locations.find(
                (l) => l.symbol === fp.departure
              )
              const to = systemLocations.data?.locations.find(
                (l) => l.symbol === fp.destination
              )
              if (!from || !to) {
                return null
              }
              const progress = getProgress(
                moment(fp.createdAt),
                moment(fp.arrivesAt)
              )
              return {
                x: from.x! + (to.x! - from.x!) * (progress / 100),
                y: from.y! + (to.y! - from.y!) * (progress / 100),
              }
            })
            .filter(Boolean) as {
            x: number
            y: number
          }[]
        )
      }, 2000)
    } else {
      setActiveFlightPlanDataPoints(undefined)
    }

    return () => {
      clearInterval(interval)
    }
  }, [myActiveFlightPlans, systemLocations.data])

  return (
    <Scatter
      options={{
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                let label
                const raw = ctx.raw as any
                switch (raw.type) {
                  case 'location':
                    const l = systemLocations.data?.locations[ctx.dataIndex]
                    label =
                      `${getIconForLocationType(
                        LocationType[
                          l?.type as unknown as keyof typeof LocationType
                        ]
                      )} ${l?.name} ${l?.symbol}` ?? 'Unknown'
                    label += ` (${ctx.parsed.x}, ${ctx.parsed.y})`
                    break
                  case 'dockedShip':
                    label = `🚀 ${getShipName(dockedShips[ctx.dataIndex]?.id)}`
                    label += ` (${ctx.parsed.x}, ${ctx.parsed.y})`
                    break
                  case 'travellingShip':
                    label = `🚀 ${getShipName(
                      myActiveFlightPlans[ctx.dataIndex]?.shipId
                    )}`
                    label += ` (${ctx.parsed.x.toFixed()}, ${ctx.parsed.y.toFixed()})`
                    break
                  default:
                    return ''
                }
                return label
              },
            },
          },
        },
      }}
      data={{
        datasets: [
          {
            label: 'Docked ships',
            data: dockedShips.map((s) => ({
              x: s.x!,
              y: s.y!,
              type: 'dockedShip',
            })),
            backgroundColor: 'rgb(226, 232, 240)',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Travelling ships',
            data: activeFlightPlanDataPoints?.map((p) => ({
              x: p!.x,
              y: p!.y,
              type: 'travellingShip',
            })),
            backgroundColor: 'rgb(245, 158, 11)',
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Locations',
            data: systemLocations.data?.locations.map((l) => ({
              x: l.x,
              y: l.y,
              type: 'location',
            })),
            backgroundColor: 'rgb(99, 102, 241)',
            pointRadius: 10,
            pointHoverRadius: 12,
          },
          {
            label: 'Flight plan',
            data: myActiveFlightPlans
              .map((fp) => {
                const from = systemLocations.data?.locations.find(
                  (l) => l.symbol === fp.departure
                )
                const to = systemLocations.data?.locations.find(
                  (l) => l.symbol === fp.destination
                )
                if (!from || !to) {
                  return null
                }
                return [
                  {
                    x: from.x,
                    y: from.y,
                  },
                  {
                    x: to.x,
                    y: to.y,
                  },
                ]
              })
              .filter(Boolean)
              .flat() as {
              x: number
              y: number
              type: string
            }[],
            pointRadius: 10,
            pointHoverRadius: 12,
            showLine: true,
            borderDash: [10, 5],
          },
        ],
      }}
    />
  )
}
