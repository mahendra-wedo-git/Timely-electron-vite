import { FieldError, get, useFormContext } from "react-hook-form";
import { useState } from "react";
import { convertCamelCaseToWords } from "src/utils";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

interface InputProps extends Omit<React.HTMLProps<HTMLInputElement>, "label"> {
  name: string;
  label?: React.ReactNode;
  labelClass?: string;
  formGroupClass?: string;
  FormControl?: string;
  hasPrompt?: boolean;
  isLogin?: boolean;
  iconVariant?: "white" | "grey";
  errorMsg?: string;
}

export const Input: React.FC<InputProps> = (props) => {
  const {
    name,
    label,
    labelClass = "",
    type,
    formGroupClass = "",
    FormControl = "",
    hasPrompt = false,
    isLogin = false,
    iconVariant,
    errorMsg = "",
    ...rest
  } = props;

  const context = useFormContext();
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const passwordRules = [
    { text: "At least 6 characters", regex: /.{6,}/ },
    {
      text: "Upper and lowercase characters",
      regex: /^(?=.*[a-z])(?=.*[A-Z])/,
    },
    { text: "At least one number", regex: /^(?=.*\d)/ },
    { text: "At least 1 special character", regex: /[^A-Za-z0-9\s]/ },
  ];

  if (context) {
    const {
      register,
      formState: { errors },
      watch,
    } = context;

    const passwordValue = watch(name);
    const errorMessage = (get(errors, name) as FieldError)?.message;

    /* ---------------------------------------------------------
       PASSWORD INPUT
    --------------------------------------------------------- */
    if (type === "password") {
      return (
        <>
          {label && (
            <label
              className={`
                text-secondary text-[20px] font-medium w-full pb-4 inline-block
                2xl:text-[18px] 2xl:pb-3
                xl:text-[18px] xl:pb-3
                md:text-[16px] md:pb-3
                ${labelClass}
              `}
            >
              {label}
            </label>
          )}

          <div className={`relative flex-1 ${formGroupClass}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={isPasswordVisible ? "text" : "password"}
              className={`
                w-full py-6 px-5 text-[18px] text-mainBlack border border-transparent font-normal
                bg-[#F2F2F2]
                placeholder:text-[#8B8B8B] placeholder:text-[18px]

                focus:border-transparent focus:shadow-none focus:outline-none
                focus:bg-[#F2F2F2] focus:text-mainBlack

                ${isLogin ? "bg-transparent border-white text-white placeholder:text-white focus:border-white" : ""}
                ${FormControl}
              `}
              {...register(name as string)}
              {...rest}
              autoComplete="off"
              onFocus={() => setShowPasswordPrompt(true)}
              onBlur={() => setShowPasswordPrompt(false)}
            />

            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 right-5 bg-transparent border-none cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {isPasswordVisible ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Password Prompt */}
          {showPasswordPrompt && hasPrompt && (
            <div
              className="
                absolute top-[calc(100%+22px)] left-3 right-0 w-[calc(100%-24px)]
                bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.25)]
                p-9 z-10 flex justify-center
              "
            >
              <div>
                <span className="text-black font-medium text-[14px] mb-3 inline-block w-full">
                  Your password must have:
                </span>

                {passwordRules.map(({ text, regex }, idx) => {
                  const isValid = regex.test(passwordValue || "");

                  return (
                    <div key={idx} className="flex mb-2 pb-1 items-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                          stroke={isValid ? "#306AED" : "#B6130F"}
                        />
                        {isValid ? (
                          <path
                            d="M8 11.898L11.0316 15L17 9"
                            stroke="#306AED"
                            strokeLinecap="square"
                          />
                        ) : (
                          <>
                            <path
                              d="M9.14286 14.8572L14.8571 9.14293"
                              stroke="#B6130F"
                              strokeLinecap="square"
                            />
                            <path
                              d="M9.14286 9.14279L14.8571 14.8571"
                              stroke="#B6130F"
                              strokeLinecap="square"
                            />
                          </>
                        )}
                      </svg>

                      <span className="text-[14px] font-normal ps-2 ms-1 flex items-center">
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {hasPrompt ? (
            <>
              {errorMessage && !showPasswordPrompt && (
                <span
                  className={`${errorMsg} text-red-500 pt-2 inline-block text-[14px]`}
                >
                  {convertCamelCaseToWords(errorMessage as string)}
                </span>
              )}
            </>
          ) : (
            <>
              {errorMessage && (
                <span
                  className={`${errorMsg} text-red-500 pt-2 inline-block text-[14px]`}
                >
                  {convertCamelCaseToWords(errorMessage as string)}
                </span>
              )}
            </>
          )}
        </>
      );
    }

    /* ---------------------------------------------------------
       REGULAR INPUT
    --------------------------------------------------------- */
    return (
      <>
        {label && (
          <label
            className={`
              text-secondary text-[20px] font-medium w-full pb-4 inline-block
              2xl:text-[18px] 2xl:pb-3
              xl:text-[18px] xl:pb-3
              md:text-[16px] md:pb-3
              ${labelClass}
            `}
            htmlFor={name}
          >
            {label}
          </label>
        )}
        <div className={` relative flex-1 ${formGroupClass}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className={`
              w-full py-6 px-5 text-[18px] text-mainBlack border border-transparent font-normal
              bg-[#F2F2F2] placeholder:text-[#8B8B8B]

              focus:border-transparent focus:outline-none
              focus:bg-[#F2F2F2]

              ${isLogin ? "bg-transparent border-white text-white placeholder:text-white focus:border-white" : ""}
              ${FormControl}
            `}
            {...register(name as string)}
            {...rest}
            autoComplete="off"
          />
        </div>

        {errorMessage && (
          <span
            className={`${errorMsg} text-red-500 pt-2 inline-block text-[14px] w-full text-start`}
          >
            {convertCamelCaseToWords(errorMessage as string)}
          </span>
        )}
      </>
    );
  }

  /* ---------------------------------------------------------
     FALLBACK INPUT (NO RHF CONTEXT)
  --------------------------------------------------------- */
  return (
    <div className={`${formGroupClass}`}>
      {label && (
        <label
          className={`
            text-secondary text-[20px] font-medium w-full pb-4 inline-block
            ${labelClass}
          `}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        className={`
          w-full py-6 px-5 text-[18px] bg-[#F2F2F2] border border-transparent
          placeholder:text-[#8B8B8B]
          ${isLogin ? "bg-transparent border-white text-white" : ""}
          ${FormControl}
        `}
        {...rest}
      />
    </div>
  );
};
