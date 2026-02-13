interface Props {
  image: string | null;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: Props) {
  if (!image) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} onClick={onClose}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-transparent border-0">
          <div className="modal-body p-0 text-center position-relative">
            <img src={image} className="img-fluid rounded-3 selected-image" />
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3 bg-light rounded-circle"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
