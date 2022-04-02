import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { registerNewAgent } from '../../api/routes/agents'
import '../../App.css'
import Alert from '../../components/Alert'
import LoadingSpinner from '../../components/LoadingSpinner'
import Modal from '../../components/Modal/index'
import { CubeTransparentIcon } from '@heroicons/react/outline'
import { useAuth } from '../../hooks/useAuth'
import {
  getValue,
  setValue,
  removeValue,
  API_TOKEN_KEY,
} from '../../utils/browserStorage'

export default function Login() {
  const [randomBackgroundIndex, setRandomBackgroundIndex] = useState(0)
  const [registerForm, setRegisterForm] = useState({
    symbol: '',
    faction: '',
    rememberMe: false,
  })
  const [loginForm, setLoginForm] = useState({
    apiToken: '',
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState<string>()
  const [loginError, setLoginError] = useState<string>()
  const [useExistingToken, setUseExistingToken] = useState(false)
  const [attemptingLogin, setAttemptingLogin] = useState(false)

  const auth = useAuth()
  const { state }: any = useLocation()

  useEffect(() => {
    setRandomBackgroundIndex(Math.floor(Math.random() * 3) + 1)

    const attemptLogin = async (apiToken: string) => {
      if (attemptingLogin || useExistingToken) {
        return
      }
      try {
        setAttemptingLogin(true)
        await auth.signin(apiToken, state?.from || '/')
      } catch (error: any) {
        setAttemptingLogin(false)
        setRegistrationError(error.message || 'Error logging in')
      }
    }
    const storedToken = getValue(API_TOKEN_KEY, true) ?? getValue(API_TOKEN_KEY)
    if (storedToken) {
      attemptLogin(storedToken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegister = async (
    symbol: string,
    faction: string,
    rememberMe: boolean
  ) => {
    setLoading(true)
    setRegistrationError(undefined)
    try {
      const response = await registerNewAgent(symbol, faction)
      if (!response) {
        throw new Error()
      }
      setValue(API_TOKEN_KEY, response.data.token, rememberMe)
      await auth.signin(response.data.token, '/')
    } catch (error: any) {
      setRegistrationError(error.message || 'Error generating token')
      removeValue(API_TOKEN_KEY, rememberMe)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (apiToken: string, rememberMe: boolean) => {
    setLoading(true)
    setLoginError(undefined)
    try {
      setValue(API_TOKEN_KEY, apiToken, rememberMe)
      await auth.signin(apiToken, '/')
    } catch (error: any) {
      if (error.code === 40101) {
        setLoginError('Token was invalid.')
      } else {
        setLoginError(error.message || 'Error logging in.')
      }
      removeValue(API_TOKEN_KEY, rememberMe)
    } finally {
      setLoading(false)
    }
  }

  const registrationLoading = loading && !useExistingToken
  const loginLoading = loading && useExistingToken

  if (attemptingLogin) {
    return (
      <div className="flex min-h-screen bg-white">
        <div className="flex w-full flex-1 flex-col items-center justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <h1 className="inline-flex animate-gradient-x items-baseline bg-gradient-to-r from-sky-400 via-purple-500 to-indigo-500 bg-clip-text text-center text-8xl font-extrabold text-transparent">
            Airlock{' '}
            <span className="ml-4 inline-flex items-center px-2.5 text-sm font-medium">
              v2 Alpha
            </span>
          </h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex min-h-screen bg-white">
        <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <CubeTransparentIcon className="h-8 w-8" />
              <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
                Airlock
              </h1>
              <p className="max-w mt-2 text-sm text-gray-600">
                A{' '}
                <a
                  href="https://spacetraders.io"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  SpaceTraders API
                </a>{' '}
                web app made with React by{' '}
                <a
                  href="https://github.com/elilambnz"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  elilambnz
                </a>
              </p>

              <h2 className="mt-12 text-3xl font-extrabold text-gray-900">
                Create your account
              </h2>
              <p className="max-w mt-2 text-sm text-gray-600">
                Or{' '}
                <button
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setUseExistingToken(true)}
                >
                  use existing credentials
                </button>
              </p>
            </div>

            <div className="mt-6">
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="usernameRegister"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Symbol
                  </label>
                  <div className="mt-1">
                    <input
                      id="usernameRegister"
                      name="usernameRegister"
                      type="text"
                      autoComplete="off"
                      autoFocus
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          symbol: e.target.value.trim(),
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="factionRegister"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Faction
                  </label>
                  <div className="mt-1">
                    <input
                      id="factionRegister"
                      name="factionRegister"
                      type="text"
                      autoComplete="off"
                      autoFocus
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          faction: e.target.value.trim(),
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMeRegister"
                      name="rememberMeRegister"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          rememberMe: e.target.checked,
                        }))
                      }
                    />
                    <label
                      htmlFor="rememberMeRegister"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className={
                      'flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                      (registrationLoading
                        ? ' cursor-not-allowed opacity-50'
                        : '')
                    }
                    disabled={registrationLoading}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!registerForm.symbol || !registerForm.faction) {
                        return
                      }
                      handleRegister(
                        registerForm.symbol,
                        registerForm.faction,
                        registerForm.rememberMe
                      )
                    }}
                  >
                    {!registrationLoading ? (
                      <>Create account</>
                    ) : (
                      <>
                        Authenticating
                        <div className="ml-2">
                          <LoadingSpinner />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {registrationError && (
              <div className="mt-6 max-w-4xl">
                <Alert
                  title="Error creating account"
                  message={registrationError || ''}
                />
              </div>
            )}
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          {randomBackgroundIndex > 0 && (
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={require(`../../assets/img/login-bg-${randomBackgroundIndex}.jpg`)}
              alt=""
            />
          )}
        </div>
      </div>
      <Modal
        open={useExistingToken}
        title="Use existing credentials"
        content={
          <div className="mt-4 px-4 py-2">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="apiToken"
                  className="block text-sm font-medium text-gray-700"
                >
                  API Token
                </label>
                <div className="mt-1">
                  <input
                    id="apiToken"
                    name="apiToken"
                    type="text"
                    autoComplete="off"
                    autoFocus
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        apiToken: e.target.value.trim(),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMeLogin"
                    name="rememberMeLogin"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        rememberMe: e.target.checked,
                      }))
                    }
                  />
                  <label
                    htmlFor="rememberMeLogin"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className={
                    'flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2' +
                    (loginLoading ? ' cursor-not-allowed opacity-50' : '')
                  }
                  disabled={loginLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    if (!loginForm.apiToken) {
                      return
                    }
                    handleLogin(loginForm.apiToken, loginForm.rememberMe)
                  }}
                >
                  {!loginLoading ? (
                    <>Login</>
                  ) : (
                    <>
                      Authenticating
                      <div className="ml-2">
                        <LoadingSpinner />
                      </div>
                    </>
                  )}
                </button>
              </div>

              {loginError && (
                <div className="mt-6 max-w-4xl">
                  <Alert title="Error logging in" message={loginError || ''} />
                </div>
              )}
            </form>
          </div>
        }
        closeText="Close"
        onClose={() => {
          setUseExistingToken(false)
          setLoginError(undefined)
        }}
      />
    </>
  )
}
