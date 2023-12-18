import { toast } from 'react-toastify';

/**
 * import useToast from "@hooks/useToast";
 *
 * Toast нэмэх функцээ үүсгэх
 *      const { addToast } = useToast()
 *
 * addToast(
    * {
    *
        * Toast нэмэх нь
        * @param {string}      text        TOAST дээр харагдах msg
        * @param {number}      time        TOAST ийн харагдах хугацаа
        * @param {Function}    onClose     TOAST ийн хаагдах үеийн event
        * @param {string}      type        TOAST ийн төрөл
        * @param {string}      theme       TOAST theme
    *
    *
    * }
 * )
*/
export default function useToast()
{
    const addToast = ({ text, onClose, time=5000, type='success', theme='colored' }) =>
    {
        toast.dismiss()
        toast(
            text,
            {
                position: toast.POSITION.TOP_RIGHT,
                onClose: () => { if (onClose) onClose() },
                type: type,
                autoClose: time,
                theme,
                delay: 500
            },
        )
    }

    return addToast
}
