import React from 'react'
import { InputProps } from '@/types'

const Input = ({ type, name, value, placeholder, handleOnchange }: InputProps) => {
        return (

                <input className="input-class w-full p-2"
                        type={type}
                        name={name}
                        value={value}
                        placeholder={placeholder}
                        onChange={handleOnchange}
                        required

                />


        )
}

export default Input