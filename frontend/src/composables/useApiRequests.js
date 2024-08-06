import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const useApiRequests = () => {
  const toast = useToast()
  const router = useRouter()

  const get = async (url) => {
    try {
      const response = await axios.get(url)
      return response.data
    } catch (error) {
      let message = ''

      switch (error.response.status) {
        case 400:
          message = 'Please check your input and try again.'
          break
        case 401:
          message = 'Session expired. Try signing in again.'
          router.push('/login')
          break
        case 403:
          message = 'You do not have permission to do that!'
          router.push('/')
          break
        case 404:
          message =
            "We couldn't find what you were looking for. Please try again."
          break
        default:
          message = 'An error occurred on our end. Sorry!'
          break
      }

      toast.error(message)
    }
  }

  return {
    get
  }
}

export default useApiRequests
