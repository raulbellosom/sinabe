import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import NoImageFound from '../../assets/images/NoImageFound.jpg';
import { FormattedUrlImage } from '../../utils/FormatImageUrl';

const ImageViewer = ({ images = [] }) => {
  console.log(images);
  return (
    <PhotoProvider
      brokenElement={
        <img
          className="w-80 h-auto rounded-lg object-cover"
          src={NoImageFound}
          alt="NoImageFound"
        />
      }
      maskOpacity={0.8}
      loop={true}
      speed={() => 200}
      toolbarRender={({ rotate, onRotate }) => {
        return (
          <svg
            className="PhotoView-Slider__toolbarIcon"
            onClick={() => onRotate(rotate + 90)}
          />
        );
      }}
    >
      <div className="grid grid-cols-12 gap-3">
        {images.map((image, index) => (
          <div key={index} className="col-span-6 md:col-span-3">
            <PhotoView
              src={() => FormattedUrlImage(image.path)}
              alt={`Image ${index + 1}`}
              className="w-full h-48 object-cover"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </PhotoProvider>
  );
};

export default ImageViewer;
