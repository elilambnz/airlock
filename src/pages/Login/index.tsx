import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { generateToken } from '../../api/routes/users'
import { useAuth } from '../../App'
import '../../App.css'
import Alert from '../../components/Alert'
import SimpleModal from '../../components/Modal/SimpleModal'
import {
  getValue,
  setValue,
  removeValue,
  API_TOKEN_KEY,
} from '../../utils/browserStorage'

const Login = () => {
  const [randomBackgroundIndex, setRandomBackgroundIndex] = React.useState(0)
  const [registerForm, setRegisterForm] = React.useState({
    username: '',
    rememberMe: false,
  })
  const [loginForm, setLoginForm] = React.useState({
    apiToken: '',
    rememberMe: false,
  })
  const [loading, setLoading] = React.useState(false)
  const [registrationError, setRegistrationError] = React.useState<string>()
  const [loginError, setLoginError] = React.useState<string>()
  const [useExistingToken, setUseExistingToken] = React.useState(false)
  const [attemptingLogin, setAttemptingLogin] = React.useState(false)

  const auth = useAuth()
  const { state }: any = useLocation()

  useEffect(() => {
    setRandomBackgroundIndex(Math.floor(Math.random() * 3) + 1)
  }, [])

  useEffect(() => {
    const attemptLogin = async (apiToken: string) => {
      if (attemptingLogin) {
        return
      }
      try {
        setAttemptingLogin(true)
        await auth.signin(apiToken, state?.from || '/')
      } catch (error: any) {
        setRegistrationError(error.message || 'Error logging in')
      } finally {
        setAttemptingLogin(false)
      }
    }
    const storedToken = getValue(API_TOKEN_KEY, true) ?? getValue(API_TOKEN_KEY)
    if (storedToken) {
      attemptLogin(storedToken)
    }
  }, [auth, state])

  const handleRegister = async (username: string, rememberMe: boolean) => {
    setLoading(true)
    setRegistrationError(undefined)
    try {
      const response = await generateToken(username)
      if (!response) {
        throw new Error()
      }
      setValue(API_TOKEN_KEY, response.token, rememberMe)
      await auth.signin(response.token, '/')
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
      setLoginError(error.message || 'Error logging in')
      removeValue(API_TOKEN_KEY, rememberMe)
    } finally {
      setLoading(false)
    }
  }

  if (attemptingLogin) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="w-full flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <h1 className="text-center text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 via-purple-500 animate-gradient-x">
            Airlock
          </h1>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
              <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
                Airlock
              </h1>
              <p className="mt-2 text-sm text-gray-600 max-w">
                A{' '}
                <a
                  href="https://spacetraders.io"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  SpaceTraders API
                </a>{' '}
                web app written in React by{' '}
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
              <p className="mt-2 text-sm text-gray-600 max-w">
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
                    Username
                  </label>
                  <div className="mt-1">
                    <input
                      id="usernameRegister"
                      name="usernameRegister"
                      type="text"
                      autoComplete="off"
                      autoFocus
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onChange={(e) =>
                        setRegisterForm((prev) => ({
                          ...prev,
                          username: e.target.value,
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
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                      'w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' +
                      (loading ? ' cursor-not-allowed opacity-50' : '')
                    }
                    disabled={loading}
                    onClick={(e) => {
                      e.preventDefault()
                      if (!registerForm.username) {
                        return
                      }
                      handleRegister(
                        registerForm.username,
                        registerForm.rememberMe
                      )
                    }}
                  >
                    {!loading ? (
                      <>Create account</>
                    ) : (
                      <>
                        Authenticating
                        <svg
                          className="animate-spin ml-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {registrationError && (
              <div className="mt-6 max-w-4xl">
                <Alert message={registrationError} />
              </div>
            )}
          </div>
        </div>
        <div className="hidden lg:block relative w-0 flex-1">
          {randomBackgroundIndex > 0 && (
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={require(`../../assets/img/login-bg-${randomBackgroundIndex}.jpg`)}
              alt=""
            />
          )}
        </div>
      </div>
      {useExistingToken && (
        <SimpleModal
          title="Use existing credentials"
          content={
            <div className="mt-6">
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
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          apiToken: e.target.value,
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
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!loginForm.apiToken) {
                        return
                      }
                      handleLogin(loginForm.apiToken, loginForm.rememberMe)
                    }}
                  >
                    {!loading ? (
                      <>Login</>
                    ) : (
                      <>
                        Authenticating
                        <svg
                          className="animate-spin ml-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </>
                    )}
                  </button>
                </div>

                {loginError && (
                  <div className="mt-6 max-w-4xl">
                    <Alert message={loginError} />
                  </div>
                )}
              </form>
            </div>
          }
          handleClose={() => {
            setUseExistingToken(false)
            setLoginError(undefined)
          }}
        />
      )}
    </>
  )
}

export default Login
