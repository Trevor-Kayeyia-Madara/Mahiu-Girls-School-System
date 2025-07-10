import { createContext, useContext } from "react"

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

// will add actual provider in next stage
