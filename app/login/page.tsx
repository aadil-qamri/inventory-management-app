"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardAction,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useSession, signIn } from "next-auth/react"

const Login = () => {
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("") // Added error state
  const router = useRouter()

  useEffect(() => {
    // Only redirect if we are SURE the user is logged in
    if (status === "authenticated") {
      router.replace("/")
    }
  }, [status, router])

  // 1. ADDED: The handler for standard email/password login
  const handleCredentialsLogin = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email,
        password: password,
      })

      if (res?.error) {
        setError(res.error) // Display the error from your API
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      setIsGoogleLoading(false)
      console.error("Google auth failed:", error)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-neutral-900 p-4">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
           <CardAction>
          <Button variant="link" onClick={() => router.push("/register")}>Sign Up</Button>
        </CardAction>
        </CardHeader>
        
        {/* 2. WRAPPED: The form now surrounds both Content and Footer */}
        <form onSubmit={handleCredentialsLogin}>
          <CardContent>
            <div className="flex flex-col gap-6">
              
              {/* 3. ADDED: Simple error display banner */}
              {error && (
                <div className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="username@domain.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="********" 
                  required 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col mt-6 gap-2">
            
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
            
            {/* 4. CHANGED: Added type="button" so it doesn't accidentally submit the form */}
            <Button 
              type="button" 
              onClick={loginWithGoogle} 
              variant="outline" 
              disabled={isGoogleLoading} 
              className="w-full"
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Login with Google
            </Button>
            
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login