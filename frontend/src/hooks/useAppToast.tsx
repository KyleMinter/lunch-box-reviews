import { useSnackbar } from "notistack";


const useAppToast = () => {
  const { enqueueSnackbar } = useSnackbar();

  return {
    success: (message: string) =>
      enqueueSnackbar(message, { 
        variant: 'success'
      }),
    error: (message: string) =>
      enqueueSnackbar(message, { 
        variant: 'error'
      })
  };
}

export default useAppToast;