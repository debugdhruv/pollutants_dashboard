"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { authAPI } from "@/Api/apiServer"
import { useRouter } from "next/navigation"
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const handleSubmit = async(e) => {
    e.preventDefault()
    const payloadData = {
      email:email,
      password:password
    }
   try {
     const response = await authAPI.login(payloadData);
     console.log(response,"response")
     if(response.success){
      console.log("yyysysysys");
      localStorage.setItem("userData",JSON.stringify(response.data))
      router.push("/")
     }
     else{

     }
   } catch (error) {
    console.log(error);
   }

    // later: call backend /api/auth/login
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </CardFooter>
      </Card>
    </div>
  )
}