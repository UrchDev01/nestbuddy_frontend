'use client';

import Image from "next/image"
import { customButtonProps } from "@/types"
import { Loader } from "lucide-react"


const Button = ({ title, containerStyles, handleClick, btnType, textStyles, rightIcon, isDisabled, isLoading, isLoadingText }: customButtonProps) => {
        return (
                <button
                        disabled={isDisabled}
                        type={btnType || "button"}
                        className={`custom-btn ${containerStyles} `}
                        onClick={handleClick}
                >
                        {isLoading ? (
                                <div className="w-full flex justify-center items-center text-center font-bold text-white-1">
                                        <p>{isLoadingText}</p>
                                        <Loader size={25} className="animate-spin ml-2" />
                                </div>

                        ) : (
                                <>
                                        <span className={`flex-1 ${textStyles}`}>{title}</span>
                                        {rightIcon && (
                                                <span className="text-center flex items-center justify-center">{rightIcon}</span>
                                        )}
                                </>


                        )}



                </button>
        )
}

export default Button