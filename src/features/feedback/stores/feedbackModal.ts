import { atom, useAtomValue, useSetAtom } from "jotai";

const feedbackModalOpenAtom = atom<boolean>(false);

export const useFeedbackModalOpen = () => useAtomValue(feedbackModalOpenAtom);
export const useSetFeedbackModalOpen = () => useSetAtom(feedbackModalOpenAtom);
