import React, { useEffect } from 'react'
import { generateToken } from '../../api/routes/users'
import { useAuth } from '../../App'
import '../../App.css'
import Alert from '../../components/Alert'
import SimpleModal from '../../components/Modal/SimpleModal'

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

  const auth = useAuth()

  useEffect(() => {
    setRandomBackgroundIndex(Math.floor(Math.random() * 3) + 1)
  }, [])

  useEffect(() => {
    const apiToken = auth.apiToken
    const storedToken =
      localStorage.getItem('al-api-token') ??
      sessionStorage.getItem('al-api-token')
    console.info('Restored token:', !!storedToken)

    if (!apiToken && storedToken) {
      // Attempt sign in with existing token
      setLoading(true)
      auth.signin(storedToken)
    }
  }, [auth])

  const handleRegister = async (username: string, rememberMe: boolean) => {
    setLoading(true)
    setRegistrationError(undefined)
    try {
      const response = await generateToken(username)
      if (!response) {
        setRegistrationError('Error generating token')
        return
      }
      if (rememberMe) {
        localStorage.setItem('al-api-token', response.token)
      } else {
        sessionStorage.setItem('al-api-token', response.token)
      }
      auth.signin(response.token)
    } catch (error: any) {
      setRegistrationError(error.message || 'Error generating token')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (apiToken: string, rememberMe: boolean) => {
    setLoading(true)
    setLoginError(undefined)
    try {
      console.log('handleLogin', apiToken, rememberMe)
      if (rememberMe) {
        localStorage.setItem('al-api-token', apiToken)
      } else {
        sessionStorage.setItem('al-api-token', apiToken)
      }
      auth.signin(apiToken)
    } catch (error: any) {
      setRegistrationError(error.message || 'Error logging in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
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
                        className="ml-2 block text-sm text-gray-900"
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
                      Create account
                      {loading && (
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
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {registrationError && (
                <div className="mt-6">
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
                      className="ml-2 block text-sm text-gray-900"
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
                    Use token
                    {loading && (
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
                    )}
                  </button>
                </div>

                {loginError && (
                  <div className="mt-6">
                    <Alert message={loginError} />
                  </div>
                )}
              </form>
            </div>
          }
          handleClose={() => setUseExistingToken(false)}
        />
      )}
    </>
  )
}

export default Login
