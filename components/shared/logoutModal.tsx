"use client"

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import Image from "next/image"

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-[#1F2022]/2 backdrop-blur-[2px]" />
      <DialogContent className=" bg-[#1F2022] border-none  p-5 w-full !rounded-[10px]">
        <VisuallyHidden>
          <DialogTitle>Logout Confirmation</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/assets/logo.png" alt="EXODUS logo" width={100} height={100} className="w-[200px] h-[145px]" />
          </div>

          {/* Question */}
          <div className="text-center">
            <p className="text-[#C0A05C] text-[35px] font-semibold ">Are You Sure To Log Out?</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 w-full">
            <Button
              onClick={onConfirm}
              className="flex-1 h-10  text-[#1F2022] font-medium rounded-[6px]"
              style={{
                background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
              }}
            >
              Yes
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-10  text-[#1F2022]  font-medium rounded-[6px]"
              style={{
                background: "linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)",
              }}
            >
              No
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
