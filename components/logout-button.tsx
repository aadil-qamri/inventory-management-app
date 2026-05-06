"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  return (
    <Button 
      variant="outline" 
      // signOut automatically destroys the session and sends them to the callbackUrl
      onClick={() => signOut({ callbackUrl: "/login" })} 
      className="justify-center"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}