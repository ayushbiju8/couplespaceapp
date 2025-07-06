import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

type User = {
    id: string;
    email: string;
    fullName: string;

}

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserFromToken = async () => {
            try {
                const token = await AsyncStorage.getItem("token");
                console.log("Token from storage:", token);
                if (token) {
                    const decodedUser: User = jwtDecode(token);
                    setUser(decodedUser)
                }
            } catch (error) {
                console.error("Failed to load token", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadUserFromToken();
    }, [])

    const login = async (token: string, userData: User) => {
        await AsyncStorage.setItem("token", token);
        setUser(userData);
    };


    const logout = async () => {
        await AsyncStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};