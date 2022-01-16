import { useContext } from 'react'
import { AutomationContext } from '../providers/AutomationProvider'

const useAutomation = () => useContext(AutomationContext)

export default useAutomation
