import React from "react"

interface FieldProps {
 label: string
 type?: "text" | "textarea" | "select"
 placeholder?: string
 value?: string
 options?: string[]
 onChange?: (value: string) => void
 multiline?: boolean
}

export const FormField: React.FC<FieldProps> = ({
 label,
 type = "text",
 placeholder,
 value,
 options,
 onChange,
 multiline,
}) => {
 const handleChange = (
  e: React.ChangeEvent<
   HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >,
 ) => {
  onChange?.(e.target.value)
 }

 return (
  <div className="flex flex-col gap-[5px] mb-[14px]">
   <label className="font-black text-[10px] font-heavy uppercase tracking-[0.16em] text-[#AAAAAA]">
    {label}
   </label>

   {type === "select" && options ? (
    <select
     value={value}
     onChange={handleChange}
     className="
            w-full px-[10px] py-[10px]
            border-[3px] border-black rounded-md
            bg-white
            font-black text-[13px] uppercase tracking-wide
            text-black outline-none
            shadow-[3px_3px_0_black]
            cursor-pointer
            appearance-none
            focus:shadow-[4px_4px_0_#00CCFF] focus:border-[#00CCFF]
            bg-none
            pr-[36px]
          ">
     {options.map((opt, i) => (
      <option key={i} value={opt}>
       {opt}
      </option>
     ))}
    </select>
   ) : type === "textarea" || multiline ? (
    <textarea
     value={value}
     onChange={handleChange}
     placeholder={placeholder}
     className="
            w-full px-[10px] py-[10px]
            border-[3px] border-black rounded-md
            bg-white
            font-sans text-[14px]
            text-black outline-none
            shadow-[3px_3px_0_black]
            transition-shadow duration-75
            min-h-[90px] resize-vertical
            focus:shadow-[4px_4px_0_#00CCFF] focus:border-[#00CCFF]
            placeholder:text-[#AAAAAA]
          "
    />
   ) : (
    <input
     type="text"
     value={value}
     onChange={handleChange}
     placeholder={placeholder}
     className="
            w-full px-[10px] py-[10px]
            border-[3px] border-black rounded-md
            bg-white
            font-sans text-[14px]
            text-black outline-none
            shadow-[3px_3px_0_black]
            transition-shadow duration-75
            focus:shadow-[4px_4px_0_#00CCFF] focus:border-[#00CCFF]
            placeholder:text-[#AAAAAA]
          "
    />
   )}
  </div>
 )
}
