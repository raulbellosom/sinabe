import { API_URL } from '../services/api';
import NoImageFound from '../assets/images/NoImageFound.jpg';

export const FormattedUrlImage = (src) => {
  if (!src) {
    return NoImageFound;
  }
  console.log(src instanceof File);
  if (src instanceof File) {
    return URL.createObjectURL(src);
  }

  if (typeof src === 'string') {
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    } else {
      const formattedUrl = `${API_URL}${src}`;
      return formattedUrl;
    }
  }

  return NoImageFound;
};
