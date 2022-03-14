import '../../App.css'
import Header from '../../components/Header'
import Main from '../../components/Main'

export default function Home() {
  const gameStatus = null
  return (
    <>
      <Header>
        Airlock{' '}
        <span className="ml-2 text-sm text-gray-600">
          SpaceTraders Web Client
        </span>
      </Header>
      <Main>
        <pre className="text-xs">{JSON.stringify(gameStatus, null, 2)}</pre>
      </Main>
    </>
  )
}
