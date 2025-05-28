"use client"

import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface LogoutModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogOverlay className="bg-[#1F2022]/90" />
            <DialogContent className="sm:max-w-md bg-[#1F2022] border-none  p-8">
                <div className="flex flex-col items-center space-y-6">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <Image src="/assets/logo.png" alt="EXODUS logo" width={100} height={100} className="w-30 h-30" />
                    </div>

                    {/* EXODUS text */}
                    <div className="text-center">
                        <h2 className="text-[#C0A05C] text-xl font-bold tracking-wider">EXODUS</h2>
                    </div>

                    {/* Question */}
                    <div className="text-center">
                        <p className="text-[#C0A05C] text-lg font-medium">Are You Sure To Log Out?</p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 w-full">
                        <Button
                            onClick={onConfirm}
                            className="flex-1 h-10  text-[#1F2022] font-medium rounded-[6px]"
                            style={{
                                background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
                            }}
                        >
                            Yes
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 h-10  text-[#1F2022]  font-medium rounded-[6px]"
                            style={{
                                background: 'linear-gradient(287.15deg, #946329 0%, #F3E898 50%, #946329 100%)',
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
