"use client";

import * as Toast from "@radix-ui/react-toast";
import { cn } from "@repo/shared/utils";
import { useState, useCallback, useRef, useEffect } from "react";
import { createContext, useContext } from "react";

import { ToastType } from "../types";
import IconXCircle from "../icons/IconXCircle";
import IconErrorRect from "../icons/IconErrorRect";
import IconSuccessRect from "../icons/IconSuccessRect";
import IconInfoRect from "../icons/IconInfoRect";

const iconMap = {
  [ToastType.ERROR]: <IconErrorRect className="size-6 min-w-6" />,
  [ToastType.SUCCESS]: <IconSuccessRect className="size-6 min-w-6" />,
  [ToastType.INFO]: <IconInfoRect className="size-6 min-w-6" />,
  [ToastType.WARNING]: <IconInfoRect className="size-6 min-w-6" />,
};

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>(ToastType.INFO);

  const timerRef = useRef(0);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const showToast = useCallback(
    (toastMessage: string, toastType: ToastType = ToastType.INFO) => {
      setOpen(false);
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setOpen(true);
        setMessage(toastMessage);
        setType(toastType);
      }, 100);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          className={cn(
            "data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut flex items-center gap-3 rounded-xl border p-4 shadow-sm data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
            type === ToastType.ERROR && "border-red-500 bg-red-50 text-red-500",
            type === ToastType.SUCCESS &&
              "border-green-500 bg-green-50 text-green-500",
            type === ToastType.WARNING &&
              "border-yellow-500 bg-yellow-50 text-yellow-500",
            type === ToastType.INFO &&
              "border-blue-500 bg-blue-50 text-blue-500",
          )}
          open={open}
          onOpenChange={setOpen}
        >
          {iconMap[type]}

          <Toast.Description className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {message}
            </p>
          </Toast.Description>
          <Toast.Action className="[grid-area:_action]" asChild altText="Close">
            <button>
              <IconXCircle className="size-6 max-w-6 text-gray-900/50" />
            </button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport className="fixed right-0 bottom-0 z-[2147483647] m-0 flex w-[390px] max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)] outline-none [--viewport-padding:_25px]" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
