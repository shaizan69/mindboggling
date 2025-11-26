"use client";

import { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/useUIStore";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  title: string;
  children: ReactNode;
}

export function Modal({ title, children }: ModalProps) {
  const { modalOpen, currentModal, setModalOpen } = useUIStore();

  return (
    <Transition show={modalOpen} as={Fragment}>
      <Dialog onClose={() => setModalOpen(false)} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-xl font-bold text-white">
                  {title}
                </Dialog.Title>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

