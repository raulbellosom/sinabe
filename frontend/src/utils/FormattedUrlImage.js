import { API_URL } from '../services/api';

const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const FormattedUrlImage = (image) => {
  if (!image) {
    return null;
  }

  if (image instanceof File) {
    try {
      return URL.createObjectURL(image);
    } catch (e) {
      console.error(
        'FormattedUrlImage: Error creating object URL for file/blob:',
        e,
      );
      return null;
    }
  }

  if (typeof image === 'string') {
    if (isValidHttpUrl(image)) {
      return image;
    } else {
      const cleanedPath = image.startsWith('/') ? image.substring(1) : image;
      const fullUrl = `${API_URL}/${cleanedPath}`;

      return fullUrl;
    }
  }

  if (typeof image === 'object' && image !== null) {
    const possibleProps = ['url', 'path', 'thumbnail'];

    for (const propName of possibleProps) {
      const propUrl = image[propName];
      if (propUrl && typeof propUrl === 'string') {
        if (isValidHttpUrl(propUrl)) {
          console.log(
            `FormattedUrlImage: Found valid http URL in image.${propName}:`,
            propUrl,
          );
          return propUrl;
        } else {
          const cleanedPath = propUrl.startsWith('/')
            ? propUrl.substring(1)
            : propUrl;
          const fullUrl = `${API_URL}/${cleanedPath}`;

          return fullUrl;
        }
      }
    }
  }

  return null;
};
